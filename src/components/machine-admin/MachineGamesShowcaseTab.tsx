
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Star, 
  DollarSign,
  Target,
  Trophy,
  Clock
} from "lucide-react";
import { useMachineGames } from "@/hooks/useMachineGames";

interface MachineGamesShowcaseTabProps {
  venueId: string;
}

const MachineGamesShowcaseTab = ({ venueId }: MachineGamesShowcaseTabProps) => {
  const { machineGames, isLoadingMachineGames } = useMachineGames(venueId);

  if (isLoadingMachineGames) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Games</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              {machineGames?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Available on this machine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-secondary">
              {machineGames?.length ? 
                `${Math.round(machineGames.reduce((sum, game) => sum + ((game.min_duration_seconds + game.max_duration_seconds) / 2), 0) / machineGames.length / 60)}m` 
                : '0m'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Average game duration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Game Variety</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              High
            </div>
            <p className="text-xs text-muted-foreground">
              Content diversity score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Games Showcase */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-vr-primary" />
          <h2 className="text-xl font-semibold">Available Games on This Machine</h2>
        </div>
        
        {machineGames && machineGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machineGames.map((game, index) => (
              <Card key={game.id} className="relative overflow-hidden">
                {game.image_url && (
                  <div className="aspect-video bg-gray-200">
                    <img 
                      src={game.image_url} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{game.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1} Available
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {game.description || "Experience this amazing VR game"}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-vr-primary" />
                      <span className="text-muted-foreground">Duration:</span>
                    </div>
                    <span className="font-semibold">
                      {Math.floor(game.min_duration_seconds / 60)}-{Math.floor(game.max_duration_seconds / 60)} min
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Popularity</span>
                      <span className="font-semibold">High</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-vr-primary to-vr-secondary h-2 rounded-full"
                        style={{ width: `${75 + (index % 4) * 5}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No games assigned yet</h3>
                <p className="text-muted-foreground mb-4">
                  Contact your Super Admin to assign games to this machine
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MachineGamesShowcaseTab;
