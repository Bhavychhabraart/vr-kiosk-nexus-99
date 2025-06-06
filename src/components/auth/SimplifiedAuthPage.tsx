import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, User, ArrowRight, Crown, Settings, Building2, Info, Key, Copy, CheckCheck } from 'lucide-react';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { useAdminSignup } from '@/hooks/useAdminSignup';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface MachineInfo {
  id: string;
  name: string;
  city: string;
  state: string;
  serial_number: string;
  machine_model: string;
  product_key: string;
  product_id: string;
}

const SimplifiedAuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [validatedProductKey, setValidatedProductKey] = useState<string>('');
  const [availableMachines, setAvailableMachines] = useState<MachineInfo[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string>('');
  const { signIn, signUp, signUpWithInvitation, user } = useSimplifiedAuth();
  const { signUpAdmin, validateProductKey, validatedVenue, isLoading: adminSignupLoading, clearValidation } = useAdminSignup();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const invitationToken = searchParams.get('token');
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  useEffect(() => {
    loadAvailableMachines();
  }, []);

  const loadAvailableMachines = async () => {
    setLoadingMachines(true);
    try {
      const { data: machinesData, error } = await supabase
        .from('venues')
        .select(`
          id,
          name,
          city,
          state,
          serial_number,
          machine_model,
          machine_auth!inner (
            product_key,
            product_id
          )
        `)
        .eq('status', 'active')
        .eq('machine_auth.is_active', true)
        .order('name');

      if (error) throw error;

      const machines: MachineInfo[] = machinesData?.map(venue => ({
        id: venue.id,
        name: venue.name,
        city: venue.city,
        state: venue.state,
        serial_number: venue.serial_number || '',
        machine_model: venue.machine_model || 'VR-KIOSK-V1',
        product_key: venue.machine_auth[0]?.product_key || '',
        product_id: venue.machine_auth[0]?.product_id || '',
      })) || [];

      setAvailableMachines(machines);
    } catch (error) {
      console.error('Error loading machines:', error);
    } finally {
      setLoadingMachines(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'key' | 'id') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(text);
      toast({
        title: "Copied!",
        description: `${type === 'key' ? 'Product key' : 'Machine ID'} copied to clipboard`,
      });
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Normalize machine ID for comparison (remove hyphens, convert to uppercase)
  const normalizeMachineId = (id: string) => {
    return id.replace(/[-\s]/g, '').toUpperCase();
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const handleSuperAdminSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const handleMachineAdminSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const result = await signUpAdmin(email, password, fullName, validatedProductKey);
    
    if (result.error) {
      setError(result.error);
    }
  };

  const handleInvitationSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    if (!invitationToken) {
      setError('Invalid invitation link');
      setIsLoading(false);
      return;
    }

    const { error } = await signUpWithInvitation(email, password, fullName, invitationToken);
    
    if (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@arcadiavr.com?subject=Machine Admin Access Request';
  };

  const handleProductKeyValidation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const formData = new FormData(e.currentTarget);
    const productKey = (formData.get('productKey') as string).trim().toUpperCase();
    const machineId = (formData.get('machineId') as string).trim().toUpperCase();

    console.log('Form submission:', { productKey, machineId });

    if (!productKey || !machineId) {
      setError('Please fill in both Machine ID and Product Key');
      return;
    }

    // Basic format validation for product key
    if (!productKey.includes('AUTH-') || productKey.length < 15) {
      setError('Product key format appears invalid. Expected format: AUTH-XXX-XXX-XXXX');
      return;
    }

    const validation = await validateProductKey(productKey);
    if (!validation.success) {
      console.error('Product key validation failed:', validation);
      setError(validation.error || 'Invalid product key');
      return;
    }

    const normalizedInput = normalizeMachineId(machineId);
    const normalizedVenueSerial = normalizeMachineId(validation.venue?.serial_number || '');

    console.log('Machine ID comparison:', {
      userInput: machineId,
      normalizedInput,
      venueSerial: validation.venue?.serial_number,
      normalizedVenueSerial,
      match: normalizedInput === normalizedVenueSerial
    });

    if (validation.venue && normalizedInput !== normalizedVenueSerial) {
      setError(`Machine ID "${machineId}" does not match the product key. Expected: ${validation.venue.serial_number}`);
      clearValidation();
      return;
    }

    setValidatedProductKey(productKey);
    console.log('Validation successful, product key set:', productKey);
  };

  const handleClearValidation = () => {
    clearValidation();
    setValidatedProductKey('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vr-primary/10 to-vr-secondary/10 p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-vr-primary/10 rounded-full">
              <Lock className="w-8 h-8 text-vr-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">VR Kiosk Admin</CardTitle>
          <CardDescription>
            {invitationToken 
              ? 'Complete your machine admin registration'
              : 'Sign in or create your admin account'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invitationToken ? (
            // Invitation signup form
            <form onSubmit={handleInvitationSignUp} className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <Settings className="w-4 h-4" />
                  Machine Admin Invitation
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="invitation-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invitation-name"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitation-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invitation-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitation-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invitation-password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Join as Machine Admin'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            // Regular auth tabs
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="machine-admin">Machine Admin</TabsTrigger>
                <TabsTrigger value="super-admin">Super Admin</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="machine-admin">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    <Key className="w-4 h-4" />
                    Machine Admin Registration
                  </div>
                </div>

                {!validatedVenue ? (
                  <div className="space-y-6">
                    {/* Available Machines Reference Table */}
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Available Machines
                        </CardTitle>
                        <CardDescription>
                          Find your machine and copy its details below
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingMachines ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-muted-foreground mt-2">Loading machines...</p>
                          </div>
                        ) : availableMachines.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Venue</TableHead>
                                  <TableHead>Location</TableHead>
                                  <TableHead>Machine ID</TableHead>
                                  <TableHead>Product Key</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {availableMachines.map((machine) => (
                                  <TableRow key={machine.id}>
                                    <TableCell className="font-medium">
                                      {machine.name}
                                    </TableCell>
                                    <TableCell>
                                      {machine.city}, {machine.state}
                                    </TableCell>
                                    <TableCell>
                                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                        {machine.serial_number}
                                      </code>
                                    </TableCell>
                                    <TableCell>
                                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                        {machine.product_key}
                                      </code>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(machine.serial_number, 'id')}
                                        >
                                          {copiedKey === machine.serial_number ? (
                                            <CheckCheck className="w-3 h-3" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => copyToClipboard(machine.product_key, 'key')}
                                        >
                                          {copiedKey === machine.product_key ? (
                                            <CheckCheck className="w-3 h-3" />
                                          ) : (
                                            <Copy className="w-3 h-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-muted-foreground">No machines found</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Validation Form */}
                    <form onSubmit={handleProductKeyValidation} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="machine-id">Machine ID</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="machine-id"
                            name="machineId"
                            type="text"
                            placeholder="e.g., VRX001DEL or VRX001-DEL"
                            className="pl-10 uppercase"
                            required
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Copy from the table above or enter your machine's serial number
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="product-key">Product Key</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="product-key"
                            name="productKey"
                            type="text"
                            placeholder="e.g., AUTH-VRX001-DEL-9K7M"
                            className="pl-10 uppercase"
                            required
                            onChange={(e) => {
                              e.target.value = e.target.value.toUpperCase();
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Copy from the table above or use the key provided with your VR kiosk
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={adminSignupLoading}
                      >
                        {adminSignupLoading ? 'Validating...' : 'Validate Machine'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  // Validated venue form
                  <div className="space-y-4">
                    <Alert>
                      <Building2 className="h-4 w-4" />
                      <AlertDescription>
                        Machine validated: <strong>{validatedVenue.name}</strong> in {validatedVenue.city}, {validatedVenue.state}
                        <br />
                        <span className="text-sm text-muted-foreground">Serial: {validatedVenue.serial_number}</span>
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleMachineAdminSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="machine-admin-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="machine-admin-name"
                            name="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="machine-admin-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="machine-admin-email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="machine-admin-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="machine-admin-password"
                            name="password"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={adminSignupLoading}
                      >
                        {adminSignupLoading ? 'Creating Account...' : 'Create Machine Admin Account'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={handleClearValidation}
                      >
                        Back to Validation
                      </Button>
                    </form>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="super-admin">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    <Crown className="w-4 h-4" />
                    Super Admin Registration
                  </div>
                </div>

                <form onSubmit={handleSuperAdminSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Super Admin Account'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* Information Section */}
          <div className="mt-6 space-y-3">
            <div className="border-t pt-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    How to Get Admin Access
                  </p>
                  <ul className="text-blue-700 mb-2 space-y-1 list-disc list-inside">
                    <li><strong>Machine Admins:</strong> Use your Machine ID and Product Key from the table above</li>
                    <li><strong>Invitations:</strong> Accept invitation emails from Super Admins</li>
                    <li><strong>Support:</strong> Contact support for assistance</li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContactSupport}
                    className="text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedAuthPage;
