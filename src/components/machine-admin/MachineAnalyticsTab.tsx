
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

const MachineAnalyticsTab = () => {
  const { sessions, stats, isLoading, refetchSessions } = useSessionAnalytics();

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
        <h2 className="text-2xl font-bold">Machine Analytics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchSessions()}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats?.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue generated today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor((stats?.avgDuration || 0) / 60)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average session length
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Machine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground mt-1">
              System operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Latest VR gaming sessions on this machine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions && sessions.length > 0 ? (
                sessions.slice(0, 20).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-mono text-xs">
                      {session.session_id || session.id.split('-')[0]}
                    </TableCell>
                    <TableCell className="font-medium">{session.game_title}</TableCell>
                    <TableCell>{format(new Date(session.start_time), 'MMM d, HH:mm:ss')}</TableCell>
                    <TableCell>
                      {session.duration_seconds 
                        ? `${Math.floor(session.duration_seconds / 60)}m ${session.duration_seconds % 60}s`
                        : 'In progress'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.payment_method === 'rfid' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {session.payment_method?.toUpperCase() || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>₹{session.amount_paid || 0}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        session.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : session.status === 'active'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No sessions found. Start a VR session to see analytics data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Session History by Game */}
      {sessions && sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Game Performance</CardTitle>
            <CardDescription>
              Session statistics by game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Game</TableHead>
                  <TableHead className="text-right">Total Sessions</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right">Avg Duration</TableHead>
                  <TableHead className="text-right">Last Played</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(
                  sessions.reduce((acc, session) => {
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
                  <TableRow key={game}>
                    <TableCell className="font-medium">{game}</TableCell>
                    <TableCell className="text-right">{stats.sessions}</TableCell>
                    <TableCell className="text-right">₹{stats.revenue}</TableCell>
                    <TableCell className="text-right">
                      {Math.floor(stats.totalDuration / stats.sessions / 60)}m
                    </TableCell>
                    <TableCell className="text-right">
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
