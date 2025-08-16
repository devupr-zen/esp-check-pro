import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/reusable/GlassCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthStep = 'signin' | 'newPassword' | 'reset';

export default function TeacherAuth() {
  const [step, setStep] = useState<AuthStep>('signin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    prePassword: '',
    newPassword: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [tempUserData, setTempUserData] = useState<any>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in and needs to change password
    const checkAuthState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile && profile.role === 'teacher' && !profile.password_changed) {
          setStep('newPassword');
        } else if (profile && profile.role === 'teacher') {
          navigate('/');
        }
      }
    };

    checkAuthState();
  }, [navigate]);

  const handlePrePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate pre-password
      const { data: credentialData, error: credentialError } = await supabase
        .from('teacher_credentials')
        .select('*')
        .eq('email', formData.email)
        .eq('pre_password', formData.prePassword)
        .eq('is_used', false)
        .single();

      if (credentialError || !credentialData) {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and pre-password.",
          variant: "destructive"
        });
        return;
      }

      // Store credential data temporarily
      setTempUserData(credentialData);
      setStep('newPassword');
      
      toast({
        title: "Pre-password verified",
        description: "Please set your new password to continue.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are identical.",
          variant: "destructive"
        });
        return;
      }

      if (tempUserData) {
        // First-time setup - create account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.newPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              role: 'teacher',
              first_name: formData.firstName,
              last_name: formData.lastName
            }
          }
        });

        if (authError) throw authError;

        // Mark credential as used
        await supabase
          .from('teacher_credentials')
          .update({ 
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('id', tempUserData.id);

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        // Existing user changing password
        const { error } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (error) throw error;

        // Mark password as changed
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('profiles')
            .update({ password_changed: true })
            .eq('user_id', session.user.id);
        }

        toast({
          title: "Password updated",
          description: "Your password has been successfully changed.",
        });

        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.prePassword,
      });

      if (error) throw error;
      
      // Will be handled by useEffect
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Upraizen ESPCheck Pro</h1>
          <p className="text-xl text-center max-w-md">
            Teacher Portal - Create, manage, and track student progress
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {step === 'signin' && 'Teacher Access'}
                {step === 'newPassword' && 'Set New Password'}
                {step === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-muted-foreground">
                {step === 'signin' && 'Enter your credentials to access your account'}
                {step === 'newPassword' && 'Create a secure password for your account'}
                {step === 'reset' && 'Enter your email to reset your password'}
              </p>
            </div>

            {step === 'signin' && (
              <form onSubmit={handlePrePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="teacher@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prePassword">Pre-Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prePassword"
                      type="password"
                      placeholder="Enter your pre-password"
                      value={formData.prePassword}
                      onChange={(e) => setFormData({ ...formData, prePassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('reset')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Need help accessing your account?
                  </button>
                </div>
              </form>
            )}

            {step === 'newPassword' && (
              <form onSubmit={handleNewPasswordSubmit} className="space-y-6">
                {tempUserData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Setting Password...' : 'Set Password'}
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="teacher@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('signin')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
