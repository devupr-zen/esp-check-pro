import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';

/**
 * OnboardingSurvey
 * - Mini ESP needs analysis survey shown after track selection (students only)
 * - Saves answers to public.survey_responses
 * - Calls API (/api/generate-esp-profile) to compute esp_profiles row
 */
export default function OnboardingSurvey() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [track, setTrack] = useState<string | null>(null);

  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | undefined;
    return state?.from || '/';
  }, [location.state]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login', { replace: true }); return; }

      // load profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('role, track')
        .eq('id', user.id)
        .maybeSingle();

      if (!prof) { navigate('/', { replace: true }); return; }

      // If not a student, skip survey entirely (avoid redirect loop)
      if (prof.role !== 'student') { navigate(redirectTo, { replace: true }); return; }

      setTrack(prof.track);

      // fetch survey questions (by track or generic)
      const { data, error } = await supabase
        .from('survey_questions')
        .select('id, code, text, type, options, required, section, weight')
        .or('track.is.null,track.eq.' + (prof.track ?? ''))
        .order('section', { ascending: true })
        .order('id', { ascending: true });

      if (!error && data) setQuestions(data as Question[]);
      setLoading(false);
    })();
  }, [navigate, redirectTo]);

  const setAnswer = (qid: string, value: string) =>
    setAnswers((a) => ({ ...a, [qid]: value }));

  const submit = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      // persist answers in survey_responses
      const payload = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
      if (payload.length === 0) throw new Error('Please answer the survey');

      const { error: upErr } = await supabase
        .from('survey_responses')
        .insert(
          payload.map(p => ({
            user_id: user.id,
            question_id: p.question_id,
            answer: p.answer
          }))
        );

      if (upErr) throw upErr;

      // call API to generate/update ESP profile
      const res = await fetch('/api/generate-esp-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id, // ✅ pass Supabase user id to the API
        },
        body: JSON.stringify({ track, answers }),
      });
      if (!res.ok) throw new Error('Profile generation failed');

      navigate('/dashboard', { replace: true });
    } catch (e) {
      console.error(e);
      alert('Could not submit survey. Please check your answers and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-semibold">Needs Analysis</h1>
        <p className="text-muted-foreground">
          Answer a few quick questions so we can tailor your plan.
        </p>
      </motion.div>

      <div className="space-y-6">
        {questions.map((q) => (
          <Card key={q.id} className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">{q.text}</CardTitle>
            </CardHeader>
            <CardContent>
              {q.type === 'likert5' && (
                <Likert value={answers[q.id] || ''} onChange={(v) => setAnswer(q.id, v)} />
              )}

              {q.type === 'single' && (
                <RadioGroup value={answers[q.id] || ''} onValueChange={(v) => setAnswer(q.id, v)}>
                  {(q.options || []).map((opt: string) => (
                    <div key={opt} className="flex items-center space-x-2 py-1.5">
                      <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                      <Label htmlFor={`${q.id}-${opt}`}>{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.type === 'text' && (
                <Textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  placeholder="Type your answer…"
                />
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Finish'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Likert({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [
    { v: '1', l: 'Strongly disagree' },
    { v: '2', l: 'Disagree' },
    { v: '3', l: 'Neutral' },
    { v: '4', l: 'Agree' },
    { v: '5', l: 'Strongly agree' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
      {opts.map(o => (
        <Button
          key={o.v}
          type="button"
          variant={value === o.v ? 'default' : 'outline'}
          onClick={() => onChange(o.v)}
        >
          {o.v}
        </Button>
      ))}
    </div>
  );
}

type Question = {
  id: string; // uuid or text id
  code: string | null;
  text: string;
  type: 'likert5' | 'single' | 'text';
  options?: string[] | null;
  required?: boolean | null;
  weight?: number | null;
  section?: string | null;
  track?: string | null;
};
