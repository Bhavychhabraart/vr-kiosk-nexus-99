
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Mail, User, Building2, ArrowRight, Info } from 'lucide-react';
import { useSimplifiedMachineAdmin } from '@/hooks/useSimplifiedMachineAdmin';
import { useNavigate } from 'react-router-dom';
import { isDefaultCredential } from '@/utils/defaultCredentials';

interface PrefillData {
  email?: string;
  password?: string;
  serialNumber?: string;
}

interface MachineAdminSignupFormProps {
  prefillData?: PrefillData;
}

export const MachineAdminSignupForm = ({ prefillData }: MachineAdminSignupFormProps) => {
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: prefillData?.email || '',
    password: prefillData?.password || '',
    machineSerialNumber: prefillData?.serialNumber || ''
  });
  
  const { isLoading, signUpMachineAdmin } = useSimplifiedMachineAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (prefillData) {
      setFormData(prev => ({
        ...prev,
        email: prefillData.email || prev.email,
        password: prefillData.password || prev.password,
        machineSerialNumber: prefillData.serialNumber || prev.machineSerialNumber
      }));
    }
  }, [prefillData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.fullName || !formData.machineSerialNumber) {
      setError('Please fill in all fields');
      return;
    }

    const result = await signUpMachineAdmin({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      machineSerialNumber: formData.machineSerialNumber
    });

    if (result.success) {
      // Redirect to machine admin dashboard after successful signup
      navigate('/machine-admin');
    } else if (result.error) {
      setError(result.error);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isUsingDefaultCredentials = isDefaultCredential(
    formData.email, 
    formData.password, 
    formData.machineSerialNumber
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Machine Owner Signup</CardTitle>
        <CardDescription>
          Create your admin account to manage your VR kiosk
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isUsingDefaultCredentials && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Using default credentials for {formData.machineSerialNumber}. 
              You can change your password after signup.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
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
                className="pl-10"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                className="pl-10"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="machineSerialNumber">Machine Serial Number</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="machineSerialNumber"
                type="text"
                placeholder="e.g., VRX001DEL"
                className="pl-10 uppercase font-mono"
                value={formData.machineSerialNumber}
                onChange={(e) => handleInputChange('machineSerialNumber', e.target.value.toUpperCase())}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the serial number found on your VR machine
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
