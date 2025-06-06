import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Star, 
  Clock, 
  Users, 
  DollarSign,
  Play,
  Trophy,
  Target
} from "lucide-react";
import { usePopularGames } from "@/hooks/usePopularGames";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface GamesShowcaseTabProps {
  selectedVenueId?: string | null;
}

const GamesShowcaseTab = ({ selectedVenueId }: GamesShowcaseTabProps) => {
  const { popularGames, isLoading } = usePopularGames();

  if (isLoading) {
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

  // Top performing games for chart
  const topGamesData = popularGames?.slice(0, 5).map(game => ({
    name: game.game_title || 'Unknown',
    sessions: game.total_sessions,
    revenue: Number(game.total_revenue)
  })) || [];

  // Performance metrics
  const totalSessions = popularGames?.reduce((sum, game) => sum + game.total_sessions, 0) || 0;
  const totalRevenue = popularGames?.reduce((sum, game) => sum + Number(game.total_revenue), 0) || 0;
  const avgRating = popularGames?.length 
    ? popularGames.reduce((sum, game) => sum + (game.average_rating || 0), 0) / popularGames.length 
    : 0;

  return (
    <div className="space-y-6">
      {selectedVenueId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Venue Filter Active:</strong> Showing game showcase for selected venue
          </p>
        </div>
      )}
      
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              {totalSessions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all games
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From game sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-secondary">
              {avgRating.toFixed(1)}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Player satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Games Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Performing Games
          </CardTitle>
          <CardDescription>
            Games ranked by total sessions and revenue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topGamesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Sessions'
                ]}
              />
              <Bar dataKey="sessions" fill="#00eaff" name="sessions" />
              <Bar dataKey="revenue" fill="#ff6b35" name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hot Selling Games Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-vr-primary" />
          <h2 className="text-xl font-semibold">Hot Selling Games</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularGames?.map((game, index) => (
            <Card key={game.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{game.game_title || 'Unknown Game'}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1} Most Popular
                      </Badge>
                      {game.average_rating && (
                        <Badge variant="secondary" className="text-xs">
                          ⭐ {game.average_rating.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-vr-primary" />
                    <span className="text-muted-foreground">Sessions:</span>
                    <span className="font-semibold">{game.total_sessions}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-semibold">₹{Number(game.total_revenue).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-vr-secondary" />
                    <span className="text-muted-foreground">Per Session:</span>
                    <span className="font-semibold">₹{game.revenue_per_session?.toFixed(0) || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">This Week:</span>
                    <span className="font-semibold">{game.weekly_sessions}</span>
                  </div>
                </div>

                {/* Engagement Score */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Engagement Score</span>
                    <span className="font-semibold">{game.engagement_score?.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-vr-primary to-vr-secondary h-2 rounded-full transition-all"
                      style={{ width: `${game.engagement_score || 0}%` }}
                    ></div>
                  </div>
                </div>

                {game.last_played_at && (
                  <p className="text-xs text-muted-foreground">
                    Last played: {new Date(game.last_played_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {(!popularGames || popularGames.length === 0) && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No game data available yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start running game sessions to see performance analytics
                </p>
                <Button variant="outline" onClick={() => window.location.href = '/games'}>
                  Browse Games
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GamesShowcaseTab;
