
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Smartphone,
  Calendar,
  BarChart3,
  Building2
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

interface PaymentsEarningsTabProps {
  selectedVenueId?: string | null;
}

const PaymentsEarningsTab = ({ selectedVenueId }: PaymentsEarningsTabProps) => {
  const { earnings, totals, isLoading } = useEarnings(selectedVenueId);
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

  if (!selectedVenueId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Venue</h3>
            <p className="text-muted-foreground">
              Choose a venue from the filter above to view payment and earnings data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter earnings for the selected venue
  const venueEarnings = earnings?.filter(earning => earning.venue_id === selectedVenueId) || [];
  
  // Calculate venue-specific totals
  const venueTotals = {
    daily: venueEarnings.filter(e => e.date === new Date().toISOString().split('T')[0])
      .reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
    weekly: venueEarnings.filter(e => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return e.date >= weekAgo;
    }).reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
    monthly: venueEarnings.reduce((sum, e) => sum + (Number(e.total_revenue) || 0), 0),
    breakdown: {
      rfid: venueEarnings.reduce((sum, e) => sum + (Number(e.rfid_revenue) || 0), 0),
      upi: venueEarnings.reduce((sum, e) => sum + (Number(e.upi_revenue) || 0), 0)
    }
  };

  const chartData = venueEarnings.slice(0, 7).reverse().map(earning => ({
    date: new Date(earning.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Number(earning.total_revenue),
    sessions: earning.total_sessions
  }));

  const paymentBreakdownData = [
    { name: 'RFID Cards', value: venueTotals.breakdown.rfid, color: '#00eaff' },
    { name: 'UPI Payments', value: venueTotals.breakdown.upi, color: '#ff6b6b' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Venue Selection Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venue-Specific Payment Data
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-blue-700">
            Showing payment methods and earnings for the selected venue only
          </p>
        </CardContent>
      </Card>

      {/* Payment Method Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`border-2 ${paymentMethods?.rfid_enabled ? 'border-green-500' : 'border-gray-300'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RFID Card Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={paymentMethods?.rfid_enabled ? "default" : "secondary"}>
                {paymentMethods?.rfid_enabled ? "Active" : "Inactive"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                Contactless card payments for sessions
              </p>
              <div className="text-lg font-semibold text-vr-primary">
                ₹{venueTotals.breakdown.rfid.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total RFID revenue</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-2 ${paymentMethods?.upi_enabled ? 'border-green-500' : 'border-gray-300'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UPI QR Code Payments</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant={paymentMethods?.upi_enabled ? "default" : "secondary"}>
                {paymentMethods?.upi_enabled ? "Active" : "Inactive"}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {paymentMethods?.upi_merchant_id || "UPI merchant ID not configured"}
              </p>
              <div className="text-lg font-semibold text-vr-secondary">
                ₹{venueTotals.breakdown.upi.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total UPI revenue</p>
            </div>
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
              ₹{venueTotals.daily.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue earned today
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
              ₹{venueTotals.weekly.toLocaleString()}
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
              ₹{venueTotals.monthly.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total for this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Daily revenue for this venue
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
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>
              Revenue breakdown by payment type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-center">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No payment data available</p>
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
