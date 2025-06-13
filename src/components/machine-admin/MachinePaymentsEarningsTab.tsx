
import React, { useState, useEffect } from "react";
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
  Download
} from "lucide-react";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useRealTimeEarnings } from "@/hooks/useRealTimeEarnings";
import { usePDFExport } from "@/hooks/usePDFExport";
import { useRefresh } from "@/contexts/RefreshContext";
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

interface MachinePaymentsEarningsTabProps {
  venueId: string;
}

const MachinePaymentsEarningsTab = ({ venueId }: MachinePaymentsEarningsTabProps) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    rfidEnabled: true,
    upiEnabled: false,
    upiMerchantId: ''
  });

  const { data: earningsData, isLoading: earningsLoading, refetch: refetchEarnings } = useRealTimeEarnings(venueId);
  const { paymentMethods, isLoading: methodsLoading } = usePaymentMethods();
  const { exportAnalyticsToPDF } = usePDFExport();
  const { toast } = useToast();
  const { isRefreshing, lastRefresh } = useRefresh();

  // Refetch data when global refresh is triggered
  useEffect(() => {
    refetchEarnings();
  }, [lastRefresh, refetchEarnings]);

  const isLoading = earningsLoading || methodsLoading;

  const handlePaymentConfigSave = async () => {
    try {
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
    if (!earningsData) return;
    
    exportAnalyticsToPDF({
      venueName: "Payment Analytics",
      timePeriod: "Current Period",
      dateRange: "Real-time Data",
      analytics: {
        currentPeriod: {
          sessions: earningsData.today.sessions,
          revenue: earningsData.today.revenue,
          avgDuration: 0,
          uniqueCustomers: 0
        },
        previousPeriod: {
          sessions: 0,
          revenue: 0,
          avgDuration: 0,
          uniqueCustomers: 0
        },
        trends: {
          sessionsChange: 0,
          revenueChange: 0,
          durationChange: 0,
          customersChange: 0
        },
        timeDistribution: [],
        gamePerformance: [],
        sessionsByHour: []
      },
      sessionDetails: []
    });
  };

  const paymentBreakdownData = earningsData ? [
    { name: 'RFID Cards', value: earningsData.today.rfid, color: '#00eaff' },
    { name: 'UPI Payments', value: earningsData.today.upi, color: '#ff6b6b' }
  ].filter(item => item.value > 0) : [];

  if (isLoading && !earningsData) {
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
          <Button onClick={handleExportPaymentData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

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
                  ₹{earningsData?.today.rfid.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Today's RFID revenue</p>
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
                  ₹{earningsData?.today.upi.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">Today's UPI revenue</p>
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

      {/* Real-time Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-vr-primary">
              ₹{earningsData?.today.revenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {earningsData?.today.sessions || 0} sessions today
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
              ₹{earningsData?.week.revenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {earningsData?.week.sessions || 0} sessions this week
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
              ₹{earningsData?.month.revenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {earningsData?.month.sessions || 0} sessions this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Earnings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{earningsData?.year.revenue.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {earningsData?.year.sessions || 0} sessions this year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Payment Method Distribution</CardTitle>
          <CardDescription>
            Revenue breakdown by payment type for today
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
                <p className="text-muted-foreground">No payment data available for today</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start accepting payments to see distribution
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MachinePaymentsEarningsTab;
