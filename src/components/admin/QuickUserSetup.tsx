
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SetupResult {
  success: boolean;
  venue_name?: string;
  games_assigned?: number;
  message?: string;
}

export default function QuickUserSetup() {
  const [email, setEmail] = useState('littlejoys144@gmail.com');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickSetup = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Starting quick setup for user:', email);
      
      // First get the user ID from profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        toast({
          title: "User Not Found",
          description: "User needs to sign up first",
          variant: "destructive",
        });
        return;
      }

      console.log('Found user profile:', profile);

      // Call the setup_user_venue function
      const { data: result, error: setupError } = await supabase
        .rpc('setup_user_venue', {
          p_email: email,
          p_user_id: profile.id
        });

      if (setupError) {
        console.error('Setup error:', setupError);
        toast({
          title: "Setup Failed",
          description: setupError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Setup result:', result);

      // Type cast the result to our interface
      const setupResult = result as unknown as SetupResult;

      if (setupResult?.success) {
        toast({
          title: "Setup Complete!",
          description: `Successfully created venue "${setupResult.venue_name}" and assigned ${setupResult.games_assigned} games`,
        });
        setEmail('');
      } else {
        toast({
          title: "Setup Failed",
          description: setupResult?.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Quick setup error:', error);
      toast({
        title: "Error",
        description: "Failed to setup user",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Quick User Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="setup-email">User Email</Label>
          <Input
            id="setup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <Button 
          onClick={handleQuickSetup}
          disabled={isProcessing || !email}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up user...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Setup User (Create Venue + Assign Games)
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">This will:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Create a new venue for the user</li>
            <li>Assign machine admin role</li>
            <li>Assign all active games to their venue</li>
            <li>Set up venue settings and configurations</li>
            <li>Complete their onboarding process</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
