
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, CheckCircle } from 'lucide-react';
import { DEFAULT_MACHINE_CREDENTIALS } from '@/utils/defaultCredentials';
import { toast } from '@/components/ui/use-toast';

interface DefaultCredentialsHelperProps {
  onCredentialSelect?: (email: string, password: string, serialNumber: string) => void;
}

export const DefaultCredentialsHelper = ({ onCredentialSelect }: DefaultCredentialsHelperProps) => {
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy to clipboard",
      });
    }
  };

  const handleUseCredential = (email: string, password: string, serialNumber: string) => {
    if (onCredentialSelect) {
      onCredentialSelect(email, password, serialNumber);
      toast({
        title: "Credentials selected",
        description: `Using credentials for ${serialNumber}`,
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Default Machine Credentials
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPasswords ? 'Hide' : 'Show'} Passwords
          </Button>
        </CardTitle>
        <CardDescription>
          Pre-configured credentials for all active VR machines. Click "Use" to auto-fill the signup form.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4">
          {DEFAULT_MACHINE_CREDENTIALS.map((credential, index) => (
            <div key={credential.serialNumber} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="font-mono">
                    {credential.serialNumber}
                  </Badge>
                  <h3 className="font-medium mt-1">{credential.venueName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {credential.city}, {credential.state}
                  </p>
                </div>
                {onCredentialSelect && (
                  <Button
                    onClick={() => handleUseCredential(
                      credential.email, 
                      credential.password, 
                      credential.serialNumber
                    )}
                    size="sm"
                  >
                    Use Credentials
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2 py-1 bg-muted rounded text-xs">
                      {credential.email}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(credential.email, index, 'Email')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Password</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-2 py-1 bg-muted rounded text-xs">
                      {showPasswords ? credential.password : '••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(credential.password, index + 100, 'Password')}
                      className="h-6 w-6 p-0"
                    >
                      {copiedIndex === index + 100 ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Usage Instructions</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• These are default credentials for initial setup and testing</li>
            <li>• Each email corresponds to a specific machine serial number</li>
            <li>• Use the "Use Credentials" button to auto-fill the signup form</li>
            <li>• Machine owners should change passwords after first login</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
