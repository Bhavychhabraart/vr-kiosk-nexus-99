
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserSetup } from "@/hooks/useUserSetup";
import { Settings, User, Building, Gamepad2 } from "lucide-react";

const UserGameVenueSetup = () => {
  const [email, setEmail] = useState("");
  const [venueName, setVenueName] = useState("");
  const [role, setRole] = useState<'super_admin' | 'machine_admin'>('machine_admin');
  const [createVenue, setCreateVenue] = useState(true);
  const [assignAllGames, setAssignAllGames] = useState(true);

  const { setupUser, isSetupPending } = useUserSetup();

  const handleSetup = () => {
    if (!email.trim()) {
      return;
    }

    setupUser({
      email: email.trim(),
      assignAllGames,
      createVenue,
      venueName: venueName.trim() || undefined,
      role
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Complete User Setup
        </CardTitle>
        <CardDescription>
          Set up a user with venue, games, and access permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">User Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="role">User Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'super_admin' | 'machine_admin')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="machine_admin">Machine Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="createVenue" 
              checked={createVenue}
              onCheckedChange={(checked) => setCreateVenue(checked === true)}
            />
            <Label htmlFor="createVenue" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Create new venue for user
            </Label>
          </div>

          {createVenue && (
            <div>
              <Label htmlFor="venueName">Venue Name (optional)</Label>
              <Input
                id="venueName"
                placeholder="Leave empty for auto-generated name"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="assignAllGames" 
              checked={assignAllGames}
              onCheckedChange={(checked) => setAssignAllGames(checked === true)}
            />
            <Label htmlFor="assignAllGames" className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Assign all active games to venue
            </Label>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Setup will include:</h4>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <User className="w-3 h-3" />
              Assign {role.replace('_', ' ')} role to user
            </li>
            {createVenue && (
              <li className="flex items-center gap-2">
                <Building className="w-3 h-3" />
                Create venue with machine authentication
              </li>
            )}
            {assignAllGames && (
              <li className="flex items-center gap-2">
                <Gamepad2 className="w-3 h-3" />
                Assign all active games to venue
              </li>
            )}
            <li className="flex items-center gap-2">
              <Settings className="w-3 h-3" />
              Configure venue settings and launch options
            </li>
          </ul>
        </div>

        <Button 
          onClick={handleSetup}
          disabled={isSetupPending || !email.trim()}
          className="w-full"
        >
          {isSetupPending ? (
            <>
              <Settings className="w-4 h-4 mr-2 animate-spin" />
              Setting up user...
            </>
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              Complete User Setup
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserGameVenueSetup;
