import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/reusable/GlassCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, User, KeyIcon, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthMode = 'signin' | 'signup' | 'reset';

export default function StudentAuth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    track: 'General',
    inviteCode: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validate invite code first using secure function
        const { data: validationData, error: inviteError } = await supabase.rpc('validate_invite_code', {
          code_input: formData.inviteCode
        });

        if (inviteError || !validationData || validationData.length === 0) {
          toast({
            title: "Invalid invite code",
            description: "Please check your invite code and try again.",
            variant: "destructive"
          });
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Passwords don't match",
            description: "Please make sure both passwords are identical.",
            variant: "destructive"
          });
          return;
        }

        // Sign up user
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              role: 'student',
              first_name: formData.firstName,
              last_name: formData.lastName,
              track: formData.track
            }
          }
        });

        if (error) throw error;

        // Update invite code usage using secure function
        const { error: useCodeError } = await supabase.rpc('use_invite_code', {
          code_input: formData.inviteCode,
          user_email: formData.email
        });

        if (useCodeError) {
          console.error('Error updating invite code:', useCodeError);
        }

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        navigate('/');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        toast({
          title: "Reset email sent",
          description: "Check your email for password reset instructions.",
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Upraizen ESPCheck Pro</h1>
          <p className="text-xl text-center max-w-md">
            Premium assessment platform for enhanced learning experiences
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
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Reset Password'}
              </h2>
              <p className="text-muted-foreground">
                {mode === 'signin' && 'Sign in to your student account'}
                {mode === 'signup' && 'Join as a new student'}
                {mode === 'reset' && 'Enter your email to reset your password'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
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

                  <div className="space-y-2">
                    <Label htmlFor="track">Learning Track</Label>
                    <Select
                      value={formData.track}
                      onValueChange={(value) => setFormData({ ...formData, track: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your track" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General English</SelectItem>
                        <SelectItem value="Business">Business English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="inviteCode"
                        type="text"
                        placeholder="Enter your invite code"
                        value={formData.inviteCode}
                        onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Loading...' : (
                  mode === 'signin' ? 'Sign In' : 
                  mode === 'signup' ? 'Create Account' : 
                  'Send Reset Email'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {mode === 'signin' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Forgot your password?
                  </button>
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </div>
                </>
              )}
              
              {mode === 'signup' && (
                <div className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              )}

              {mode === 'reset' && (
                <div className="text-sm text-muted-foreground">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}