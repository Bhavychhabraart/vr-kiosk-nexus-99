
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, RefreshCw, Users, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { createUserVenueSetup } from '@/utils/adminSetup';

interface PendingUser {
  id: string;
  user_id: string;
  email: string;
  status: string;
  created_at: string;
  error_message?: string;
}

export default function PendingUsersMonitor() {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const { data: pendingUsers, isLoading, refetch } = useQuery({
    queryKey: ['pending-users'],
    queryFn: async (): Promise<PendingUser[]> => {
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('user_onboarding_status')
        .select(`
          id,
          user_id,
          status,
          created_at,
          error_message
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (onboardingError) throw onboardingError;

      if (!onboardingData || onboardingData.length === 0) {
        return [];
      }

      // Get user profiles for email addresses
      const userIds = onboardingData.map(u => u.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      return onboardingData.map(user => ({
        ...user,
        email: profiles?.find(p => p.id === user.user_id)?.email || 'Unknown'
      }));
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleProcessUser = async (user: PendingUser) => {
    setIsProcessing(user.user_id);
    try {
      const result = await createUserVenueSetup(user.email);
      
      if (result.success) {
        toast({
          title: "User Setup Complete",
          description: `Successfully set up venue for ${user.email}`,
        });
        refetch();
      } else {
        toast({
          title: "Setup Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('User processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process user setup",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pending Users Monitor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!pendingUsers || pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Pending Users</h3>
            <p className="text-muted-foreground">
              All users have completed their onboarding process.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {pendingUsers.length} user(s) pending setup
              </span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Waiting</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getDaysAgo(user.created_at) > 7 ? 'text-red-600 font-medium' : ''}>
                        {getDaysAgo(user.created_at)} days
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.error_message ? (
                        <span className="text-red-600 text-sm">{user.error_message}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm"
                        onClick={() => handleProcessUser(user)}
                        disabled={isProcessing === user.user_id}
                      >
                        {isProcessing === user.user_id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Setup Now'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
