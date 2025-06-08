
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Wifi, Volume2, Monitor } from "lucide-react";
import AdminPasswordSetup from "@/components/admin/AdminPasswordSetup";

interface MachineSettingsTabProps {
  venueId: string;
}

const MachineSettingsTab = ({ venueId }: MachineSettingsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Machine Settings
          </h2>
          <p className="text-muted-foreground">
            Configure machine preferences and security settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin PIN Protection */}
        <AdminPasswordSetup venueId={venueId} />

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Current machine status and connectivity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Network Status</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">VR System</span>
              <Badge variant="default">Ready</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment System</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">RFID Reader</span>
              <Badge variant="default">Online</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Display Settings
            </CardTitle>
            <CardDescription>
              Configure display brightness and theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Brightness</span>
              <span className="text-sm text-muted-foreground">80%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Theme</span>
              <span className="text-sm text-muted-foreground">Dark</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Screen Timeout</span>
              <span className="text-sm text-muted-foreground">10 minutes</span>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Audio Settings
            </CardTitle>
            <CardDescription>
              Configure audio volume and effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Master Volume</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sound Effects</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice Prompts</span>
              <Badge variant="default">Enabled</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MachineSettingsTab;
