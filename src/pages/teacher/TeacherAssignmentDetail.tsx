import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, ArrowLeft, CheckCircle2, XCircle, Pencil, Link2 } from 'lucide-react';

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
  score: number | null;
  feedback: string | null;
  updated_at: string | null;
  created_by?: string | null;            // optional (if you added created_by)
  submission_file_path?: string | null;  // optional (uploads)
};

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
};

export default function TeacherAssignmentDetail() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // 1) Fetch assignment header
  const {
    data: assignment,
    isLoading: loadingA,
    isError: errorA,
    error: errA,
    refetch: refetchAssignment,
  } = useQuery({
    queryKey: ['t-assign-detail', assignmentId],
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

  // 2) Fetch submissions for this assignment
  const {
    data: submissions,
    isLoading: loadingS,
    isError: errorS,
    error: errS,
    refetch: refetchSubs,
  } = useQuery({
    queryKey: ['t-assign-subs', assignmentId],
    enabled: !!assignmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('id, assignment_id, status, score, feedback, updated_at, created_by, submission_file_path')
        .eq('assignment_id', assignmentId);
      if (error) throw error;
      return (data ?? []) as Submission[];
    },
  });

  // 3) Best-effort student names
  const createdByIds = useMemo(
    () => Array.from(new Set((submissions ?? []).map(s => s.created_by).filter(Boolean))) as string[],
    [submissions]
  );

  const { data: profiles } = useQuery({
    enabled: createdByIds.length > 0,
    queryKey: ['t-assign-subs-profiles', createdByIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', createdByIds);
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const profileById = useMemo(() => {
    const m = new Map<string, Profile>();
    (profiles ?? []).forEach(p => m.set(p.id, p));
    return m;
  }, [profiles]);

  const [editId, setEditId] = useState<string | null>(null);
  const [score, setScore] = useState<string>('');     // keep as string for controlled input
  const [feedback, setFeedback] = useState<string>('');

  const startEdit = (s: Submission) => {
    setEditId(s.id);
    setScore(s.score != null ? String(s.score) : '');
    setFeedback(s.feedback ?? '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setScore('');
    setFeedback('');
  };

  const saveGrade = async (submissionId: string) => {
    const parsed = score.trim() === '' ? null : Number(score);
    if (parsed != null && Number.isNaN(parsed)) {
      alert('Score must be a number or empty.');
      return;
    }
    const { error } = await supabase.rpc('grade_submission', {
      p_submission_id: submissionId,
      p_score: parsed ?? 0,
      p_feedback: feedback ?? '',
      p_status: 'graded',
    });
    if (error) {
      alert(`Grade failed: ${error.message}`);
    } else {
      cancelEdit();
      await refetchSubs();
    }
  };

  const openAttachment = async (path?: string | null) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('submissions').createSignedUrl(path, 60 * 10);
    if (error) {
      alert(error.message);
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  if (loadingA || loadingS) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  if (errorA || !assignment) {
    return (
      <div className="p-6">
        <GlassCard className="p-6">
          <div className="text-red-600 font-medium">Assignment not found</div>
          <div className="text-sm opacity-80 mt-1">{(errA as any)?.message ?? 'Unknown error'}</div>
          <Button variant="secondary" className="mt-4" onClick={() => navigate('/teacher/assessments')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
          </Button>
        </GlassCard>
      </div>
    );
  }

  const title = assignment.assessments?.title ?? 'Untitled assessment';
  const className = assignment.classes?.name ?? '—';

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/teacher/assessments')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-right">
          <div className="text-xl font-semibold">{title}</div>
          <div className="text-sm opacity-80">
            Class: {className} • Due: {assignment.due_at ? new Date(assignment.due_at).toLocaleString() : '—'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm opacity-70">
          {submissions?.length ?? 0} submission{(submissions?.length ?? 0) === 1 ? '' : 's'}
        </div>
        <Button variant="outline" onClick={() => { refetchAssignment(); refetchSubs(); }}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {errorS ? (
        <GlassCard className="p-6">
          <div className="text-red-600 font-medium">Failed to load submissions</div>
          <div className="text-sm opacity-80 mt-1">{(errS as any)?.message ?? 'Unknown error'}</div>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(submissions ?? []).map((s) => {
            const prof = s.created_by ? profileById.get(s.created_by) : undefined;
            const label =
              prof?.full_name ? prof.full_name :
              prof?.email ? prof.email :
              s.created_by ? `Student ${s.created_by.slice(0, 8)}` :
              'Student';

            const isEditing = editId === s.id;

            return (
              <GlassCard key={s.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs opacity-70">Submission ID: {s.id}</div>
                  </div>
                  <div className="text-sm">
                    {s.status === 'graded' ? (
                      <span className="inline-flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> Graded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600">
                        <XCircle className="h-4 w-4" /> {s.status ?? 'Not started'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-sm">
                  <span className="opacity-70">Score:</span> {s.score ?? '—'}
                  {s.updated_at && (
                    <span className="opacity-60"> • Updated {new Date(s.updated_at).toLocaleString()}</span>
                  )}
                </div>

                {/* Attachment viewer */}
                {s.submission_file_path ? (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => openAttachment(s.submission_file_path!)}
                    >
                      <Link2 className="mr-2 h-4 w-4" /> Open attachment
                    </Button>
                    <div className="text-xs opacity-70 truncate">{s.submission_file_path}</div>
                  </div>
                ) : (
                  <div className="text-xs opacity-60">No attachment</div>
                )}

                {!isEditing ? (
                  <div className="pt-2">
                    <Button size="sm" variant="secondary" onClick={() => startEdit(s)}>
                      <Pencil className="mr-2 h-4 w-4" /> {s.status === 'graded' ? 'Update grade' : 'Grade'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">Score</label>
                      <Input
                        inputMode="numeric"
                        placeholder="e.g., 85"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Feedback</label>
                      <textarea
                        className="w-full rounded-xl border bg-background/50 p-3"
                        rows={4}
                        placeholder="Write feedback for the student…"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveGrade(s.id)}>
                        Save grade
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
