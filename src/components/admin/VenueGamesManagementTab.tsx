
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Filter,
  Eye,
  EyeOff,
  GamepadIcon,
  Building2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVenueGames } from "@/hooks/useVenueGames";

interface VenueGamesManagementTabProps {
  selectedVenueId?: string | null;
}

const VenueGamesManagementTab = ({ selectedVenueId }: VenueGamesManagementTabProps) => {
  const { venueGames, isLoading, toggleVenueGameStatus, isToggling } = useVenueGames(selectedVenueId || undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredGames = venueGames?.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "enabled" && game.is_machine_active) ||
      (filterStatus === "disabled" && !game.is_machine_active);
    
    return matchesSearch && matchesFilter;
  }) || [];

  if (!selectedVenueId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Venue</h3>
            <p className="text-muted-foreground">
              Choose a venue from the filter above to manage venue-specific game availability
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
            <GamepadIcon className="w-6 h-6" />
            Venue Game Availability
          </h2>
          <p className="text-muted-foreground">
            Control which games are available for customers at this specific venue
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
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
            <SelectItem value="enabled">Enabled Games</SelectItem>
            <SelectItem value="disabled">Disabled Games</SelectItem>
          </SelectContent>
        </Select>
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
                  <Badge variant={game.is_machine_active ? "default" : "secondary"}>
                    {game.is_machine_active ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{game.title}</span>
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={game.is_machine_active}
                      onCheckedChange={(checked) => 
                        toggleVenueGameStatus(game.machine_game_id, checked)
                      }
                      disabled={isToggling}
                    />
                    {game.is_machine_active ? (
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
                    <Badge variant={game.is_machine_active ? "default" : "secondary"} className="text-xs">
                      {game.is_machine_active ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned:</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(game.assigned_at).toLocaleDateString()}
                    </span>
                  </div>
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
                : "No games are assigned to this venue"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VenueGamesManagementTab;
