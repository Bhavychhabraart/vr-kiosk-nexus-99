
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Lock, MapPin, Settings } from 'lucide-react';
import { useMachineAuth } from '@/hooks/useMachineAuth';
import { Venue } from '@/types/business';

interface MachineAuthLoginProps {
  onSuccess: () => void;
}

const MachineAuthLogin = ({ onSuccess }: MachineAuthLoginProps) => {
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [productKey, setProductKey] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  
  const { authenticateMachine, isLoading, fetchActiveVenues } = useMachineAuth();

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
    if (!selectedVenue || !productKey) return;

    const success = await authenticateMachine(selectedVenue, productKey);
    if (success) {
      onSuccess();
    }
  };

  const selectedVenueData = venues.find(v => v.id === selectedVenue);

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
            Select your machine and enter your Product Verification Key
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Machine Selection */}
            <div className="space-y-2">
              <Label htmlFor="venue">Select Your Machine</Label>
              {loadingVenues ? (
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              ) : (
                <Select value={selectedVenue} onValueChange={setSelectedVenue}>
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
            {selectedVenueData && (
              <Card className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedVenueData.name}</span>
                    <Badge variant={selectedVenueData.status === 'active' ? 'default' : 'secondary'}>
                      {selectedVenueData.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {selectedVenueData.city}, {selectedVenueData.state}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Model: {selectedVenueData.machine_model || 'Not specified'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Serial: {selectedVenueData.serial_number || 'Not specified'}
                  </div>
                </div>
              </Card>
            )}

            {/* Product Key Input */}
            <div className="space-y-2">
              <Label htmlFor="productKey">Product Verification Key</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="productKey"
                  type="password"
                  placeholder="Enter your product key..."
                  value={productKey}
                  onChange={(e) => setProductKey(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Contact your administrator if you don't have your Product Key
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!selectedVenue || !productKey || isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>

          {/* Sample Keys for Testing */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-2">Sample Keys for Testing:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <div>Delhi: AUTH-VRX001-DEL-9K7M</div>
              <div>Mumbai: AUTH-VRX002-MUM-3P8N</div>
              <div>Bangalore: AUTH-VRX003-BLR-5R2T</div>
              <div>Chennai: AUTH-VRX004-CHE-7W9Q</div>
              <div>Hyderabad: AUTH-VRX005-HYD-4L6X</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineAuthLogin;
