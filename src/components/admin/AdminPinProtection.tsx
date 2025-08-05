
import { useState } from "react";
import { useAdminPassword } from "@/hooks/useAdminPassword";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock } from "lucide-react";

interface AdminPinProtectionProps {
  venueId: string;
  onSuccess: () => void;
  children: React.ReactNode;
}

const AdminPinProtection = ({ venueId, onSuccess, children }: AdminPinProtectionProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const { verifyAdminPassword, isVerifying } = useAdminPassword();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    try {
      const result = await verifyAdminPassword.mutateAsync({
        venueId,
        password: password.trim()
      });

      if (result) {
        setIsAuthenticated(true);
        onSuccess();
      }
    } catch (error) {
      console.error('Admin password verification failed:', error);
    } finally {
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-vr-primary" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Access Required
          </CardTitle>
          <CardDescription>
            Enter the admin PIN to access machine administration features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin PIN</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin PIN"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isVerifying}
                autoFocus
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isVerifying || !password.trim()}
            >
              {isVerifying ? "Verifying..." : "Access Admin Panel"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPinProtection;
