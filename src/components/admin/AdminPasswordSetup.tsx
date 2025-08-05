
import { useState } from "react";
import { useAdminPassword } from "@/hooks/useAdminPassword";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Lock } from "lucide-react";

interface AdminPasswordSetupProps {
  venueId: string;
}

const AdminPasswordSetup = ({ venueId }: AdminPasswordSetupProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [enabled, setEnabled] = useState(true);
  const { setAdminPassword, isSettingPassword } = useAdminPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 4) {
      return;
    }

    setAdminPassword.mutate({
      venueId,
      password,
      enabled
    });

    setPassword("");
    setConfirmPassword("");
  };

  const isValid = password.length >= 4 && password === confirmPassword;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin PIN Protection
        </CardTitle>
        <CardDescription>
          Set up a PIN to protect admin panel access for this machine
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="protection-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
            <Label htmlFor="protection-enabled">
              Enable PIN protection
            </Label>
          </div>

          {enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Admin PIN</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter 4+ digit PIN"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSettingPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm PIN</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your PIN"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSettingPassword}
                />
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-600">PINs do not match</p>
              )}

              {password && password.length < 4 && (
                <p className="text-sm text-red-600">PIN must be at least 4 characters</p>
              )}
            </>
          )}

          <Button 
            type="submit" 
            disabled={enabled && !isValid || isSettingPassword}
            className="w-full"
          >
            {isSettingPassword ? "Saving..." : "Save PIN Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminPasswordSetup;
