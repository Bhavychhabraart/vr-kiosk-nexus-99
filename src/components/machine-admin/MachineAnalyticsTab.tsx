
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Calendar,
  Activity,
  Target
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface MachineAnalyticsTabProps {
  venueId: string;
}

const MachineAnalyticsTab = ({ venueId }: MachineAnalyticsTabProps) => {
  // Mock data for now - in real implementation, this would be fetched based on venueId
  const mockSessionData = [
    { date: '2024-01-01', sessions: 12, revenue: 2400, avgDuration: 18 },
    { date: '2024-01-02', sessions: 8, revenue: 1600, avgDuration: 16 },
    { date: '2024-01-03', sessions: 15, revenue: 3000, avgDuration: 20 },
    { date: '2024-01-04', sessions: 10, revenue: 2000, avgDuration: 17 },
    { date: '2024-01-05', sessions: 18, revenue: 3600, avgDuration: 22 },
    { date: '2024-01-06', sessions: 14, revenue: 2800, avgDuration: 19 },
    { date: '2024-01-07', sessions: 16, revenue: 3200, avgDuration: 21 }
  ];

  const mockHourlyData = [
    { hour: '10:00', sessions: 2 },
    { hour: '11:00', sessions: 4 },
    { hour: '12:00', sessions: 6 },
    { hour: '13:00', sessions: 8 },
    { hour: '14:00', sessions: 12 },
    { hour: '15:00', sessions: 15 },
    { hour: '16:00', sessions: 18 },
    { hour: '17:00', sessions: 14 },
    { hour: '18:00', sessions: 10 },
    { hour: '19:00', sessions: 8 },
    { hour: '20:00', sessions: 6 },
    { hour: '21:00', sessions: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19m</div>
            <p className="text-xs text-muted-foreground">
              +2m from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Machine Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">
              Excellent performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              93/107 sessions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sessions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sessions</CardTitle>
            <CardDescription>
              Session count and revenue for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSessionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Sessions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#00eaff" 
                  strokeWidth={2}
                  dot={{ fill: "#00eaff" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ff6b35" 
                  strokeWidth={2}
                  dot={{ fill: "#ff6b35" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
            <CardDescription>
              Peak hours for session activity today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockHourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#00eaff" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>
            Key insights for this machine's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Peak Hours</h3>
              <div className="space-y-1">
                <Badge variant="secondary">3:00 PM - 6:00 PM</Badge>
                <p className="text-xs text-muted-foreground">Highest activity period</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Popular Days</h3>
              <div className="space-y-1">
                <Badge variant="secondary">Weekends</Badge>
                <p className="text-xs text-muted-foreground">Saturday & Sunday peaks</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Avg Revenue/Session</h3>
              <div className="space-y-1">
                <Badge variant="secondary">₹200</Badge>
                <p className="text-xs text-muted-foreground">Above industry average</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineAnalyticsTab;
