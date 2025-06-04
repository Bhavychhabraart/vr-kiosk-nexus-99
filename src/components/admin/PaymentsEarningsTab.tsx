
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Smartphone,
  Calendar,
  BarChart3
} from "lucide-react";
import { useEarnings } from "@/hooks/useEarnings";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const PaymentsEarningsTab = () => {
  const { earnings, totals, isLoading } = useEarnings();
  const { paymentMethods } = usePaymentMethods();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
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

  // Session pricing configuration
  const sessionPrices = {
    300: 100,   // 5 minutes - ₹100
    600: 150,   // 10 minutes - ₹150
    900: 200,   // 15 minutes - ₹200
    1200: 220,  // 20 minutes - ₹220
  };

  // Format earnings data for charts
  const chartData = earnings?.slice(0, 7).reverse().map(earning => ({
    date: new Date(earning.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Number(earning.total_revenue),
    sessions: earning.total_sessions
  })) || [];

  const paymentBreakdown = totals ? [
    { name: 'RFID Cards', value: totals.breakdown.rfid, color: '#00eaff' },
    { name: 'UPI QR Code', value: totals.breakdown.upi, color: '#ff6b35' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Payment Method Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`border-2 ${paymentMethods?.rfid_enabled ? 'border-green-500' : 'border-gray-300'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RFID Card Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={paymentMethods?.rfid_enabled ? "default" : "secondary"}>
              {paymentMethods?.rfid_enabled ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Contactless card payments for sessions
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${paymentMethods?.upi_enabled ? 'border-green-500' : 'border-gray-300'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UPI QR Code Payments</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={paymentMethods?.upi_enabled ? "default" : "secondary"}>
              {paymentMethods?.upi_enabled ? "Active" : "Inactive"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {paymentMethods?.upi_merchant_id || "UPI merchant ID not configured"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              ₹{totals?.daily.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on session prices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-secondary">
              ₹{totals?.weekly.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 7 days performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totals?.monthly.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Session Pricing Structure</CardTitle>
          <CardDescription>
            Current pricing based on session duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(sessionPrices).map(([duration, price]) => (
              <div key={duration} className="p-4 border rounded-lg text-center">
                <div className="text-sm text-muted-foreground">
                  {Math.floor(Number(duration) / 60)} minutes
                </div>
                <div className="text-2xl font-bold text-vr-primary">
                  ₹{price}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? `₹${value}` : value,
                    name === 'revenue' ? 'Revenue' : 'Sessions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#00eaff" 
                  strokeWidth={2}
                  dot={{ fill: "#00eaff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Breakdown</CardTitle>
            <CardDescription>
              Revenue distribution by payment method (Last 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentBreakdown.some(item => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment data available yet</p>
                  <p className="text-sm">Start accepting payments to see breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsEarningsTab;
