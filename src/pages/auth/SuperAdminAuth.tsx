import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/reusable/GlassCard";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminAuth() {
  const [loading, setLoading] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate superadmin access code
      const { data: codeData, error: codeError } = await supabase
        .from('superadmin_codes')
        .select('*')
        .eq('code', accessCode)
        .eq('is_active', true)
        .single();

      if (codeError || !codeData) {
        toast({
          title: "Invalid access code",
          description: "Please check your access code and try again.",
          variant: "destructive"
        });
        return;
      }

      // For demonstration, we'll redirect to a superadmin dashboard
      // In a real implementation, you might want to create a superadmin session
      toast({
        title: "Access granted",
        description: "Welcome to the admin portal.",
      });
      
      navigate('/admin/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-destructive/20 via-background to-primary/20 flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-destructive to-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <Shield className="w-20 h-20 mb-6" />
          <h1 className="text-5xl font-bold mb-6">Admin Portal</h1>
          <p className="text-xl text-center max-w-md">
            Restricted access - Authorized personnel only
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
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Administrator Access
              </h2>
              <p className="text-muted-foreground">
                Enter your access code to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="accessCode"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
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

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Verifying...' : 'Access Admin Portal'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                This area is restricted to authorized administrators only. 
                All access attempts are logged and monitored.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}