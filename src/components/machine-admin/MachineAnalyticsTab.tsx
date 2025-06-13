
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
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
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  DollarSign,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  Activity
} from "lucide-react";
import { useComprehensiveAnalytics, TimePeriod } from "@/hooks/useComprehensiveAnalytics";
import { usePDFExport } from "@/hooks/usePDFExport";
import { useSessionAnalytics } from "@/hooks/useSessionAnalytics";
import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import GlobalRefresh from "./GlobalRefresh";

interface MachineAnalyticsTabProps {
  venueId: string;
}

const MachineAnalyticsTab = ({ venueId }: MachineAnalyticsTabProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | undefined>();
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const { data: analytics, isLoading, refetch } = useComprehensiveAnalytics(venueId, timePeriod, customRange);
  const { sessions } = useSessionAnalytics(venueId);
  const { exportAnalyticsToPDF } = usePDFExport();

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const handleExportPDF = () => {
    if (!analytics) return;
    
    exportAnalyticsToPDF({
      venueName: "Machine Analytics", // You might want to fetch actual venue name
      timePeriod: timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1),
      dateRange: customRange 
        ? `${format(customRange.start, 'PPP')} - ${format(customRange.end, 'PPP')}`
        : getDateRangeLabel(timePeriod),
      analytics,
      sessionDetails: sessions || []
    });
  };

  const getDateRangeLabel = (period: TimePeriod): string => {
    const now = new Date();
    switch (period) {
      case 'today': return format(now, 'PPP');
      case 'week': return `Week of ${format(now, 'PPP')}`;
      case 'month': return format(now, 'MMMM yyyy');
      case 'year': return format(now, 'yyyy');
      default: return 'Custom Range';
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-400";
  };

  if (isLoading && !analytics) {
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
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Comprehensive Analytics</h2>
        <div className="flex items-center gap-4">
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timePeriod === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {customRange ? `${format(customRange.start, 'MMM d')} - ${format(customRange.end, 'MMM d')}` : 'Select range'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  selected={customRange ? { from: customRange.start, to: customRange.end } : undefined}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setCustomRange({ start: range.from, end: range.to });
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
          
          <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Global Refresh Component */}
      <GlobalRefresh 
        onRefresh={handleRefresh}
        isLoading={isLoading}
        lastUpdated={lastRefresh}
      />

      {/* Enhanced Stats Cards with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.currentPeriod.sessions || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(analytics?.trends.sessionsChange || 0)}
              <span className={`text-sm ${getTrendColor(analytics?.trends.sessionsChange || 0)}`}>
                {analytics?.trends.sessionsChange >= 0 ? '+' : ''}{analytics?.trends.sessionsChange?.toFixed(1) || 0}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{analytics?.currentPeriod.revenue?.toLocaleString() || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(analytics?.trends.revenueChange || 0)}
              <span className={`text-sm ${getTrendColor(analytics?.trends.revenueChange || 0)}`}>
                {analytics?.trends.revenueChange >= 0 ? '+' : ''}{analytics?.trends.revenueChange?.toFixed(1) || 0}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
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
              {Math.floor((analytics?.currentPeriod.avgDuration || 0) / 60)}m
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(analytics?.trends.durationChange || 0)}
              <span className={`text-sm ${getTrendColor(analytics?.trends.durationChange || 0)}`}>
                {analytics?.trends.durationChange >= 0 ? '+' : ''}{analytics?.trends.durationChange?.toFixed(1) || 0}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.currentPeriod.uniqueCustomers || 0}</div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(analytics?.trends.customersChange || 0)}
              <span className={`text-sm ${getTrendColor(analytics?.trends.customersChange || 0)}`}>
                {analytics?.trends.customersChange >= 0 ? '+' : ''}{analytics?.trends.customersChange?.toFixed(1) || 0}%
              </span>
              <span className="text-xs text-muted-foreground">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Session Distribution</CardTitle>
            <CardDescription>
              Sessions and revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.timeDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="1"
                  stroke="#00eaff" 
                  fill="#00eaff" 
                  fillOpacity={0.3}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ff6b6b" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>
              Session distribution by hour of day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.sessionsByHour || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="#00eaff" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Game Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Performance</CardTitle>
          <CardDescription>
            Top performing games for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Duration</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.gamePerformance?.slice(0, 10).map((game, index) => (
                <TableRow key={game.gameId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      {game.gameTitle}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{game.sessions}</TableCell>
                  <TableCell className="text-right">₹{game.revenue.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    {Math.round(game.avgDuration / 60)}m
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-vr-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min((game.sessions / (analytics?.gamePerformance?.[0]?.sessions || 1)) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineAnalyticsTab;
