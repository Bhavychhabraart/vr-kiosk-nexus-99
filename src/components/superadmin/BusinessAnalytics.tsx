
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Building2, DollarSign, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useBusinessAnalytics } from "@/hooks/useBusinessAnalytics";

const BusinessAnalytics = () => {
  const { analytics, businessMetrics, isLoading } = useBusinessAnalytics();

  // Sample data for charts
  const revenueData = analytics?.slice(0, 7).reverse().map(item => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    revenue: Number(item.total_revenue),
    sessions: item.total_sessions
  })) || [];

  const regionData = [
    { name: 'North India', value: 35, color: '#8884d8' },
    { name: 'West India', value: 28, color: '#82ca9d' },
    { name: 'South India', value: 25, color: '#ffc658' },
    { name: 'East India', value: 12, color: '#ff7300' }
  ];

  const performanceMetrics = [
    {
      title: "Revenue Growth",
      value: "+12.5%",
      description: "vs last month",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Session Duration",
      value: "+8.3%",
      description: "vs last week",
      icon: Clock,
      trend: "up"
    },
    {
      title: "Customer Retention",
      value: "92.4%",
      description: "monthly retention",
      icon: Users,
      trend: "up"
    },
    {
      title: "Venue Utilization",
      value: "78.6%",
      description: "average capacity",
      icon: Building2,
      trend: "down"
    }
  ];

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
        <h2 className="text-2xl font-bold">Business Analytics</h2>
        <p className="text-muted-foreground">Comprehensive analytics across all venues</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    {metric.description}
                  </p>
                </div>
                <metric.icon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue across all venues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sessions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Sessions</CardTitle>
            <CardDescription>Number of VR sessions per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Regional Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
            <CardDescription>Revenue by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>Important metrics for business health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Average Revenue per Venue</p>
                <p className="text-2xl font-bold">₹{((businessMetrics?.totalRevenue || 0) / (businessMetrics?.totalVenues || 1)).toLocaleString()}</p>
                <Badge variant="outline" className="text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.2%
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Customer Acquisition Cost</p>
                <p className="text-2xl font-bold">₹245</p>
                <Badge variant="outline" className="text-red-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -5.1%
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Monthly Active Users</p>
                <p className="text-2xl font-bold">{businessMetrics?.totalCustomers?.toLocaleString() || 0}</p>
                <Badge variant="outline" className="text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.7%
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Venue Uptime</p>
                <p className="text-2xl font-bold">99.2%</p>
                <Badge variant="outline" className="text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +0.5%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessAnalytics;
