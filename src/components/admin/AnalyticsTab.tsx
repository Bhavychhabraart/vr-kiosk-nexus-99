
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Play,
  Calendar,
  BarChart3,
  Building2
} from "lucide-react";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";
import { useEarnings } from "@/hooks/useEarnings";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface AnalyticsTabProps {
  selectedVenueId?: string | null;
}

const AnalyticsTab = ({ selectedVenueId }: AnalyticsTabProps) => {
  const { sessions, stats, isLoading } = useSessionAnalytics(selectedVenueId);
  const { earnings, totals } = useEarnings(selectedVenueId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
              Choose a venue from the filter above to view analytics data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const recentSessions = sessions?.slice(0, 10) || [];
  const chartData = earnings?.slice(0, 7).reverse().map(earning => ({
    date: new Date(earning.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Number(earning.total_revenue),
    sessions: earning.total_sessions
  })) || [];

  // Game popularity data
  const gameStats = recentSessions.reduce((acc, session) => {
    const game = session.game_title;
    if (!acc[game]) {
      acc[game] = { sessions: 0, revenue: 0 };
    }
    acc[game].sessions += 1;
    acc[game].revenue += session.amount_paid || 0;
    return acc;
  }, {} as Record<string, { sessions: number; revenue: number }>);

  const popularGames = Object.entries(gameStats)
    .map(([game, data]) => ({ game, ...data }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Venue Selection Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venue-Specific Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-700">
            Showing analytics data for the selected venue only
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              {stats?.totalSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active gaming sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-secondary">
              ₹{stats?.totalRevenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total earnings today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totals?.weekly.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.avgDuration ? Math.round(stats.avgDuration / 60) : 0}m
            </div>
            <p className="text-xs text-muted-foreground">
              Average session length
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>
            Daily revenue and session count for this venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `₹${value}` : value,
                  name === 'revenue' ? 'Revenue' : 'Sessions'
                ]}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#00eaff" 
                strokeWidth={2}
                dot={{ fill: "#00eaff" }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="sessions" 
                stroke="#ff6b6b" 
                strokeWidth={2}
                dot={{ fill: "#ff6b6b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Popular Games */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Games</CardTitle>
          <CardDescription>
            Most played games at this venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {popularGames.length > 0 ? (
            <div className="space-y-4">
              {popularGames.map((game, index) => (
                <div key={game.game} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">{game.game}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{game.sessions} sessions</span>
                    <span>₹{game.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No game data available for this venue</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Latest gaming sessions at this venue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {session.status}
                    </Badge>
                    <span className="text-sm font-medium">{session.game_title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{new Date(session.start_time).toLocaleTimeString()}</span>
                    <span>₹{session.amount_paid || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No recent sessions for this venue</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
