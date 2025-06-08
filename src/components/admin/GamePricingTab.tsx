
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  DollarSign,
  Edit,
  Save,
  Plus,
  Trash2,
  Building2
} from "lucide-react";
import { useGamePricing } from "@/hooks/useGamePricing";
import { useGames } from "@/hooks/useGames";

interface GamePricingTabProps {
  selectedVenueId?: string | null;
}

const GamePricingTab = ({ selectedVenueId }: GamePricingTabProps) => {
  const { games } = useGames();
  const { gamePricing, updateGamePricing, calculatePrice } = useGamePricing(selectedVenueId);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [pricingForm, setPricingForm] = useState({
    base_price: 50,
    price_per_minute: 15,
    duration_packages: [] as Array<{ duration_minutes: number; price: number }>
  });

  const handleEditGame = (gameId: string) => {
    const existingPricing = gamePricing?.find(p => p.game_id === gameId);
    if (existingPricing) {
      setPricingForm({
        base_price: existingPricing.base_price,
        price_per_minute: existingPricing.price_per_minute,
        duration_packages: existingPricing.duration_packages || []
      });
    }
    setEditingGame(gameId);
  };

  const handleSavePricing = (gameId: string) => {
    if (!selectedVenueId) return;

    updateGamePricing.mutate({
      venue_id: selectedVenueId,
      game_id: gameId,
      ...pricingForm,
      is_active: true
    });

    setEditingGame(null);
  };

  const addDurationPackage = () => {
    setPricingForm(prev => ({
      ...prev,
      duration_packages: [...prev.duration_packages, { duration_minutes: 5, price: 75 }]
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

  const removeDurationPackage = (index: number) => {
    setPricingForm(prev => ({
      ...prev,
      duration_packages: prev.duration_packages.filter((_, i) => i !== index)
    }));
  };

  if (!selectedVenueId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Venue</h3>
            <p className="text-muted-foreground">
              Choose a venue from the filter above to manage game pricing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Game Pricing Management
          </h2>
          <p className="text-muted-foreground">
            Set individual prices for each game at this venue
          </p>
        </div>
      </div>

      {games && games.length > 0 ? (
        <div className="grid gap-6">
          {games.filter(game => game.is_active).map((game) => {
            const pricing = gamePricing?.find(p => p.game_id === game.id);
            const isEditing = editingGame === game.id;

            return (
              <Card key={game.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center space-x-4">
                    {game.image_url && (
                      <img 
                        src={game.image_url} 
                        alt={game.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-xl">{game.title}</CardTitle>
                      <CardDescription>{game.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pricing && (
                      <Badge variant="outline">
                        Base: ₹{pricing.base_price} + ₹{pricing.price_per_minute}/min
                      </Badge>
                    )}
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGame(game.id)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {pricing ? 'Edit' : 'Set'} Pricing
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSavePricing(game.id)}
                        disabled={updateGamePricing.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {isEditing && (
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Base Price (₹)</label>
                        <Input
                          type="number"
                          value={pricingForm.base_price}
                          onChange={(e) => setPricingForm(prev => ({
                            ...prev,
                            base_price: parseFloat(e.target.value) || 0
                          }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Fixed price for starting the game
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Price per Minute (₹)</label>
                        <Input
                          type="number"
                          value={pricingForm.price_per_minute}
                          onChange={(e) => setPricingForm(prev => ({
                            ...prev,
                            price_per_minute: parseFloat(e.target.value) || 0
                          }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Additional charge per minute of gameplay
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Duration Packages</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addDurationPackage}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Package
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {pricingForm.duration_packages.map((pkg, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <div className="flex-1">
                              <label className="text-sm font-medium">Duration (minutes)</label>
                              <Input
                                type="number"
                                value={pkg.duration_minutes}
                                onChange={(e) => updateDurationPackage(
                                  index, 
                                  'duration_minutes', 
                                  parseInt(e.target.value) || 0
                                )}
                                className="mt-1"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-sm font-medium">Package Price (₹)</label>
                              <Input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => updateDurationPackage(
                                  index, 
                                  'price', 
                                  parseFloat(e.target.value) || 0
                                )}
                                className="mt-1"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeDurationPackage(index)}
                              className="mt-6"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {pricingForm.duration_packages.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No duration packages set. Pricing will be calculated as base price + (minutes × per-minute rate)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Pricing Preview</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">5 minutes:</span>
                          <span className="ml-2">₹{pricingForm.base_price + (pricingForm.price_per_minute * 5)}</span>
                        </div>
                        <div>
                          <span className="font-medium">10 minutes:</span>
                          <span className="ml-2">₹{pricingForm.base_price + (pricingForm.price_per_minute * 10)}</span>
                        </div>
                        <div>
                          <span className="font-medium">15 minutes:</span>
                          <span className="ml-2">₹{pricingForm.base_price + (pricingForm.price_per_minute * 15)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}

                {!isEditing && pricing && (
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span className="font-medium">₹{pricing.base_price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per Minute:</span>
                        <span className="font-medium">₹{pricing.price_per_minute}</span>
                      </div>
                      
                      {pricing.duration_packages && pricing.duration_packages.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Duration Packages</h4>
                          <div className="space-y-1">
                            {pricing.duration_packages.map((pkg, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{pkg.duration_minutes} minutes:</span>
                                <span className="font-medium">₹{pkg.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No Games Available</h3>
            <p className="text-muted-foreground">
              Add games to start configuring pricing
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamePricingTab;
