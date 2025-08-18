import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Send, ArrowLeft } from 'lucide-react';

type Assignment = {
  id: string;
  due_at: string | null;
  assessments?: { title?: string | null } | null;
  classes?: { name?: string | null } | null;
};

type Submission = {
  id: string;
  assignment_id: string;
  status: string | null;
  score?: number | null;
  feedback?: string | null;
  updated_at?: string | null;
  answer_text?: string | null;         // optional
  submission_file_path?: string | null; // optional upload path
};

export default function StudentAssessmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const hasAnswer = true; // toggle to false if you didn't add answer_text

  // Get auth user for storage prefix
  const { data: userData } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  });
  const userId = userData?.id;

  // 1) Assignment
  const {
    data: assignment,
    isLoading: loadingAssignment,
    isError: errorAssignment,
    error: assignmentErr,
  } = useQuery({
    queryKey: ['assignment-detail', assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(`
          id, due_at,
          assessments ( title ),
          classes ( name )
        `)
        .eq('id', assignmentId)
        .maybeSingle();
      if (error) throw error;
      return data as Assignment | null;
    },
  });

  // 2) Submission
  const {
    data: submission,
    isLoading: loadingSubmission,
  } = useQuery({
    queryKey: ['my-submission', assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      const sel = 'id, assignment_id, status, score, feedback, updated_at, submission_file_path' + (hasAnswer ? ', answer_text' : '');
      const { data, error } = await supabase
        .from('student_submissions')
        .select(sel)
        .eq('assignment_id', assignmentId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Submission | null;
    },
  });

  // Local state
  const [answer, setAnswer] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (hasAnswer && submission?.answer_text != null) {
      setAnswer(submission.answer_text ?? '');
    }
  }, [submission, hasAnswer]);

  const canEdit = useMemo(() => submission?.status !== 'graded', [submission]);

  // Upsert submission (draft/submit)
  const upsert = useMutation({
    mutationFn: async (payload: { status: 'draft' | 'submitted'; answer_text?: string; submission_file_path?: string | null }) => {
      if (submission?.id) {
        const updateData: any = { status: payload.status };
        if (hasAnswer) updateData.answer_text = payload.answer_text ?? null;
        if (typeof payload.submission_file_path !== 'undefined') updateData.submission_file_path = payload.submission_file_path;
        const { error } = await supabase.from('student_submissions').update(updateData).eq('id', submission.id);
        if (error) throw error;
        return { id: submission.id };
      } else {
        const insertData: any = {
          assignment_id: assignmentId,
          status: payload.status,
        };
        if (hasAnswer) insertData.answer_text = payload.answer_text ?? null;
        if (typeof payload.submission_file_path !== 'undefined') insertData.submission_file_path = payload.submission_file_path;
        const { data, error } = await supabase.from('student_submissions').insert(insertData).select('id').single();
        if (error) throw error;
        return { id: data.id as string };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-submission', assignmentId] });
    },
  });

  const handleSaveDraft = async () => {
    try {
      await upsert.mutateAsync({
        status: 'draft',
        answer_text: hasAnswer ? answer : undefined,
      });
      alert('Draft saved.');
    } catch (e: any) {
      alert(`Save failed: ${e.message ?? e}`);
    }
  };

  const handleSubmit = async () => {
    if (submission?.status === 'graded') return;
    try {
      await upsert.mutateAsync({
        status: 'submitted',
        answer_text: hasAnswer ? answer : undefined,
      });
      alert('Submitted.');
    } catch (e: any) {
      alert(`Submit failed: ${e.message ?? e}`);
    }
  };

  // Upload file to Supabase Storage and link to submission
  const handleUpload = async () => {
    if (!file) return alert('Choose a file first.');
    if (!userId || !assignmentId) return alert('Missing user or assignment.');
    try {
      setUploading(true);
      const path = `${userId}/${assignmentId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('submissions').upload(path, file, { upsert: false });
      if (upErr) throw upErr;

      await upsert.mutateAsync({
        status: submission?.status === 'graded' ? 'graded' : (submission?.status as any) ?? 'draft',
        answer_text: hasAnswer ? answer : undefined,
        submission_file_path: path,
      });

      alert('File uploaded.');
      setFile(null);
    } catch (e: any) {
      alert(`Upload failed: ${e.message ?? e}`);
    } finally {
      setUploading(false);
    }
  };

  const openFile = async () => {
    if (!submission?.submission_file_path) return;
    const { data, error } = await supabase.storage.from('submissions').createSignedUrl(submission.submission_file_path, 60 * 10);
    if (error) return alert(error.message);
    window.open(data.signedUrl, '_blank');
  };

  if (loadingAssignment || loadingSubmission) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading assessment…</span>
      </div>
    );
  }

  if (errorAssignment || !assignment) {
    return (
      <div className="p-6">
        <GlassCard className="p-6">
          <div className="text-red-600 font-medium">Assessment not found</div>
          <div className="text-sm opacity-80 mt-1">{(assignmentErr as any)?.message ?? 'You may not have access to this assignment.'}</div>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/student/assessments')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Assessments
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/student/assessments')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <GlassCard className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{assignment.assessments?.title ?? 'Untitled assessment'}</h1>
            <div className="text-sm opacity-80">Class: {assignment.classes?.name ?? '—'}</div>
            <div className="text-sm opacity-80">
              Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : '—'}
            </div>
          </div>
          <div className="text-sm">
            <span className="opacity-70">Status:</span> {submission?.status ?? 'Not started'}
            {submission?.status === 'graded' && typeof submission.score === 'number' && (
              <span className="ml-2">• Score: {submission.score}</span>
            )}
          </div>
        </div>

        <div className="text-sm opacity-80">
          Please complete this assessment. You can optionally attach a file (audio or document) and/or type a response.
        </div>

        {/* Optional answer input */}
        {hasAnswer && (
          <div>
            <label className="block text-sm font-medium mb-2">Your answer</label>
            <textarea
              className="w-full rounded-xl border bg-background/50 p-3"
              rows={8}
              placeholder="Type your answer here…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submission?.status === 'graded'}
            />
          </div>
        )}

        {/* File upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Attachment (optional)</label>
          <div className="flex gap-2 items-center">
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} disabled={!canEdit || uploading} />
            <Button variant="secondary" onClick={handleUpload} disabled={!file || !canEdit || uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Upload
            </Button>
            <Button variant="outline" onClick={openFile} disabled={!submission?.submission_file_path}>
              Open file
            </Button>
          </div>
          {submission?.submission_file_path && (
            <div className="text-xs opacity-70">Saved: {submission.submission_file_path}</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="secondary" onClick={handleSaveDraft} disabled={!canEdit || upsert.isLoading}>
            <Save className="mr-2 h-4 w-4" /> Save draft
          </Button>
          <Button onClick={handleSubmit} disabled={!canEdit || upsert.isLoading}>
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
