import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
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
  // Optional column; if you don't add it, set hasAnswer=false below
  answer_text?: string | null;
};

export default function StudentAssessmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Toggle to false if you did NOT add the answer_text column.
  const hasAnswer = true;

  // 1) Load assignment details (RLS via membership)
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

  // 2) Load student submission (RLS ensures only own)
  const {
    data: submission,
    isLoading: loadingSubmission,
  } = useQuery({
    queryKey: ['my-submission', assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('id, assignment_id, status, score, feedback, updated_at' + (hasAnswer ? ', answer_text' : ''))
        .eq('assignment_id', assignmentId)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Submission | null;
    },
  });

  // Local input state (for optional answer)
  const [answer, setAnswer] = useState<string>('');
  useEffect(() => {
    if (hasAnswer && submission?.answer_text != null) {
      setAnswer(submission.answer_text ?? '');
    }
  }, [submission, hasAnswer]);

  const canEdit = useMemo(() => submission?.status !== 'graded', [submission]);

  // 3) Mutations (upsert draft / submit)
  const upsertDraft = useMutation({
    mutationFn: async (payload: { status: 'draft' | 'submitted'; answer_text?: string }) => {
      // If submission exists → update; else insert
      if (submission?.id) {
        const { error } = await supabase
          .from('student_submissions')
          .update({
            status: payload.status,
            ...(hasAnswer ? { answer_text: payload.answer_text ?? null } : {}),
          })
          .eq('id', submission.id);
        if (error) throw error;
        return { id: submission.id };
      } else {
        const insertData: any = {
          assignment_id: assignmentId,
          status: payload.status,
        };
        if (hasAnswer) insertData.answer_text = payload.answer_text ?? null;

        const { data, error } = await supabase
          .from('student_submissions')
          .insert(insertData)
          .select('id')
          .single();
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
      await upsertDraft.mutateAsync({ status: 'draft', answer_text: hasAnswer ? answer : undefined });
      alert('Draft saved.');
    } catch (e: any) {
      alert(`Save failed: ${e.message ?? e}`);
    }
  };

  const handleSubmit = async () => {
    if (submission?.status === 'graded') return;
    try {
      await upsertDraft.mutateAsync({ status: 'submitted', answer_text: hasAnswer ? answer : undefined });
      alert('Submitted.');
    } catch (e: any) {
      alert(`Submit failed: ${e.message ?? e}`);
    }
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
          <div className="text-sm opacity-80 mt-1">
            {(assignmentErr as any)?.message ?? 'You may not have access to this assignment.'}
          </div>
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
            <h1 className="text-xl font-semibold">
              {assignment.assessments?.title ?? 'Untitled assessment'}
            </h1>
            <div className="text-sm opacity-80">
              Class: {assignment.classes?.name ?? '—'}
            </div>
            <div className="text-sm opacity-80">
              Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : '—'}
            </div>
          </div>
          <div className="text-sm">
            <span className="opacity-70">Status:</span>{' '}
            {submission?.status ?? 'Not started'}
            {submission?.status === 'graded' && typeof submission.score === 'number' && (
              <span className="ml-2">• Score: {submission.score}</span>
            )}
          </div>
        </div>

        {/* Instructions placeholder (can be expanded later) */}
        <div className="text-sm opacity-80">
          Please complete this assessment. If available, type your response below and click “Save draft”. When you’re ready, click “Submit”.
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

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={upsertDraft.isLoading || !canEdit}
          >
            <Save className="mr-2 h-4 w-4" /> Save draft
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={upsertDraft.isLoading || !canEdit}
          >
            <Send className="mr-2 h-4 w-4" /> Submit
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
