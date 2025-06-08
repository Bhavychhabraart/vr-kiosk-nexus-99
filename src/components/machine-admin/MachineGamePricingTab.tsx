
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGamePricing } from "@/hooks/useGamePricing";
import { useMachineGames } from "@/hooks/useMachineGames";
import { DollarSign, Gamepad2, Clock, Plus, X } from "lucide-react";

interface MachineGamePricingTabProps {
  venueId: string;
}

const MachineGamePricingTab = ({ venueId }: MachineGamePricingTabProps) => {
  const { gamePricing, isLoading: isPricingLoading, updateGamePricing } = useGamePricing(venueId);
  const { machineGames, isLoadingMachineGames } = useMachineGames(venueId);
  
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [pricingForm, setPricingForm] = useState({
    base_price: 50,
    price_per_minute: 15,
    duration_packages: [] as Array<{ duration_minutes: number; price: number }>
  });

  const handleGameSelect = (gameId: string) => {
    setSelectedGameId(gameId);
    const existingPricing = gamePricing?.find(p => p.game_id === gameId);
    
    if (existingPricing) {
      setPricingForm({
        base_price: Number(existingPricing.base_price),
        price_per_minute: Number(existingPricing.price_per_minute),
        duration_packages: existingPricing.duration_packages || []
      });
    } else {
      setPricingForm({
        base_price: 50,
        price_per_minute: 15,
        duration_packages: []
      });
    }
  };

  const addDurationPackage = () => {
    setPricingForm(prev => ({
      ...prev,
      duration_packages: [...prev.duration_packages, { duration_minutes: 10, price: 100 }]
    }));
  };

  const removeDurationPackage = (index: number) => {
    setPricingForm(prev => ({
      ...prev,
      duration_packages: prev.duration_packages.filter((_, i) => i !== index)
    }));
  };

  const updateDurationPackage = (index: number, field: 'duration_minutes' | 'price', value: number) => {
    setPricingForm(prev => ({
      ...prev,
      duration_packages: prev.duration_packages.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const handleSavePricing = () => {
    if (!selectedGameId) return;

    updateGamePricing.mutate({
      venue_id: venueId,
      game_id: selectedGameId,
      base_price: pricingForm.base_price,
      price_per_minute: pricingForm.price_per_minute,
      duration_packages: pricingForm.duration_packages
    });
  };

  const selectedGame = machineGames?.find(game => game.id === selectedGameId);
  const selectedGamePricing = gamePricing?.find(p => p.game_id === selectedGameId);

  if (isLoadingMachineGames || isPricingLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Game Pricing
          </h2>
          <p className="text-muted-foreground">
            Set custom pricing for individual games on this machine
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Game</CardTitle>
            <CardDescription>
              Choose a game to configure its pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {machineGames?.map((game) => {
                  const hasPricing = gamePricing?.some(p => p.game_id === game.id);
                  return (
                    <div
                      key={game.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedGameId === game.id ? 'border-vr-primary bg-vr-primary/5' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleGameSelect(game.id)}
                    >
                      <div className="flex items-center gap-3">
                        {game.image_url ? (
                          <img
                            src={game.image_url}
                            alt={game.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                            <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{game.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {hasPricing ? (
                              <Badge variant="default">Custom Pricing</Badge>
                            ) : (
                              <Badge variant="secondary">Default Pricing</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pricing Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedGame ? `Pricing for ${selectedGame.title}` : "Pricing Configuration"}
            </CardTitle>
            <CardDescription>
              {selectedGame 
                ? "Configure custom pricing for this game"
                : "Select a game to configure its pricing"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedGame ? (
              <div className="space-y-6">
                {/* Base Pricing */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="base-price">Base Price (₹)</Label>
                    <Input
                      id="base-price"
                      type="number"
                      min="0"
                      step="1"
                      value={pricingForm.base_price}
                      onChange={(e) => setPricingForm(prev => ({
                        ...prev,
                        base_price: parseFloat(e.target.value) || 0
                      }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Fixed cost to start the game
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price-per-minute">Price per Minute (₹)</Label>
                    <Input
                      id="price-per-minute"
                      type="number"
                      min="0"
                      step="0.5"
                      value={pricingForm.price_per_minute}
                      onChange={(e) => setPricingForm(prev => ({
                        ...prev,
                        price_per_minute: parseFloat(e.target.value) || 0
                      }))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Additional cost per minute of gameplay
                    </p>
                  </div>
                </div>

                {/* Duration Packages */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Duration Packages</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addDurationPackage}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </div>
                  
                  {pricingForm.duration_packages.map((pkg, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Duration (min)</Label>
                          <Input
                            type="number"
                            min="1"
                            value={pkg.duration_minutes}
                            onChange={(e) => updateDurationPackage(index, 'duration_minutes', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Price (₹)</Label>
                          <Input
                            type="number"
                            min="0"
                            value={pkg.price}
                            onChange={(e) => updateDurationPackage(index, 'price', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDurationPackage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {pricingForm.duration_packages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No duration packages configured. Add packages for fixed-price options.
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <Button 
                  onClick={handleSavePricing}
                  disabled={updateGamePricing.isPending}
                  className="w-full"
                >
                  {updateGamePricing.isPending ? "Saving..." : "Save Pricing"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a game from the list to configure its pricing
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MachineGamePricingTab;
