
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { RefreshCw, TrendingUp, Clock, Users, DollarSign } from "lucide-react";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";
import { useMachineAuth } from "@/hooks/useMachineAuth";

const MachineAnalyticsTab = () => {
  const { sessions, stats, isLoading, refetchSessions } = useSessionAnalytics();
  const { machineSession } = useMachineAuth();

  // Filter sessions by venue ID
  const venueSessions = sessions?.filter(session => 
    session.venue_id === machineSession?.venue.id
  ) || [];

  // Calculate venue-specific stats
  const venueStats = {
    totalSessions: venueSessions.filter(s => s.status === 'completed').length,
    totalRevenue: venueSessions.reduce((sum, s) => sum + (s.amount_paid || 0), 0),
    avgDuration: venueSessions.length > 0 
      ? venueSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / venueSessions.length 
      : 0
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Machine Analytics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchSessions()}
          className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-black/60 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{venueStats.totalSessions}</div>
            <p className="text-xs text-gray-400 mt-1">
              Sessions completed at this venue
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">₹{venueStats.totalRevenue}</div>
            <p className="text-xs text-gray-400 mt-1">
              Total revenue generated
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {Math.floor(venueStats.avgDuration / 60)}m
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Average session length
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/60 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Machine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">Online</div>
            <p className="text-xs text-gray-400 mt-1">
              System operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card className="bg-black/60 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">Recent Sessions</CardTitle>
          <CardDescription className="text-gray-300">
            Latest VR gaming sessions on this machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Session ID</TableHead>
                <TableHead className="text-gray-300">Game</TableHead>
                <TableHead className="text-gray-300">Start Time</TableHead>
                <TableHead className="text-gray-300">Duration</TableHead>
                <TableHead className="text-gray-300">Payment Method</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venueSessions && venueSessions.length > 0 ? (
                venueSessions.slice(0, 20).map((session) => (
                  <TableRow key={session.id} className="border-gray-700">
                    <TableCell className="font-mono text-xs text-gray-300">
                      {session.session_id || session.id.split('-')[0]}
                    </TableCell>
                    <TableCell className="font-medium text-white">{session.game_title}</TableCell>
                    <TableCell className="text-gray-300">{format(new Date(session.start_time), 'MMM d, HH:mm:ss')}</TableCell>
                    <TableCell className="text-gray-300">
                      {session.duration_seconds 
                        ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
                        : 'In progress'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.payment_method === 'rfid' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {session.payment_method?.toUpperCase() || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell className="text-green-400">₹{session.amount_paid || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : session.status === 'active'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {session.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No sessions found for this machine. Start a VR session to see analytics data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session History by Game */}
      {venueSessions && venueSessions.length > 0 && (
        <Card className="bg-black/60 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Game Performance</CardTitle>
            <CardDescription className="text-gray-300">
              Session statistics by game for this machine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Game</TableHead>
                  <TableHead className="text-right text-gray-300">Total Sessions</TableHead>
                  <TableHead className="text-right text-gray-300">Total Revenue</TableHead>
                  <TableHead className="text-right text-gray-300">Avg Duration</TableHead>
                  <TableHead className="text-right text-gray-300">Last Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(
                  venueSessions.reduce((acc, session) => {
                    const gameTitle = session.game_title || 'Unknown Game';
                    if (!acc[gameTitle]) {
                      acc[gameTitle] = {
                        sessions: 0,
                        revenue: 0,
                        totalDuration: 0,
                        lastPlayed: session.start_time
                      };
                    }
                    acc[gameTitle].sessions += 1;
                    acc[gameTitle].revenue += session.amount_paid || 0;
                    acc[gameTitle].totalDuration += session.duration_seconds || 0;
                    if (new Date(session.start_time) > new Date(acc[gameTitle].lastPlayed)) {
                      acc[gameTitle].lastPlayed = session.start_time;
                    }
                    return acc;
                  }, {} as Record<string, any>)
                ).map(([game, stats]) => (
                  <TableRow key={game} className="border-gray-700">
                    <TableCell className="font-medium text-white">{game}</TableCell>
                    <TableCell className="text-right text-gray-300">{stats.sessions}</TableCell>
                    <TableCell className="text-right text-green-400">₹{stats.revenue}</TableCell>
                    <TableCell className="text-right text-gray-300">
                      {Math.floor(stats.totalDuration / stats.sessions / 60)}m
                    </TableCell>
                    <TableCell className="text-right text-gray-300">
                      {format(new Date(stats.lastPlayed), 'MMM d, HH:mm')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MachineAnalyticsTab;
