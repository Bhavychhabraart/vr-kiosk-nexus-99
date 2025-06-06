
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Lock, Mail, User, UserPlus, MapPin, CheckCircle2 } from 'lucide-react';
import { useAdminSignup } from '@/hooks/useAdminSignup';

interface AdminSignupProps {
  onBack: () => void;
}

const AdminSignup = ({ onBack }: AdminSignupProps) => {
  const [step, setStep] = useState<'product-key' | 'user-details'>('product-key');
  const [productKey, setProductKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [keyValidationError, setKeyValidationError] = useState('');
  
  const { isLoading, validatedVenue, validateProductKey, signUpAdmin, clearValidation } = useAdminSignup();
  const navigate = useNavigate();

  const handleProductKeyValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productKey) return;

    setKeyValidationError('');
    const result = await validateProductKey(productKey);
    
    if (result.success) {
      setStep('user-details');
    } else {
      setKeyValidationError(result.error || 'Invalid product key');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signUpAdmin(email, password, fullName, productKey);
    
    if (result.success) {
      // Redirect to machine admin after successful signup
      navigate('/machine-admin');
    }
  };

  const handleBack = () => {
    if (step === 'user-details') {
      setStep('product-key');
      clearValidation();
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vr-primary/10 to-vr-secondary/10 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-vr-primary/10 rounded-full">
              <UserPlus className="w-8 h-8 text-vr-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Machine Admin Signup</CardTitle>
          <CardDescription>
            {step === 'product-key' 
              ? 'Enter your Product Verification Key to get started'
              : 'Create your admin account'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === 'product-key' ? (
            <form onSubmit={handleProductKeyValidation} className="space-y-6">
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
                {keyValidationError && (
                  <p className="text-sm text-red-600">{keyValidationError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back to Login
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={!productKey || isLoading}
                >
                  {isLoading ? 'Validating...' : 'Validate Key'}
                </Button>
              </div>

              {/* Sample Keys for Testing */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-2">Sample Keys for Testing:</p>
                <div className="space-y-1 text-xs text-blue-700">
                  <div>Delhi: AUTH-VRX001-DEL-9K7M</div>
                  <div>Mumbai: AUTH-VRX002-MUM-3P8N</div>
                  <div>Bangalore: AUTH-VRX003-BLR-5R2T</div>
                  <div>Chennai: AUTH-VRX004-CHE-7W9Q</div>
                  <div>Hyderabad: AUTH-VRX005-HYD-4L6X</div>
                  <div>Pune: AUTH-VRX006-PUN-8N4L</div>
                  <div>Kolkata: AUTH-VRX007-KOL-2M9P</div>
                </div>
              </div>
            </form>
          ) : (
            <>
              {/* Validated Machine Info */}
              {validatedVenue && (
                <Card className="p-4 bg-green-50 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Machine Validated</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{validatedVenue.name}</span>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {validatedVenue.city}, {validatedVenue.state}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Model: {validatedVenue.machine_model}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Serial: {validatedVenue.serial_number}
                    </div>
                  </div>
                </Card>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={!fullName || !email || !password || isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Admin Account'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignup;
