import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Save, Trash2, RefreshCw } from 'lucide-react';

type AssessmentRow = { id: string; title: string | null; created_by?: string | null };

export default function AssessmentAuthoring() {
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const {
    data: assessments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['authoring-assessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title, created_by')
        .order('title', { ascending: true });
      if (error) throw error;
      return (data ?? []) as AssessmentRow[];
    },
  });

  const startEdit = (a: AssessmentRow) => {
    setEditingId(a.id);
    setEditingTitle(a.title ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const createAssessment = async () => {
    const title = newTitle.trim();
    if (!title) return alert('Enter a title');
    const { error } = await supabase.from('assessments').insert({ title });
    if (error) return alert(error.message);
    setNewTitle('');
    refetch();
  };

  const saveTitle = async (id: string) => {
    const title = editingTitle.trim();
    if (!title) return alert('Enter a title');
    const { error } = await supabase.from('assessments').update({ title }).eq('id', id);
    if (error) return alert(error.message);
    cancelEdit();
    refetch();
  };

  const deleteAssessment = async (id: string) => {
    if (!confirm('Delete this assessment? This cannot be undone.')) return;
    const { error } = await supabase.from('assessments').delete().eq('id', id);
    if (error) return alert(error.message);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <GlassCard className="p-6">
          <div className="text-red-600 font-medium">Failed to load assessments</div>
          <div className="text-sm opacity-80 mt-1">{(error as any)?.message ?? 'Unknown error'}</div>
          <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  const hasData = (assessments?.length ?? 0) > 0;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assessment Authoring</h1>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <GlassCard className="p-6 space-y-3">
        <div className="font-medium">Create new</div>
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Assessment title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Button onClick={createAssessment}>
            <Plus className="mr-2 h-4 w-4" /> Create
          </Button>
        </div>
      </GlassCard>

      {!hasData ? (
        <GlassCard className="p-10 text-center">
          <div className="text-lg font-medium">No assessments yet.</div>
          <div className="text-sm opacity-70 mt-1">Create your first assessment.</div>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assessments!.map((a) => {
            const isEditing = editingId === a.id;
            return (
              <GlassCard key={a.id} className="p-5 space-y-3">
                {!isEditing ? (
                  <>
                    <div className="font-semibold">{a.title ?? 'Untitled assessment'}</div>
                    <div className="text-xs opacity-60">ID: {a.id}</div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(a)}>
                        Rename
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteAssessment(a.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <Input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveTitle(a.id)}>
                        <Save className="mr-2 h-4 w-4" /> Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
