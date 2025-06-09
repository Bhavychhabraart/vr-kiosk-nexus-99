
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  DollarSign, 
  Users, 
  Clock, 
  Gamepad2,
  CalendarDays
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useVenues } from "@/hooks/useVenues";
import { useVenueAnalytics } from "@/hooks/useVenueAnalytics";
import { useCSVExport } from "@/hooks/useCSVExport";
import { toast } from "@/components/ui/use-toast";

const VenueAnalyticsTab = () => {
  const { venues } = useVenues();
  const [selectedVenueId, setSelectedVenueId] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });

  const { data: analyticsData, isLoading } = useVenueAnalytics(selectedVenueId, dateRange);
  const { 
    exportVenueAnalytics, 
    exportSessionDetails, 
    exportDailyRevenue, 
    exportGamePerformance 
  } = useCSVExport();

  const handleExport = (type: string) => {
    if (!analyticsData) {
      toast({
        title: "No Data",
        description: "Please select a venue and ensure data is loaded before exporting.",
        variant: "destructive"
      });
      return;
    }

    try {
      const dateRangeStr = `${dateRange.start}_to_${dateRange.end}`;
      
      switch (type) {
        case 'summary':
          exportVenueAnalytics(analyticsData, dateRangeStr);
          break;
        case 'sessions':
          exportSessionDetails(analyticsData.sessionDetails, analyticsData.venue.name);
          break;
        case 'daily':
          exportDailyRevenue(analyticsData.dailyRevenue, analyticsData.venue.name);
          break;
        case 'games':
          exportGamePerformance(analyticsData.topGames, analyticsData.venue.name);
          break;
        default:
          break;
      }
      
      toast({
        title: "Export Successful",
        description: "Your data has been exported to CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const paymentMethodColors = {
    rfid: "#8884d8",
    upi: "#82ca9d"
  };

  const paymentMethodData = analyticsData ? [
    { name: 'RFID', value: analyticsData.revenueByPaymentMethod.rfid, color: paymentMethodColors.rfid },
    { name: 'UPI', value: analyticsData.revenueByPaymentMethod.upi, color: paymentMethodColors.upi }
  ].filter(item => item.value > 0) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vr-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Venue Analytics</h2>
        <p className="text-muted-foreground">Detailed analytics and performance metrics for individual venues</p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Select Venue</Label>
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues?.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Ranges</Label>
              <Select onValueChange={(value) => {
                const today = new Date().toISOString().split('T')[0];
                const ranges = {
                  '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  '90d': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                };
                setDateRange({ start: ranges[value as keyof typeof ranges], end: today });
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Quick select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedVenueId ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Venue</h3>
            <p className="text-gray-500">Choose a venue from the dropdown above to view detailed analytics.</p>
          </CardContent>
        </Card>
      ) : !analyticsData ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">No data available for the selected venue and date range.</div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
              <CardDescription>Download analytics data in CSV format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => handleExport('summary')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Summary
                </Button>
                <Button variant="outline" onClick={() => handleExport('sessions')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Sessions
                </Button>
                <Button variant="outline" onClick={() => handleExport('daily')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Daily Revenue
                </Button>
                <Button variant="outline" onClick={() => handleExport('games')} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Game Performance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₹{analyticsData.totalRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">{analyticsData.totalSessions}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                    <p className="text-2xl font-bold">{Math.round(analyticsData.averageSessionDuration / 60)}m</p>
                  </div>
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue/Session</p>
                    <p className="text-2xl font-bold">₹{analyticsData.totalSessions > 0 ? Math.round(analyticsData.totalRevenue / analyticsData.totalSessions) : 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Games */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Games</CardTitle>
              <CardDescription>Games ranked by revenue in selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.topGames.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="game_title" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default VenueAnalyticsTab;
