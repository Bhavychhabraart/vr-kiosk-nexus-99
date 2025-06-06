
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, ArrowRight, Building2, FileText } from 'lucide-react';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { MachineAdminSignupForm } from '@/components/auth/MachineAdminSignupForm';

const SimplifiedAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { signIn, user } = useSimplifiedAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';
  const prefillData = location.state?.prefillData;
  const defaultTab = location.state?.defaultTab || 'machine-signup';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vr-primary/10 to-vr-secondary/10 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-vr-primary/10 rounded-full">
              <Lock className="w-8 h-8 text-vr-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">VR Kiosk Access</h1>
          <p className="text-muted-foreground">Sign in to your account or create a new machine admin account</p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="machine-signup" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Machine Owner Signup
            </TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>

          <TabsContent value="machine-signup" className="flex justify-center">
            <MachineAdminSignupForm prefillData={prefillData} />
          </TabsContent>

          <TabsContent value="signin" className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Access your VR kiosk management dashboard
                </CardDescription>
              </CardHeader>

              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center space-y-2">
          <Button 
            variant="link" 
            onClick={() => navigate('/default-credentials')}
            className="flex items-center gap-2 mx-auto"
          >
            <FileText className="h-4 w-4" />
            View Default Machine Credentials
          </Button>
          <p className="text-sm text-muted-foreground">
            Need help? Contact support at support@arcadiavr.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedAuth;
