
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle2,
  Loader2,
  Search,
  XCircle,
  Clock,
  Play,
  GamepadIcon,
  Eye,
  EyeOff
} from "lucide-react";
import { useMachineGames } from "@/hooks/useMachineGames";

interface MachineGameManagementTabProps {
  venueId: string;
}

const MachineGameManagementTab = ({ venueId }: MachineGameManagementTabProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  const { 
    machineGames, 
    isLoadingMachineGames,
    removeGame,
    isRemoving
  } = useMachineGames(venueId);
  
  // Filter games based on search term
  const filteredGames = machineGames?.filter(game =>
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const handleRemoveGame = () => {
    if (selectedGameId) {
      removeGame(venueId, selectedGameId);
      setIsRemoveDialogOpen(false);
      setSelectedGameId(null);
    }
  };
  
  const openRemoveConfirmation = (gameId: string) => {
    setSelectedGameId(gameId);
    setIsRemoveDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GamepadIcon className="w-6 h-6" />
            Game Management
          </h2>
          <p className="text-muted-foreground">
            Manage which games are available on this machine
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Games</CardTitle>
          <CardDescription>
            Games currently available on this machine. You can enable/disable games here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vr-muted h-4 w-4" />
            <Input
              placeholder="Search assigned games..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoadingMachineGames ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-vr-secondary" />
            </div>
          ) : filteredGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGames.map((game) => (
                <Card key={game.id} className="overflow-hidden">
                  {game.image_url && (
                    <div className="aspect-video bg-gray-200">
                      <img 
                        src={game.image_url} 
                        alt={game.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{game.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {game.description || "No description available"}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Duration:</span>
                        </div>
                        <span>{Math.floor(game.min_duration_seconds / 60)}-{Math.floor(game.max_duration_seconds / 60)} min</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={game.is_active}
                          onCheckedChange={(checked) => {
                            // This would toggle game availability
                            console.log('Toggle game availability:', game.id, checked);
                          }}
                        />
                        <div className="flex items-center gap-1">
                          {game.is_active ? (
                            <>
                              <Eye className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-600">Enabled</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Disabled</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openRemoveConfirmation(game.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? `No games found matching "${searchTerm}"` : "No games assigned"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "Try adjusting your search terms" 
                  : "Contact your Super Admin to assign games to this machine"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Remove Game Confirmation Dialog */}
      <AlertDialog 
        open={isRemoveDialogOpen} 
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Game from Machine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this game from the machine? 
              This will make it unavailable for new sessions on this machine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveGame}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Game'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MachineGameManagementTab;
