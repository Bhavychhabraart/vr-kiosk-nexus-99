
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Gift, Phone, Mail, MapPin } from "lucide-react";

const CustomerManagement = () => {
  // Sample customer data
  const customers = [
    {
      id: 1,
      name: "Amit Kumar",
      email: "amit@email.com",
      phone: "+91-9876543215",
      city: "New Delhi",
      totalSessions: 25,
      totalSpent: 2500,
      loyaltyPoints: 250,
      lastVisit: "2024-01-15"
    },
    {
      id: 2,
      name: "Sneha Patel",
      email: "sneha@email.com",
      phone: "+91-9876543216",
      city: "Mumbai",
      totalSessions: 18,
      totalSpent: 1800,
      loyaltyPoints: 180,
      lastVisit: "2024-01-14"
    },
    {
      id: 3,
      name: "Ravi Sharma",
      email: "ravi@email.com",
      phone: "+91-9876543217",
      city: "Bangalore",
      totalSessions: 32,
      totalSpent: 3200,
      loyaltyPoints: 320,
      lastVisit: "2024-01-16"
    }
  ];

  const getCustomerTier = (points: number) => {
    if (points >= 300) return { label: "Platinum", color: "bg-purple-100 text-purple-800" };
    if (points >= 200) return { label: "Gold", color: "bg-yellow-100 text-yellow-800" };
    if (points >= 100) return { label: "Silver", color: "bg-gray-100 text-gray-800" };
    return { label: "Bronze", color: "bg-orange-100 text-orange-800" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Customer Management</h2>
          <p className="text-muted-foreground">Manage customers across all venues</p>
        </div>
        <Button className="flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Launch Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active This Month</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Loyalty Points</p>
                <p className="text-2xl font-bold">185</p>
              </div>
              <Gift className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer LTV</p>
                <p className="text-2xl font-bold">₹3,240</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Database</CardTitle>
          <CardDescription>Search and manage customer information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers..." className="pl-10" />
            </div>
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => {
                const tier = getCustomerTier(customer.loyaltyPoints);
                return (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.loyaltyPoints} points</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                        <p className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {customer.city}
                      </div>
                    </TableCell>
                    <TableCell>{customer.totalSessions}</TableCell>
                    <TableCell>₹{customer.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={tier.color}>{tier.label}</Badge>
                    </TableCell>
                    <TableCell>{new Date(customer.lastVisit).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Profile</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerManagement;
