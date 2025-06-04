
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MapPin, Phone, Mail, Settings, Activity } from "lucide-react";
import { useVenues } from "@/hooks/useVenues";
import { VenueInsert } from "@/types/business";

const VenueManagement = () => {
  const { venues, isLoading, createVenue, isCreating } = useVenues();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVenue, setNewVenue] = useState<Partial<VenueInsert>>({
    name: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    machine_model: 'VR-Pro-X1',
    status: 'active'
  });

  const handleCreateVenue = () => {
    if (!newVenue.name || !newVenue.city || !newVenue.state) {
      return;
    }

    createVenue(newVenue as VenueInsert);
    setShowCreateDialog(false);
    setNewVenue({
      name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      manager_name: '',
      manager_phone: '',
      manager_email: '',
      machine_model: 'VR-Pro-X1',
      status: 'active'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Venue Management</h2>
          <p className="text-muted-foreground">Manage all VR venues across India</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add New Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Venue</DialogTitle>
              <DialogDescription>
                Add a new VR venue to your network
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Venue Name *</Label>
                <Input
                  id="name"
                  value={newVenue.name}
                  onChange={(e) => setNewVenue({ ...newVenue, name: e.target.value })}
                  placeholder="VR World Mumbai"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newVenue.city}
                  onChange={(e) => setNewVenue({ ...newVenue, city: e.target.value })}
                  placeholder="Mumbai"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={newVenue.state} onValueChange={(value) => setNewVenue({ ...newVenue, state: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Telangana">Telangana</SelectItem>
                    <SelectItem value="West Bengal">West Bengal</SelectItem>
                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pin_code">PIN Code</Label>
                <Input
                  id="pin_code"
                  value={newVenue.pin_code}
                  onChange={(e) => setNewVenue({ ...newVenue, pin_code: e.target.value })}
                  placeholder="400001"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newVenue.address}
                  onChange={(e) => setNewVenue({ ...newVenue, address: e.target.value })}
                  placeholder="Complete address"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manager_name">Manager Name</Label>
                <Input
                  id="manager_name"
                  value={newVenue.manager_name}
                  onChange={(e) => setNewVenue({ ...newVenue, manager_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manager_phone">Manager Phone</Label>
                <Input
                  id="manager_phone"
                  value={newVenue.manager_phone}
                  onChange={(e) => setNewVenue({ ...newVenue, manager_phone: e.target.value })}
                  placeholder="+91-9876543210"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manager_email">Manager Email</Label>
                <Input
                  id="manager_email"
                  type="email"
                  value={newVenue.manager_email}
                  onChange={(e) => setNewVenue({ ...newVenue, manager_email: e.target.value })}
                  placeholder="manager@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="machine_model">Machine Model</Label>
                <Select value={newVenue.machine_model} onValueChange={(value) => setNewVenue({ ...newVenue, machine_model: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VR-Pro-X1">VR-Pro-X1</SelectItem>
                    <SelectItem value="VR-Pro-X2">VR-Pro-X2</SelectItem>
                    <SelectItem value="VR-Elite">VR-Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateVenue} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Venue"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Venues Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Venues ({venues?.length || 0})</CardTitle>
          <CardDescription>
            Manage and monitor all VR venues in your network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Venue</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues?.map((venue) => (
                <TableRow key={venue.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{venue.name}</p>
                      <p className="text-sm text-muted-foreground">{venue.serial_number}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p>{venue.city}, {venue.state}</p>
                        <p className="text-sm text-muted-foreground">{venue.pin_code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{venue.manager_name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {venue.manager_phone}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{venue.machine_model}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(venue.status || 'active')}>
                      <Activity className="w-3 h-3 mr-1" />
                      {venue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
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

export default VenueManagement;
