import { useNavigate } from 'react-router-dom';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

type AssignmentRow = {
  id: string;
  class_id: string;
  assessment_id: string;
  due_at: string | null;
  assessments?: { title?: string | null } | null;
  classes?: { name?: string | null } | null;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  status: 'draft' | 'submitted' | 'graded' | string;
  score?: number | null;
  updated_at?: string | null;
};

function statusLabel(s?: string) {
  if (!s) return 'Not started';
  switch (s) {
    case 'draft':
      return 'In progress';
    case 'submitted':
      return 'Submitted';
    case 'graded':
      return 'Graded';
    default:
      return s;
  }
}

export default function StudentAssessments() {
  const navigate = useNavigate();

  // 1) Assignments visible to the student (RLS filters by membership)
  const {
    data: assignments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessment_assignments')
        .select(
          `
            id, class_id, assessment_id, due_at,
            assessments ( title ),
            classes ( name )
          `
        )
        .order('due_at', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as AssignmentRow[];
    },
  });

  // 2) Student's own submissions for these assignments (RLS ensures only own)
  const assignmentIds = useMemo(
    () => (assignments ?? []).map((a) => a.id),
    [assignments]
  );

  const {
    data: submissions,
    isLoading: isLoadingSubs,
    refetch: refetchSubs,
  } = useQuery({
    enabled: assignmentIds.length > 0,
    queryKey: ['student-submissions-by-assignment', assignmentIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('id, assignment_id, status, score, updated_at')
        .in('assignment_id', assignmentIds);
      if (error) throw error;
      return (data ?? []) as SubmissionRow[];
    },
  });

  const submissionByAssignment = useMemo(() => {
    const map = new Map<string, SubmissionRow>();
    (submissions ?? []).forEach((s) => map.set(s.assignment_id, s));
    return map;
  }, [submissions]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading assessments…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <GlassCard className="p-6">
          <div className="text-red-600 font-medium">Failed to load assessments</div>
          <div className="text-sm opacity-80 mt-1">
            {(error as any)?.message ?? 'Unknown error'}
          </div>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  const hasData = (assignments?.length ?? 0) > 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Assessments</h1>
        <Button
          variant="outline"
          onClick={() => {
            refetch();
            refetchSubs();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {!hasData ? (
        <GlassCard className="p-10 text-center">
          <div className="text-lg font-medium">No assigned assessments.</div>
          <div className="text-sm opacity-70 mt-1">
            Your teacher hasn’t assigned any assessments yet. Check back later.
          </div>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments!.map((a) => {
            const sub = submissionByAssignment.get(a.id);
            const status = statusLabel(sub?.status);
            return (
              <GlassCard key={a.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">
                      {a.assessments?.title ?? 'Untitled assessment'}
                    </div>
                    <div className="text-sm opacity-80">
                      Class: {a.classes?.name ?? a.class_id}
                    </div>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="opacity-70">Due:</span>{' '}
                  {a.due_at ? new Date(a.due_at).toLocaleString() : '—'}
                </div>
                <div className="text-sm">
                  <span className="opacity-70">Status:</span>{' '}
                  {isLoadingSubs ? 'Loading…' : status}
                </div>
                {sub?.status === 'graded' && (
                  <div className="text-sm">
                    <span className="opacity-70">Score:</span>{' '}
                    {typeof sub.score === 'number' ? `${sub.score}` : '—'}
                    {sub.updated_at && (
                      <span className="opacity-60">
                        • Updated {new Date(sub.updated_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                )}
                {/* New Open button */}
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/student/assessments/${a.id}`)}
                  >
                    Open
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
