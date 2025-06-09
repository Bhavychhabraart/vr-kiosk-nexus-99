
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, User, Building, GameController2, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { checkUserSetup, ensureAllGamesAssigned } from '@/utils/adminSetup';

export default function UserSetupCheck() {
  const [email, setEmail] = useState('littlejoys144@gmail.com');
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [setupResult, setSetupResult] = useState(null);

  const handleCheckSetup = async () => {
    setIsChecking(true);
    try {
      const result = await checkUserSetup(email);
      setSetupResult(result);
      
      if (result.success) {
        toast({
          title: "Setup Check Complete",
          description: `Found user with ${result.roles?.length || 0} roles and ${result.venues?.length || 0} venues`,
        });
      } else {
        toast({
          title: "Setup Check Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Setup check error:', error);
      toast({
        title: "Error",
        description: "Failed to check user setup",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleFixGames = async () => {
    if (!setupResult?.success || !setupResult.venues?.[0]?.id) {
      toast({
        title: "Error",
        description: "No venue found to fix games for",
        variant: "destructive",
      });
      return;
    }

    setIsFixing(true);
    try {
      const result = await ensureAllGamesAssigned(setupResult.venues[0].id);
      
      if (result.success) {
        toast({
          title: "Games Fixed",
          description: `${result.newlyAssigned} games were newly assigned. Total: ${result.totalGames}`,
        });
        
        // Refresh setup check
        handleCheckSetup();
      } else {
        toast({
          title: "Fix Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Fix games error:', error);
      toast({
        title: "Error",
        description: "Failed to fix game assignments",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Setup Checker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email"
            />
          </div>
          
          <Button 
            onClick={handleCheckSetup}
            disabled={isChecking || !email}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                Check User Setup
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {setupResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {setupResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Setup Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {setupResult.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>User: {setupResult.user?.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Roles: {setupResult.roles?.length || 0}</span>
                  {setupResult.roles?.map(role => (
                    <span key={role.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {role.role}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <span>Venues: {setupResult.venues?.length || 0}</span>
                  {setupResult.venues?.map(venue => (
                    <span key={venue.id} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {venue.name}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <GameController2 className="h-4 w-4" />
                  <span>Games: {setupResult.activeGamesCount}/{setupResult.gamesCount} active</span>
                </div>

                {setupResult.venues?.length > 0 && (
                  <Button 
                    onClick={handleFixGames}
                    disabled={isFixing}
                    variant="outline"
                    className="w-full"
                  >
                    {isFixing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Fixing Games...
                      </>
                    ) : (
                      <>
                        <GameController2 className="mr-2 h-4 w-4" />
                        Ensure All Games Assigned
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                {setupResult.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
