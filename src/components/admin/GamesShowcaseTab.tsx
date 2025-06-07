
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Star, 
  Target,
  Trophy,
  Clock,
  Building2
} from "lucide-react";
import { useMachineGames } from "@/hooks/useMachineGames";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";

interface GamesShowcaseTabProps {
  selectedVenueId?: string | null;
}

const GamesShowcaseTab = ({ selectedVenueId }: GamesShowcaseTabProps) => {
  const { machineGames, isLoadingMachineGames } = useMachineGames(selectedVenueId || '');
  const { sessions } = useSessionAnalytics(selectedVenueId);

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

  if (!selectedVenueId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Venue</h3>
            <p className="text-muted-foreground">
              Choose a venue from the filter above to view its game showcase
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate game statistics from sessions
  const gameStats = sessions?.reduce((acc, session) => {
    const gameId = session.game_id;
    if (!acc[gameId]) {
      acc[gameId] = {
        sessions: 0,
        totalRevenue: 0,
        totalDuration: 0,
        ratings: []
      };
    }
    acc[gameId].sessions += 1;
    acc[gameId].totalRevenue += session.amount_paid || 0;
    acc[gameId].totalDuration += session.duration_seconds || 0;
    if (session.rating) {
      acc[gameId].ratings.push(session.rating);
    }
    return acc;
  }, {} as Record<string, { sessions: number; totalRevenue: number; totalDuration: number; ratings: number[] }>) || {};

  return (
    <div className="space-y-6">
      {/* Venue Selection Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venue Game Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-700">
            Showing games available at the selected venue with performance metrics
          </p>
        </CardContent>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Games</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              {machineGames?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Games at this venue
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
              {machineGames?.length ? 'High' : 'None'}
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
          <h2 className="text-xl font-semibold">Games at This Venue</h2>
        </div>
        
        {machineGames && machineGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {machineGames.map((game, index) => {
              const stats = gameStats[game.id];
              const avgRating = stats?.ratings.length > 0 
                ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length 
                : null;
              
              return (
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
                            Available
                          </Badge>
                          {stats?.sessions && (
                            <Badge variant="secondary" className="text-xs">
                              {stats.sessions} plays
                            </Badge>
                          )}
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

                    {stats && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sessions</span>
                          <span className="font-semibold">{stats.sessions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Revenue</span>
                          <span className="font-semibold">₹{stats.totalRevenue.toLocaleString()}</span>
                        </div>
                        {avgRating && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Popularity</span>
                        <span className="font-semibold">
                          {stats?.sessions ? (stats.sessions > 10 ? 'High' : stats.sessions > 5 ? 'Medium' : 'Low') : 'New'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-vr-primary to-vr-secondary h-2 rounded-full"
                          style={{ 
                            width: stats?.sessions 
                              ? `${Math.min(100, (stats.sessions / 20) * 100)}%`
                              : '10%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No games assigned</h3>
                <p className="text-muted-foreground mb-4">
                  This venue doesn't have any games assigned yet
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GamesShowcaseTab;
