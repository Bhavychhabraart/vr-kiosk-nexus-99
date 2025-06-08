
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMachineGames } from "@/hooks/useMachineGames";
import { Gamepad2, Search, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

interface MachineGameManagementTabProps {
  venueId: string;
}

const MachineGameManagementTab = ({ venueId }: MachineGameManagementTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAvailable, setShowAvailable] = useState(false);
  
  const { 
    machineGames, 
    allGames, 
    isLoadingMachineGames, 
    isLoadingAllGames,
    assignGame,
    removeGame,
    toggleGameStatus,
    isAssigning,
    isRemoving,
    isToggling
  } = useMachineGames(venueId);

  const filteredMachineGames = machineGames?.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const availableGames = allGames?.filter(game =>
    !machineGames?.some(mg => mg.id === game.id) &&
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleToggleGame = (machineGameId: string, currentStatus: boolean) => {
    console.log('Handle toggle game:', { machineGameId, currentStatus, newStatus: !currentStatus });
    toggleGameStatus(machineGameId, !currentStatus);
  };

  const handleAssignGame = (gameId: string) => {
    assignGame(venueId, gameId, 'machine_admin');
  };

  const handleRemoveGame = (gameId: string) => {
    if (window.confirm('Are you sure you want to remove this game from the machine?')) {
      removeGame(venueId, gameId);
    }
  };

  if (isLoadingMachineGames) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            Game Management
          </h2>
          <p className="text-muted-foreground">
            Manage games assigned to this machine
          </p>
        </div>
        <Button
          variant={showAvailable ? "default" : "outline"}
          onClick={() => setShowAvailable(!showAvailable)}
        >
          {showAvailable ? "Show Assigned Games" : "Show Available Games"}
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Games List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {showAvailable ? "Available Games" : "Assigned Games"}
          </CardTitle>
          <CardDescription>
            {showAvailable 
              ? "Games that can be assigned to this machine"
              : "Games currently assigned to this machine"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {showAvailable ? (
                // Available Games
                <>
                  {isLoadingAllGames ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : availableGames.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {searchTerm ? "No games found matching your search" : "All games are already assigned"}
                    </p>
                  ) : (
                    availableGames.map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {game.image_url ? (
                            <img
                              src={game.image_url}
                              alt={game.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium">{game.title}</h3>
                            <p className="text-sm text-muted-foreground">{game.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">
                                {Math.floor(game.min_duration_seconds / 60)}-{Math.floor(game.max_duration_seconds / 60)} min
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAssignGame(game.id)}
                          disabled={isAssigning}
                          size="sm"
                        >
                          {isAssigning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Assign"
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </>
              ) : (
                // Assigned Games
                <>
                  {filteredMachineGames.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {searchTerm ? "No games found matching your search" : "No games assigned to this machine"}
                    </p>
                  ) : (
                    filteredMachineGames.map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {game.image_url ? (
                            <img
                              src={game.image_url}
                              alt={game.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                              <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium">{game.title}</h3>
                            <p className="text-sm text-muted-foreground">{game.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary">
                                {Math.floor(game.min_duration_seconds / 60)}-{Math.floor(game.max_duration_seconds / 60)} min
                              </Badge>
                              <Badge variant={game.is_machine_active ? "default" : "secondary"}>
                                {game.is_machine_active ? "Enabled" : "Disabled"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {game.is_machine_active ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <Switch
                              checked={game.is_machine_active}
                              onCheckedChange={() => handleToggleGame(game.machine_game_id, game.is_machine_active)}
                              disabled={isToggling}
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveGame(game.id)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineGameManagementTab;
