
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, startOfWeek, startOfMonth, startOfYear, 
         differenceInDays, isWithinInterval, subWeeks, subMonths, subYears } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Calendar, 
  CalendarDays, 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  BarChart3, 
  PieChart
} from "lucide-react";

type TimeFrame = "daily" | "weekly" | "monthly" | "yearly";
type SessionData = {
  id: string;
  start_time: string;
  end_time: string | null;
  game_id: string | null;
  rfid_tag: string | null;
  duration_seconds: number | null;
  game_title?: string;
};

const AnalyticsTab = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("daily");
  const [periodOffset, setPeriodOffset] = useState(0);
  
  // Fetch session history data
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessionHistory'],
    queryFn: async () => {
      // Fetch all sessions from session_history table
      const { data, error } = await supabase
        .from('session_history')
        .select(`
          id, 
          start_time, 
          end_time, 
          game_id, 
          rfid_tag, 
          duration_seconds,
          games:game_id (title)
        `)
        .order('start_time', { ascending: false });
        
      if (error) {
        console.error('Error fetching session history:', error);
        throw new Error(error.message);
      }
      
      // Transform the data to include game title
      return (data || []).map((session): SessionData => ({
        ...session,
        game_title: session.games?.title || 'Unknown Game'
      }));
    },
  });
  
  // Calculate date ranges based on selected time frame and period offset
  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let label: string;
    
    switch(timeFrame) {
      case "daily":
        startDate = startOfDay(subDays(now, periodOffset));
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        label = format(startDate, "MMM d, yyyy");
        break;
      
      case "weekly":
        startDate = startOfWeek(subWeeks(now, periodOffset), { weekStartsOn: 1 });
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        label = `Week of ${format(startDate, "MMM d, yyyy")}`;
        break;
      
      case "monthly":
        startDate = startOfMonth(subMonths(now, periodOffset));
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of month
        endDate.setHours(23, 59, 59, 999);
        label = format(startDate, "MMMM yyyy");
        break;
      
      case "yearly":
        startDate = startOfYear(subYears(now, periodOffset));
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate.setDate(0); // Last day of year
        endDate.setHours(23, 59, 59, 999);
        label = format(startDate, "yyyy");
        break;
      
      default:
        startDate = startOfDay(now);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        label = format(startDate, "MMM d, yyyy");
    }
    
    return { startDate, endDate, label };
  }, [timeFrame, periodOffset]);
  
  // Filter and process sessions based on selected time frame
  const processedData = useMemo(() => {
    if (!sessions) return [];
    
    const { startDate, endDate } = dateRange;
    
    // Filter sessions that fall within the selected time range
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate });
    });
    
    // Create data for chart based on time frame
    if (timeFrame === "daily") {
      // For daily view, group sessions by hour
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        label: `${hour}:00`,
        sessions: 0,
        minutes: 0
      }));
      
      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.start_time);
        const hour = sessionDate.getHours();
        hourlyData[hour].sessions += 1;
        hourlyData[hour].minutes += (session.duration_seconds || 0) / 60;
      });
      
      return hourlyData;
    } 
    else if (timeFrame === "weekly") {
      // For weekly view, group by day of week
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const dailyData = daysOfWeek.map(day => ({
        label: day,
        sessions: 0,
        minutes: 0
      }));
      
      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.start_time);
        // Get day index (0 = Monday in our case)
        const dayIndex = (sessionDate.getDay() + 6) % 7;
        dailyData[dayIndex].sessions += 1;
        dailyData[dayIndex].minutes += (session.duration_seconds || 0) / 60;
      });
      
      return dailyData;
    }
    else if (timeFrame === "monthly") {
      // For monthly view, group by day of month
      const daysInMonth = endDate.getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        sessions: 0,
        minutes: 0
      }));
      
      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.start_time);
        const day = sessionDate.getDate() - 1; // 0-based index
        if (day < dailyData.length) {
          dailyData[day].sessions += 1;
          dailyData[day].minutes += (session.duration_seconds || 0) / 60;
        }
      });
      
      return dailyData;
    }
    else if (timeFrame === "yearly") {
      // For yearly view, group by month
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyData = months.map(month => ({
        label: month,
        sessions: 0,
        minutes: 0
      }));
      
      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.start_time);
        const month = sessionDate.getMonth();
        monthlyData[month].sessions += 1;
        monthlyData[month].minutes += (session.duration_seconds || 0) / 60;
      });
      
      return monthlyData;
    }
    
    return [];
  }, [sessions, timeFrame, dateRange]);
  
  // Calculate summary statistics
  const stats = useMemo(() => {
    const { startDate, endDate } = dateRange;
    
    if (!sessions) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        avgSessionDuration: 0
      };
    }
    
    // Filter sessions within the date range
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate });
    });
    
    // Calculate statistics
    const totalSessions = filteredSessions.length;
    const totalDuration = filteredSessions.reduce((sum, session) => 
      sum + (session.duration_seconds || 0), 0);
    const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
    
    return {
      totalSessions,
      totalDuration,
      avgSessionDuration
    };
  }, [sessions, dateRange]);
  
  // Game popularity
  const gameStats = useMemo(() => {
    if (!sessions) return [];
    
    const { startDate, endDate } = dateRange;
    
    // Filter sessions within the date range
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.start_time);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate });
    });
    
    // Group by game and count sessions
    const gameMap = new Map<string, { count: number, duration: number }>();
    
    filteredSessions.forEach(session => {
      const gameKey = session.game_title || 'Unknown Game';
      
      if (!gameMap.has(gameKey)) {
        gameMap.set(gameKey, { count: 0, duration: 0 });
      }
      
      const gameData = gameMap.get(gameKey)!;
      gameData.count += 1;
      gameData.duration += session.duration_seconds || 0;
    });
    
    // Convert to array and sort by count
    return Array.from(gameMap.entries())
      .map(([game, data]) => ({
        game,
        sessions: data.count,
        minutes: Math.round(data.duration / 60)
      }))
      .sort((a, b) => b.sessions - a.sessions);
  }, [sessions, dateRange]);
  
  // Navigation handlers
  const goToPreviousPeriod = () => setPeriodOffset(prev => prev + 1);
  const goToNextPeriod = () => setPeriodOffset(prev => Math.max(0, prev - 1));
  const goToCurrentPeriod = () => setPeriodOffset(0);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
          <Skeleton className="h-[120px]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Session Analytics</h2>
          <Tabs
            value={timeFrame}
            onValueChange={(v) => {
              setTimeFrame(v as TimeFrame);
              setPeriodOffset(0); // Reset period offset when changing time frame
            }}
          >
            <TabsList>
              <TabsTrigger value="daily" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                Monthly
              </TabsTrigger>
              <TabsTrigger value="yearly" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Yearly
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToPreviousPeriod}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={goToNextPeriod}
              disabled={periodOffset === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {periodOffset > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={goToCurrentPeriod}
              >
                Current {timeFrame}
              </Button>
            )}
          </div>
          <h3 className="text-lg font-medium">{dateRange.label}</h3>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalSessions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Each RFID tap = 1 session
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(stats.totalDuration / 60)} min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total gameplay minutes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Session Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.floor(stats.avgSessionDuration / 60)} min
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average minutes per session
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sessions Over Time</CardTitle>
          <CardDescription>
            Number of sessions and total minutes played
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ChartContainer
              config={{
                sessions: {
                  label: "Sessions",
                  theme: {
                    light: "#7E69AB",
                    dark: "#9b87f5",
                  },
                },
                minutes: {
                  label: "Minutes",
                  theme: {
                    light: "#6E59A5",
                    dark: "#7E69AB",
                  },
                },
              }}
            >
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  stroke="var(--color-sessions)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="var(--color-minutes)" 
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent 
                      nameKey="label" 
                    />
                  }
                />
                <Legend />
                <Bar 
                  dataKey="sessions" 
                  name="Sessions" 
                  fill="var(--color-sessions)" 
                  yAxisId="left" 
                  barSize={timeFrame === "yearly" ? 30 : 20}
                />
                <Bar 
                  dataKey="minutes" 
                  name="Minutes" 
                  fill="var(--color-minutes)" 
                  yAxisId="right"
                  barSize={timeFrame === "yearly" ? 30 : 20} 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Game Popularity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Popularity</CardTitle>
          <CardDescription>
            Most popular games by number of sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Minutes Played</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameStats.length > 0 ? (
                gameStats.map((stat) => (
                  <TableRow key={stat.game}>
                    <TableCell className="font-medium">{stat.game}</TableCell>
                    <TableCell className="text-right">{stat.sessions}</TableCell>
                    <TableCell className="text-right">{stat.minutes}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    No game data available for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
