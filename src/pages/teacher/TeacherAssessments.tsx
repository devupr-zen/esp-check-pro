import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw } from 'lucide-react';

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
};

export default function TeacherAssessments() {
  const navigate = useNavigate();

  // Load assignments for teacher-owned classes (RLS enforces ownership)
  const {
    data: assignments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teacher-assignments'],
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

  // Load submission counts per assignment
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
    queryKey: ['teacher-assignments-submissions', assignmentIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_submissions')
        .select('id, assignment_id, status')
        .in('assignment_id', assignmentIds);
      if (error) throw error;
      return (data ?? []) as SubmissionRow[];
    },
  });

  const summaryByAssignment = useMemo(() => {
    const map = new Map<
      string,
      { total: number; submitted: number; graded: number }
    >();
    (submissions ?? []).forEach((s) => {
      const cur = map.get(s.assignment_id) ?? {
        total: 0,
        submitted: 0,
        graded: 0,
      };
      cur.total += 1;
      if (s.status === 'submitted' || s.status === 'graded') cur.submitted += 1;
      if (s.status === 'graded') cur.graded += 1;
      map.set(s.assignment_id, cur);
    });
    return map;
  }, [submissions]);

  // Optional: demo-grade action to validate RPC
  const handleDemoGrade = async () => {
    const id = window.prompt('Enter a submission_id to grade (demo):');
    if (!id) return;
    const { error } = await supabase.rpc('grade_submission', {
      p_submission_id: id,
      p_score: 85,
      p_feedback: 'Well done',
      p_status: 'graded',
    });
    if (error) {
      alert(`Grade failed: ${error.message}`);
    } else {
      alert('Graded!');
      refetchSubs();
    }
  };

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
        <h1 className="text-2xl font-semibold">Assessments</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              refetchSubs();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => navigate('/teacher/assessments/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create assignment
          </Button>
        </div>
      </div>

      {!hasData ? (
        <GlassCard className="p-10 text-center">
          <div className="text-lg font-medium">No assessments yet.</div>
          <div className="text-sm opacity-70 mt-1">
            Create your first assignment to get started.
          </div>
          <Button className="mt-4" onClick={() => navigate('/teacher/assessments/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create assignment
          </Button>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments!.map((a) => {
            const s = summaryByAssignment.get(a.id);
            const statusSummary = s
              ? `${s.submitted}/${s.total} submitted • ${s.graded} graded`
              : isLoadingSubs
              ? 'Loading…'
              : '—';
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
                  <span className="opacity-70">Status:</span> {statusSummary}
                </div>
                <div className="pt-2 flex gap-2">
                  {/* NEW: Open detail page for grading */}
                  <Button size="sm" onClick={() => navigate(`/teacher/assessments/${a.id}`)}>
                    Open
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleDemoGrade}>
                    Demo Grade
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
