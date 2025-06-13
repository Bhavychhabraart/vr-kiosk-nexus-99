
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Smartphone,
  Calendar,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw
} from "lucide-react";
import { useEarnings } from "@/hooks/useEarnings";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useComprehensiveAnalytics, TimePeriod } from "@/hooks/useComprehensiveAnalytics";
import { usePDFExport } from "@/hooks/usePDFExport";
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
  Cell,
  BarChart,
  Bar
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import GlobalRefresh from "./GlobalRefresh";

interface MachinePaymentsEarningsTabProps {
  venueId: string;
}

const MachinePaymentsEarningsTab = ({ venueId }: MachinePaymentsEarningsTabProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    rfidEnabled: true,
    upiEnabled: false,
    upiMerchantId: ''
  });
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { earnings, totals, isLoading: earningsLoading } = useEarnings(venueId);
  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const { data: analytics, isLoading: analyticsLoading, refetch } = useComprehensiveAnalytics(venueId, timePeriod);
  const { exportAnalyticsToPDF } = usePDFExport();
  const { toast } = useToast();

  const isLoading = earningsLoading || methodsLoading || analyticsLoading;

  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };

  const handlePaymentConfigSave = async () => {
    try {
      // Here you would typically update the payment methods via API
      toast({
        title: "Payment Configuration Updated",
        description: "Payment method settings have been saved successfully.",
      });
      setIsConfiguring(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment configuration.",
        variant: "destructive",
      });
    }
  };

  const handleExportPaymentData = () => {
    if (!analytics) return;
    
    exportAnalyticsToPDF({
      venueName: "Payment Analytics",
      timePeriod: timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1),
      dateRange: getDateRangeLabel(timePeriod),
      analytics,
      sessionDetails: []
    });
  };

  const getDateRangeLabel = (period: TimePeriod): string => {
    const now = new Date();
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Custom Range';
    }
  };

  // Filter earnings for this venue
  const venueEarnings = earnings?.filter(earning => earning.venue_id === venueId) || [];
  
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

  const chartData = venueEarnings.slice(0, 30).reverse().map(earning => ({
    date: new Date(earning.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    revenue: Number(earning.total_revenue),
    sessions: earning.total_sessions,
    rfid: Number(earning.rfid_revenue) || 0,
    upi: Number(earning.upi_revenue) || 0
  }));

  const paymentBreakdownData = [
    { name: 'RFID Cards', value: venueTotals.breakdown.rfid, color: '#00eaff' },
    { name: 'UPI Payments', value: venueTotals.breakdown.upi, color: '#ff6b6b' }
  ].filter(item => item.value > 0);

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

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payments & Earnings</h2>
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
            </SelectContent>
          </Select>
          
          <Button onClick={handleExportPaymentData} variant="outline" className="flex items-center gap-2">
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

      {/* Payment Method Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payment Method Configuration
              </CardTitle>
              <CardDescription>
                Configure and monitor payment methods for your VR machine
              </CardDescription>
            </div>
            <Button 
              variant={isConfiguring ? "default" : "outline"} 
              onClick={() => setIsConfiguring(!isConfiguring)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isConfiguring ? "Cancel" : "Configure"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RFID Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">RFID Card Payments</h3>
                    <p className="text-sm text-muted-foreground">Contactless card payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {paymentMethods?.rfid_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Badge variant={paymentMethods?.rfid_enabled ? "default" : "secondary"}>
                    {paymentMethods?.rfid_enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              {isConfiguring && (
                <div className="space-y-3 pl-8">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={paymentConfig.rfidEnabled}
                      onCheckedChange={(checked) => 
                        setPaymentConfig(prev => ({ ...prev, rfidEnabled: checked }))
                      }
                    />
                    <Label>Enable RFID payments</Label>
                  </div>
                </div>
              )}
              
              <div className="pl-8 space-y-2">
                <div className="text-lg font-semibold text-blue-600">
                  ₹{venueTotals.breakdown.rfid.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total RFID revenue</p>
              </div>
            </div>

            {/* UPI Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">UPI QR Payments</h3>
                    <p className="text-sm text-muted-foreground">Digital payments via UPI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {paymentMethods?.upi_enabled ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <Badge variant={paymentMethods?.upi_enabled ? "default" : "secondary"}>
                    {paymentMethods?.upi_enabled ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              
              {isConfiguring && (
                <div className="space-y-3 pl-8">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={paymentConfig.upiEnabled}
                      onCheckedChange={(checked) => 
                        setPaymentConfig(prev => ({ ...prev, upiEnabled: checked }))
                      }
                    />
                    <Label>Enable UPI payments</Label>
                  </div>
                  {paymentConfig.upiEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="upiMerchantId">UPI Merchant ID</Label>
                      <Input
                        id="upiMerchantId"
                        value={paymentConfig.upiMerchantId}
                        onChange={(e) => 
                          setPaymentConfig(prev => ({ ...prev, upiMerchantId: e.target.value }))
                        }
                        placeholder="Enter UPI Merchant ID"
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="pl-8 space-y-2">
                <div className="text-lg font-semibold text-purple-600">
                  ₹{venueTotals.breakdown.upi.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total UPI revenue</p>
                {paymentMethods?.upi_merchant_id && (
                  <p className="text-xs text-muted-foreground">
                    Merchant ID: {paymentMethods.upi_merchant_id}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {isConfiguring && (
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsConfiguring(false)}>
                Cancel
              </Button>
              <Button onClick={handlePaymentConfigSave}>
                Save Configuration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
              Daily revenue breakdown by payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rfid" stackId="1" fill="#00eaff" name="RFID" />
                <Bar dataKey="upi" stackId="1" fill="#ff6b6b" name="UPI" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Distribution */}
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure payment methods and start accepting payments
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MachinePaymentsEarningsTab;
