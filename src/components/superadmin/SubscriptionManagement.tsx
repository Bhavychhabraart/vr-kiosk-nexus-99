
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, DollarSign, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

const SubscriptionManagement = () => {
  const subscriptions = [
    {
      id: 1,
      venueName: "VR World Delhi",
      planName: "Professional",
      monthlyFee: 15000,
      status: "active",
      nextBilling: "2024-02-15",
      features: ["Unlimited Sessions", "Analytics", "24/7 Support"]
    },
    {
      id: 2,
      venueName: "VR Zone Mumbai",
      planName: "Enterprise",
      monthlyFee: 25000,
      status: "active",
      nextBilling: "2024-02-20",
      features: ["Unlimited Sessions", "Advanced Analytics", "Priority Support", "Custom Branding"]
    },
    {
      id: 3,
      venueName: "GameSpace Bangalore",
      planName: "Professional",
      monthlyFee: 15000,
      status: "due",
      nextBilling: "2024-01-10",
      features: ["Unlimited Sessions", "Analytics", "24/7 Support"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'due': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Subscription & Billing</h2>
        <p className="text-muted-foreground">Manage subscriptions and billing for all venues</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹2,45,000</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Payments</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold">+18%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Plan</CardTitle>
            <CardDescription>Perfect for small venues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">₹8,000<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm">
              <li>• Up to 100 sessions/month</li>
              <li>• Basic analytics</li>
              <li>• Email support</li>
              <li>• 2 games included</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-vr-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Professional Plan
              <Badge>Popular</Badge>
            </CardTitle>
            <CardDescription>Most popular choice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">₹15,000<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm">
              <li>• Unlimited sessions</li>
              <li>• Advanced analytics</li>
              <li>• 24/7 support</li>
              <li>• 10 games included</li>
              <li>• Custom branding</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise Plan</CardTitle>
            <CardDescription>For large operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">₹25,000<span className="text-lg text-muted-foreground">/month</span></div>
            <ul className="space-y-2 text-sm">
              <li>• Unlimited everything</li>
              <li>• Real-time analytics</li>
              <li>• Priority support</li>
              <li>• All games included</li>
              <li>• White-label solution</li>
              <li>• API access</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>Manage all venue subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venue</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{sub.venueName}</p>
                      <p className="text-sm text-muted-foreground">
                        {sub.features.length} features included
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sub.planName}</Badge>
                  </TableCell>
                  <TableCell>₹{sub.monthlyFee.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sub.status)}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {new Date(sub.nextBilling).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm">Invoice</Button>
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

export default SubscriptionManagement;
