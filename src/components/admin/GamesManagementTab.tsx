
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GamepadIcon,
  Building2,
  Info
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGames } from "@/hooks/useGames";
import GameForm from "./GameForm";
import VenueGamesManagementTab from "./VenueGamesManagementTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GamesManagementTabProps {
  selectedVenueId?: string | null;
}

const GamesManagementTab = ({ selectedVenueId }: GamesManagementTabProps) => {
  const { games, isLoading, toggleGameStatus, deleteGame } = useGames();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingGame, setEditingGame] = useState<any>(null);
  const [showGameForm, setShowGameForm] = useState(false);

  const filteredGames = games?.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "active" && game.is_active) ||
      (filterStatus === "inactive" && !game.is_active);
    
    return matchesSearch && matchesFilter;
  }) || [];

  const handleEditGame = (game: any) => {
    setEditingGame(game);
    setShowGameForm(true);
  };

  const handleAddGame = () => {
    setEditingGame(null);
    setShowGameForm(true);
  };

  const handleCloseForm = () => {
    setShowGameForm(false);
    setEditingGame(null);
  };

  if (showGameForm) {
    return (
      <GameForm 
        game={editingGame} 
        onClose={handleCloseForm}
        venueId={selectedVenueId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GamepadIcon className="w-6 h-6" />
            Games Management
          </h2>
          <p className="text-muted-foreground">
            Manage games globally and control venue-specific availability
          </p>
        </div>
      </div>

      <Tabs defaultValue="venue-specific" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="venue-specific">Venue-Specific Games</TabsTrigger>
          <TabsTrigger value="global">Global Game Management</TabsTrigger>
        </TabsList>

        <TabsContent value="venue-specific" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Venue Game Availability
              </CardTitle>
              <CardDescription>
                Control which games are available for customers at specific venues. 
                All active games are automatically assigned to all venues.
              </CardDescription>
            </CardHeader>
          </Card>
          <VenueGamesManagementTab selectedVenueId={selectedVenueId} />
        </TabsContent>

        <TabsContent value="global" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Global Game Management
              </CardTitle>
              <CardDescription>
                Manage the global game catalog. When you activate a game here, it becomes available across all venues.
                When you deactivate a game, it's removed from all venues.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search games..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="active">Active Games</SelectItem>
                  <SelectItem value="inactive">Inactive Games</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddGame} className="ml-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Game
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={game.image_url || "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop"}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={game.is_active ? "default" : "secondary"}>
                        {game.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{game.title}</span>
                      <div className="flex items-center space-x-1">
                        <Switch
                          checked={game.is_active}
                          onCheckedChange={(checked) => 
                            toggleGameStatus(game.id, checked)
                          }
                        />
                        {game.is_active ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {game.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{Math.floor(game.min_duration_seconds / 60)}-{Math.floor(game.max_duration_seconds / 60)} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge variant={game.is_active ? "default" : "secondary"} className="text-xs">
                          {game.is_active ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGame(game)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGame(game.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredGames.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-12">
                <GamepadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Games Found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || filterStatus !== "all" 
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first game to the platform"
                  }
                </p>
                {!searchQuery && filterStatus === "all" && (
                  <Button onClick={handleAddGame}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Game
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamesManagementTab;
