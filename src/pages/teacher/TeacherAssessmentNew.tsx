import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Calendar as CalIcon, Save, ArrowLeft } from 'lucide-react';

type ClassRow = { id: string; name: string | null };
type AssessmentRow = { id: string; title: string | null; created_by?: string | null };

export default function TeacherAssessmentNew() {
  const navigate = useNavigate();
  const [classId, setClassId] = useState<string>('');
  const [assessmentId, setAssessmentId] = useState<string>('');
  const [dueAt, setDueAt] = useState<string>(''); // HTML datetime-local string
  const [newTitle, setNewTitle] = useState<string>('');
  const [creatingAssessment, setCreatingAssessment] = useState<boolean>(false);

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['owned-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ClassRow[];
    },
  });

  const { data: assessments, isLoading: loadingAssessments, refetch: refetchAssessments } = useQuery({
    queryKey: ['my-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, created_by')
        .order('title', { ascending: true });
      if (error) throw error;
      return (data ?? []) as AssessmentRow[];
    },
  });

  const createAssessment = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from('assessments')
        .insert({ title })
        .select('id')
        .single();
      if (error) throw error;
      return data!.id as string;
    },
    onSuccess: async (id) => {
      setAssessmentId(id);
      await refetchAssessments();
      setCreatingAssessment(false);
    },
  });

  const createAssignment = useMutation({
    mutationFn: async (payload: { class_id: string; assessment_id: string; due_at: string | null }) => {
      const { error } = await supabase
        .from('assessment_assignments')
        .insert({
          class_id: payload.class_id,
          assessment_id: payload.assessment_id,
          due_at: payload.due_at ? new Date(payload.due_at).toISOString() : null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      alert('Assignment created.');
      navigate('/teacher/assessments');
    },
  });

  const canSubmit = useMemo(() => !!classId && !!assessmentId, [classId, assessmentId]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/teacher/assessments')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">New Assignment</h1>
        <div />
      </div>

      <GlassCard className="p-6 space-y-6">
        {/* Class select */}
        <div>
          <label className="block text-sm font-medium mb-2">Class</label>
          {loadingClasses ? (
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading classes…
            </div>
          ) : (
            <select
              className="w-full rounded-xl border bg-background/50 p-3"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select a class…</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name ?? c.id}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Assessment select + quick create */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Assessment</label>
          {loadingAssessments ? (
            <div className="flex items-center gap-2 text-sm opacity-80">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading assessments…
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                className="w-full rounded-xl border bg-background/50 p-3"
                value={assessmentId}
                onChange={(e) => setAssessmentId(e.target.value)}
              >
                <option value="">Select an assessment…</option>
                {(assessments ?? []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title ?? a.id}
                  </option>
                ))}
              </select>
              <Button variant="secondary" onClick={() => setCreatingAssessment((v) => !v)}>
                <Plus className="mr-2 h-4 w-4" /> New
              </Button>
            </div>
          )}

          {creatingAssessment && (
            <div className="flex gap-2 items-center">
              <Input
                placeholder="New assessment title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Button
                onClick={async () => {
                  if (!newTitle.trim()) {
                    alert('Enter a title.');
                    return;
                  }
                  try {
                    await createAssessment.mutateAsync(newTitle.trim());
                    setNewTitle('');
                  } catch (e: any) {
                    alert(`Create assessment failed: ${e.message ?? e}`);
                  }
                }}
                disabled={createAssessment.isLoading}
              >
                {createAssessment.isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Due date */}
        <div>
          <label className="block text-sm font-medium mb-2">Due date (optional)</label>
          <div className="flex gap-2 items-center">
            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
            <CalIcon className="h-4 w-4 opacity-60" />
          </div>
          <div className="text-xs opacity-70 mt-1">Stored as UTC in the database.</div>
        </div>

        <div className="pt-2">
          <Button
            onClick={async () => {
              if (!canSubmit) return;
              try {
                await createAssignment.mutateAsync({
                  class_id: classId,
                  assessment_id: assessmentId,
                  due_at: dueAt || null,
                });
              } catch (e: any) {
                alert(`Create assignment failed: ${e.message ?? e}`);
              }
            }}
            disabled={!canSubmit || createAssignment.isLoading}
          >
            {createAssignment.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create assignment
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
