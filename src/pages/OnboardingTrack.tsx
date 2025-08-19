import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, BookOpen, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

/**
 * OnboardingTrack
 * - Forces STUDENT users to choose a learning track: "General English" or "Business English".
 * - Updates public.profiles.track for the current user.
 * - Redirects teachers/superadmins away immediately.
 *
 * Requirements:
 * - Supabase client exported from '@/integrations/supabase/client'.
 * - shadcn/ui (Button, Card) and Tailwind available.
 * - React Router in the app.
 */
export default function OnboardingTrack() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // selected key while saving
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<string>('student');

  // Destination after onboarding (fallback to "/")
  const redirectTo = useMemo(() => {
    const state = location.state as { from?: string } | undefined;
    return state?.from || '/';
  }, [location.state]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        navigate('/login', { replace: true });
        return;
      }

      // Fetch profile
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('email, role, track')
        .eq('id', user.id)
        .maybeSingle();

      if (profErr) {
        console.error(profErr);
      }

      setEmail(profile?.email || user.email || '');
      const r = profile?.role || 'student';
      setRole(r);

      // If not a student, bounce out. Only students choose a track.
      if (r !== 'student') {
        navigate(redirectTo, { replace: true });
        return;
      }

      // If student already has a track, skip this page → go to survey step
      if (profile?.track) {
        navigate('/onboarding/survey', { replace: true });
        return;
      }

      setLoading(false);
    })();
  }, [navigate, redirectTo]);

  const chooseTrack = async (track: 'General English' | 'Business English') => {
    try {
      setSaving(track);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ track })
        .eq('id', user.id);

      if (error) throw error;

      // Success → proceed to the survey step
      navigate('/onboarding/survey', { replace: true });
    } catch (e) {
      console.error(e);
      alert('Failed to set track. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-semibold">Choose your learning track</h1>
        <p className="text-muted-foreground mt-1">
          Hi{email ? `, ${email}` : ''}! Pick the focus that best fits your goals. You can change this later via your profile.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TrackCard
          icon={<BookOpen className="h-6 w-6" />}
          title="General English"
          description="Grammar, reading, listening, and conversation for everyday fluency."
          features={[
            'Reading & Listening practice',
            'Grammar & Vocabulary drills',
            'Daily speaking prompts',
          ]}
          onSelect={() => chooseTrack('General English')}
          loading={saving === 'General English'}
        />

        <TrackCard
          icon={<Briefcase className="h-6 w-6" />}
          title="Business English"
          description="Meetings, presentations, emails, and workplace communication."
          features={[
            'Presentation & meeting skills',
            'Negotiation & persuasion tasks',
            'Professional writing practice',
          ]}
          onSelect={() => chooseTrack('Business English')}
          loading={saving === 'Business English'}
        />
      </div>
    </div>
  );
}

function TrackCard({
  icon,
  title,
  description,
  features,
  onSelect,
  loading,
}: {
  icon: React.ReactNode;
  title: 'General English' | 'Business English';
  description: string;
  features: string[];
  onSelect: () => void;
  loading?: boolean;
}) {
  return (
    <Card className={cn('rounded-2xl shadow-sm')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon} <span>{title}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 mt-0.5 text-green-600" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" onClick={onSelect} disabled={!!loading}>
          {loading ? 'Saving…' : 'Choose ' + title}
        </Button>
      </CardContent>
    </Card>
  );
}
