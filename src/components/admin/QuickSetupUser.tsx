
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { completeUserSetup } from '@/utils/completeUserSetup';

export default function QuickSetupUser() {
  const [email, setEmail] = useState('Vrrealverse@gmail.com');
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
      const result = await completeUserSetup(email);

      if (result.success) {
        toast({
          title: "Setup Complete",
          description: result.message,
        });
        setEmail(''); // Clear the email field on success
      } else {
        toast({
          title: "Setup Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Quick setup error:', error);
      toast({
        title: "Error",
        description: "Failed to complete user setup",
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
          <Label htmlFor="quick-email">User Email</Label>
          <Input
            id="quick-email"
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
              Complete User Setup
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">This will:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Assign machine admin role to the user</li>
            <li>Create a dedicated venue for them</li>
            <li>Assign all available games to their venue</li>
            <li>Set up machine authentication</li>
            <li>Configure default venue settings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
