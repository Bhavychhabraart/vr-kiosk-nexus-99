
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, RefreshCw } from "lucide-react";
import { useWebSocketSettings, useKioskSettings } from "@/hooks/useSettings";
import { WebSocketSettings, KioskSettings } from "@/types";

export function SettingsTab() {
  // WebSocket settings
  const { 
    settings: wsSettings, 
    isLoading: wsLoading, 
    updateSettings: updateWsSettings,
    isUpdating: wsUpdating
  } = useWebSocketSettings();
  
  const [webSocketForm, setWebSocketForm] = useState<WebSocketSettings>({
    url: 'ws://localhost:8081',
    reconnectAttempts: 5,
    reconnectDelay: 2000
  });

  // Kiosk settings
  const {
    settings: kioskSettings,
    isLoading: kioskLoading,
    updateSettings: updateKioskSettings,
    isUpdating: kioskUpdating
  } = useKioskSettings();
  
  const [kioskForm, setKioskForm] = useState<KioskSettings>({
    name: 'VR Kiosk',
    location: 'Main Hall',
    idleTimeout: 300
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (wsSettings) {
      setWebSocketForm(wsSettings);
    }
  }, [wsSettings]);

  useEffect(() => {
    if (kioskSettings) {
      setKioskForm(kioskSettings);
    }
  }, [kioskSettings]);

  // Handle WebSocket form submission
  const handleWebSocketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateWsSettings(webSocketForm);
  };

  // Handle Kiosk form submission
  const handleKioskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKioskSettings(kioskForm);
  };

  return (
    <div className="space-y-6">
      {/* WebSocket Settings */}
      <Card className="vr-card">
        <form onSubmit={handleWebSocketSubmit}>
          <CardHeader>
            <CardTitle>WebSocket Connection</CardTitle>
            <CardDescription>
              Configure the connection to your VR Command Center
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wsLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-vr-secondary" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="wsUrl">WebSocket Server URL</Label>
                  <Input
                    id="wsUrl"
                    placeholder="ws://localhost:8081"
                    value={webSocketForm.url}
                    onChange={(e) => 
                      setWebSocketForm({ ...webSocketForm, url: e.target.value })
                    }
                    className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reconnectAttempts">Reconnection Attempts</Label>
                    <Input
                      id="reconnectAttempts"
                      type="number"
                      min={1}
                      max={20}
                      value={webSocketForm.reconnectAttempts}
                      onChange={(e) => 
                        setWebSocketForm({ 
                          ...webSocketForm, 
                          reconnectAttempts: parseInt(e.target.value) || 5
                        })
                      }
                      className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reconnectDelay">Reconnection Delay (ms)</Label>
                    <Input
                      id="reconnectDelay"
                      type="number"
                      min={100}
                      max={10000}
                      step={100}
                      value={webSocketForm.reconnectDelay}
                      onChange={(e) => 
                        setWebSocketForm({ 
                          ...webSocketForm, 
                          reconnectDelay: parseInt(e.target.value) || 2000
                        })
                      }
                      className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="bg-vr-secondary text-vr-dark hover:bg-vr-secondary/90"
              disabled={wsLoading || wsUpdating}
            >
              {wsUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save WebSocket Settings
                </>
              )}
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="ml-2 border-vr-primary/30 hover:bg-vr-primary/10"
              onClick={() => {
                if (wsSettings) setWebSocketForm(wsSettings);
              }}
              disabled={wsLoading || wsUpdating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Kiosk Settings */}
      <Card className="vr-card">
        <form onSubmit={handleKioskSubmit}>
          <CardHeader>
            <CardTitle>Kiosk Settings</CardTitle>
            <CardDescription>
              Configure your VR kiosk information and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {kioskLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-vr-secondary" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="kioskName">Kiosk Name</Label>
                  <Input
                    id="kioskName"
                    placeholder="VR Kiosk"
                    value={kioskForm.name}
                    onChange={(e) => 
                      setKioskForm({ ...kioskForm, name: e.target.value })
                    }
                    className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Main Hall"
                    value={kioskForm.location}
                    onChange={(e) => 
                      setKioskForm({ ...kioskForm, location: e.target.value })
                    }
                    className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idleTimeout">Idle Timeout (seconds)</Label>
                  <Input
                    id="idleTimeout"
                    type="number"
                    min={60}
                    max={1800}
                    value={kioskForm.idleTimeout}
                    onChange={(e) => 
                      setKioskForm({ 
                        ...kioskForm, 
                        idleTimeout: parseInt(e.target.value) || 300
                      })
                    }
                    className="bg-vr-dark border-vr-primary/30 focus:border-vr-secondary"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="bg-vr-secondary text-vr-dark hover:bg-vr-secondary/90"
              disabled={kioskLoading || kioskUpdating}
            >
              {kioskUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Kiosk Settings
                </>
              )}
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="ml-2 border-vr-primary/30 hover:bg-vr-primary/10"
              onClick={() => {
                if (kioskSettings) setKioskForm(kioskSettings);
              }}
              disabled={kioskLoading || kioskUpdating}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default SettingsTab;
