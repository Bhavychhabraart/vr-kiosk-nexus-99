
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, User } from 'lucide-react';
import { completeUserSetup } from '@/utils/completeUserSetup';
import { toast } from '@/components/ui/use-toast';

export default function AutoSetupNotification() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  const handleManualSetup = async () => {
    const email = 'Vrrealverse@gmail.com';
    setIsProcessing(true);
    
    try {
      const result = await completeUserSetup(email);
      
      if (result.success) {
        setSetupComplete(true);
        toast({
          title: "Setup Complete",
          description: `User ${email} has been set up successfully!`,
        });
      } else {
        toast({
          title: "Setup Failed",
          description: result.error || 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Manual setup error:', error);
      toast({
        title: "Error",
        description: "Failed to complete user setup",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto-trigger setup on component mount
  useEffect(() => {
    handleManualSetup();
  }, []);

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <User className="w-5 h-5" />
          Auto Setup in Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-700">
          Setting up machine admin role for: <strong>Vrrealverse@gmail.com</strong>
        </div>
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing user setup...</span>
          </div>
        )}
        
        {setupComplete && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Setup completed successfully!</span>
          </div>
        )}
        
        {!isProcessing && !setupComplete && (
          <Button onClick={handleManualSetup} className="w-full">
            <User className="w-4 h-4 mr-2" />
            Retry Setup
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
