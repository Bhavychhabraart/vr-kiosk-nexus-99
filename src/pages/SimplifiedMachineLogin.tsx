
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Lock, MapPin, ArrowRight, Settings } from 'lucide-react';
import { useMachineAuth } from '@/hooks/useMachineAuth';
import { Venue } from '@/types/business';

const SimplifiedMachineLogin = () => {
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [accessKey, setAccessKey] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [error, setError] = useState('');
  
  const { authenticateMachine, isLoading, fetchActiveVenues, isAuthenticated } = useMachineAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/machine-admin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoadingVenues(true);
    const venueList = await fetchActiveVenues();
    setVenues(venueList);
    setLoadingVenues(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedVenueId || !accessKey) {
      setError('Please select a machine and enter your access key');
      return;
    }

    const success = await authenticateMachine(selectedVenueId, accessKey);
    if (success) {
      navigate('/machine-admin');
    } else {
      setError('Invalid access key for the selected machine');
    }
  };

  const selectedVenue = venues.find(v => v.id === selectedVenueId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vr-primary/10 to-vr-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-vr-primary/10 rounded-full">
              <Settings className="w-8 h-8 text-vr-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Machine Admin Access</CardTitle>
          <CardDescription>
            Select your VR machine and enter your access key
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Machine Selection */}
            <div className="space-y-2">
              <Label htmlFor="machine">Select Your Machine</Label>
              {loadingVenues ? (
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              ) : (
                <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your machine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span className="font-medium">{venue.name}</span>
                          <span className="text-muted-foreground">({venue.city})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Selected Machine Info */}
            {selectedVenue && (
              <Card className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedVenue.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {selectedVenue.city}, {selectedVenue.state}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Model: {selectedVenue.machine_model || 'VR-KIOSK-V1'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Serial: {selectedVenue.serial_number || 'Not specified'}
                  </div>
                </div>
              </Card>
            )}

            {/* Access Key Input */}
            <div className="space-y-2">
              <Label htmlFor="accessKey">Access Key</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="accessKey"
                  type="password"
                  placeholder="Enter your machine access key..."
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your administrator if you don't have your access key
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!selectedVenueId || !accessKey || isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {/* Sample Keys for Testing */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-2">Sample Access Keys for Testing:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <div>Delhi: VRX001-ADMIN-KEY</div>
              <div>Mumbai: VRX002-ADMIN-KEY</div>
              <div>Bangalore: VRX003-ADMIN-KEY</div>
              <div>Chennai: VRX004-ADMIN-KEY</div>
              <div>Hyderabad: VRX005-ADMIN-KEY</div>
              <div>Chandigarh: VRX008-ADMIN-KEY</div>
              <div>Bangalore 2: VRX009-ADMIN-KEY</div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/')}
              className="text-sm"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedMachineLogin;
