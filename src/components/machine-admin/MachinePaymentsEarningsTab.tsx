
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
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

interface MachinePaymentsEarningsTabProps {
  venueId: string;
}

const MachinePaymentsEarningsTab = ({ venueId }: MachinePaymentsEarningsTabProps) => {
  const { earnings, totals, isLoading } = useEarnings();
  const { paymentMethods } = usePaymentMethods();

  // Filter earnings data for this specific venue
  const venueEarnings = earnings?.filter(earning => earning.venue_id === venueId) || [];

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

  // Calculate machine-specific totals
  const machineTotals = {
    daily: venueEarnings.filter(e => e.date === new Date().toISOString().split('T')[0])
      .reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
    weekly: venueEarnings.filter(e => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return e.date >= weekAgo;
    }).reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
    monthly: venueEarnings.reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0)
  };

  const chartData = venueEarnings.slice(0, 7).reverse().map(earning => ({
    date: new Date(earning.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Number(earning.total_revenue),
    sessions: earning.total_sessions
  }));

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

      {/* Machine Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              ₹{machineTotals.daily.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This machine only
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
              ₹{machineTotals.weekly.toLocaleString()}
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
              ₹{machineTotals.monthly.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Machine total this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend - This Machine</CardTitle>
          <CardDescription>
            Daily revenue for this specific machine
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
    </div>
  );
};

export default MachinePaymentsEarningsTab;
