
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, UserPlus, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { assignSuperAdminRole, assignMachineAdminRole } from '@/utils/roleAssignment';
import { useUserRoles } from '@/hooks/useUserRoles';

export default function ManualRoleAssignment() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'super_admin' | 'machine_admin'>('machine_admin');
  const [venueId, setVenueId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { userVenues } = useUserRoles();

  const handleAssignRole = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter a user email",
        variant: "destructive",
      });
      return;
    }

    if (role === 'machine_admin' && !venueId) {
      toast({
        title: "Error",
        description: "Please select a venue for machine admin role",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      let result;
      if (role === 'super_admin') {
        result = await assignSuperAdminRole(email);
      } else {
        result = await assignMachineAdminRole(email, venueId);
      }

      if (result.success) {
        toast({
          title: "Role Assigned",
          description: result.message,
        });
        setEmail('');
        setVenueId('');
      } else {
        toast({
          title: "Assignment Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Role assignment error:', error);
      toast({
        title: "Error",
        description: "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Manual Role Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={(value: 'super_admin' | 'machine_admin') => setRole(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="machine_admin">Machine Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {role === 'machine_admin' && (
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Select value={venueId} onValueChange={setVenueId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a venue" />
              </SelectTrigger>
              <SelectContent>
                {userVenues?.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    {venue.name} - {venue.city}, {venue.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button 
          onClick={handleAssignRole}
          disabled={isAssigning || !email || (role === 'machine_admin' && !venueId)}
          className="w-full"
        >
          {isAssigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Assigning Role...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign {role.replace('_', ' ')} Role
            </>
          )}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Role Types:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Machine Admin:</strong> Can manage a specific venue's games, settings, and view analytics</li>
            <li><strong>Super Admin:</strong> Full access to all venues, users, and system management</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
