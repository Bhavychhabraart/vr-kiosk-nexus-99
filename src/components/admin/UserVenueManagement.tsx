
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Building2, 
  Search, 
  UserPlus,
  Shield,
  MapPin
} from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserVenueManagementProps {
  selectedVenueId: string | null;
}

interface UserVenueAssignment {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  venue_id: string;
  venue_name: string;
  venue_city: string;
  venue_state: string;
  is_active: boolean;
  created_at: string;
}

const UserVenueManagement = ({ selectedVenueId }: UserVenueManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { isSuperAdmin, userVenues } = useUserRoles();

  // Fetch user-venue assignments
  const { data: userAssignments, isLoading, error } = useQuery({
    queryKey: ['user-venue-assignments', selectedVenueId],
    queryFn: async (): Promise<UserVenueAssignment[]> => {
      let query = supabase
        .from('simplified_user_roles')
        .select(`
          user_id,
          role,
          venue_id,
          is_active,
          created_at,
          venues:venue_id (
            name,
            city,
            state
          )
        `)
        .eq('is_active', true);

      // Filter by venue if specified and user is not super admin
      if (selectedVenueId && !isSuperAdmin) {
        query = query.eq('venue_id', selectedVenueId);
      } else if (!isSuperAdmin && userVenues) {
        // Limit to user's assigned venues
        const venueIds = userVenues.map(v => v.id);
        query = query.in('venue_id', venueIds);
      }

      const { data: roles, error: rolesError } = await query;
      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) return [];

      // Get user profiles for additional info
      const userIds = [...new Set(roles.map(r => r.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine data
      return roles.map(role => {
        const profile = profiles?.find(p => p.id === role.user_id);
        const venue = role.venues as any;
        
        return {
          user_id: role.user_id,
          email: profile?.email || 'Unknown',
          full_name: profile?.full_name || 'Unknown User',
          role: role.role,
          venue_id: role.venue_id || '',
          venue_name: venue?.name || 'Unknown Venue',
          venue_city: venue?.city || '',
          venue_state: venue?.state || '',
          is_active: role.is_active,
          created_at: role.created_at
        };
      });
    },
    enabled: true
  });

  // Filter assignments based on search term
  const filteredAssignments = userAssignments?.filter(assignment =>
    assignment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.venue_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group assignments by venue for better display
  const assignmentsByVenue = filteredAssignments.reduce((acc, assignment) => {
    const venueKey = assignment.venue_id;
    if (!acc[venueKey]) {
      acc[venueKey] = {
        venue_name: assignment.venue_name,
        venue_city: assignment.venue_city,
        venue_state: assignment.venue_state,
        users: []
      };
    }
    acc[venueKey].users.push(assignment);
    return acc;
  }, {} as Record<string, { venue_name: string; venue_city: string; venue_state: string; users: UserVenueAssignment[] }>);

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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading User Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Failed to load user venue assignments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User-Venue Assignments
          </CardTitle>
          <CardDescription>
            View and manage user assignments to venues
            {selectedVenueId && !isSuperAdmin && " (filtered by selected venue)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users or venues..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {isSuperAdmin && (
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Invite User
              </Button>
            )}
          </div>

          {Object.keys(assignmentsByVenue).length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No User Assignments Found</h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? `No assignments found matching "${searchTerm}"`
                  : "No user-venue assignments to display"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(assignmentsByVenue).map(([venueId, venueData]) => (
                <Card key={venueId} className="border-l-4 border-l-vr-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-vr-primary" />
                        <CardTitle className="text-lg">{venueData.venue_name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {venueData.venue_city}, {venueData.venue_state}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {venueData.users.map((assignment) => (
                        <div key={`${assignment.user_id}-${assignment.venue_id}`} 
                             className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-vr-primary/20 rounded-full flex items-center justify-center">
                              <Shield className="w-4 h-4 text-vr-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{assignment.full_name}</p>
                              <p className="text-sm text-muted-foreground">{assignment.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {assignment.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={assignment.is_active ? "default" : "secondary"}>
                              {assignment.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              {new Set(filteredAssignments.map(a => a.user_id)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique users assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-secondary">
              {Object.keys(assignmentsByVenue).length}
            </div>
            <p className="text-xs text-muted-foreground">Venues with assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredAssignments.length}
            </div>
            <p className="text-xs text-muted-foreground">Active role assignments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserVenueManagement;
