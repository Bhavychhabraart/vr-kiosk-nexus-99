
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  LogOut, 
  Settings, 
  Users, 
  Building2,
  Mail,
  Plus,
  ArrowRight
} from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useNavigate } from "react-router-dom";
import { useVenues } from "@/hooks/useVenues";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SimplifiedSuperAdmin = () => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  
  const { user, profile, signOut, createMachineAdminInvitation } = useSimplifiedAuth();
  const { venues, isLoading: venuesLoading } = useVenues();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !selectedVenueId) return;

    setIsInviting(true);
    const result = await createMachineAdminInvitation(inviteEmail, selectedVenueId);
    
    if (result.success) {
      setInviteEmail('');
      setSelectedVenueId('');
    }
    
    setIsInviting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-300">
              Welcome back, {profile?.full_name || profile?.email}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                <Crown className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Back to Home
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Machine Admin Invitations */}
          <Card className="bg-black/60 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Invite Machine Admin
              </CardTitle>
              <CardDescription className="text-gray-300">
                Send invitations to machine administrators for specific venues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvitation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-white">Assign to Venue</Label>
                  <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues?.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{venue.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {venue.city}, {venue.state}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isInviting || !inviteEmail || !selectedVenueId}
                >
                  {isInviting ? (
                    'Sending Invitation...'
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-black/60 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                System Overview
              </CardTitle>
              <CardDescription className="text-gray-300">
                Quick overview of your VR kiosk network
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {venues?.length || 0}
                  </div>
                  <div className="text-sm text-gray-300">Total Venues</div>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {venues?.filter(v => v.status === 'active').length || 0}
                  </div>
                  <div className="text-sm text-gray-300">Active Venues</div>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/machine-admin')}
                variant="outline"
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Machines
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Venues List */}
        <Card className="bg-black/60 border-gray-600 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-400" />
              All Venues
            </CardTitle>
            <CardDescription className="text-gray-300">
              Overview of all VR kiosk venues in the network
            </CardDescription>
          </CardHeader>
          <CardContent>
            {venuesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading venues...</p>
              </div>
            ) : venues && venues.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venues.map((venue) => (
                  <div key={venue.id} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{venue.name}</h3>
                      <Badge 
                        variant={venue.status === 'active' ? 'default' : 'secondary'}
                        className={venue.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {venue.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {venue.city}, {venue.state}
                    </p>
                    <p className="text-xs text-gray-400">
                      Model: {venue.machine_model || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No venues found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimplifiedSuperAdmin;
