
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Headphones, 
  MessageSquare, 
  Phone, 
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Wifi,
  Monitor
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MachineSupportTabProps {
  venueId: string;
}

const MachineSupportTab = ({ venueId }: MachineSupportTabProps) => {
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium"
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission here
    console.log("Submitting ticket for venue:", venueId, ticketForm);
  };

  const commonIssues = [
    {
      title: "VR Headset Not Tracking",
      description: "Check sensor placement and lighting conditions",
      category: "Hardware",
      solution: "Ensure sensors are clean and properly positioned"
    },
    {
      title: "Audio Issues",
      description: "No sound or distorted audio in VR experiences",
      category: "Audio",
      solution: "Check audio connections and volume settings"
    },
    {
      title: "Payment System Error",
      description: "RFID or UPI payment not processing",
      category: "Payment",
      solution: "Restart payment service or check network connection"
    },
    {
      title: "Game Won't Launch",
      description: "Selected game fails to start",
      category: "Software",
      solution: "Check game files and restart VR service"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Phone className="h-8 w-8 text-vr-primary" />
            <div>
              <h3 className="font-semibold">Emergency Support</h3>
              <p className="text-sm text-muted-foreground">24/7 hotline</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare className="h-8 w-8 text-vr-secondary" />
            <div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Real-time help</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-sm text-muted-foreground">Detailed queries</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex items-center gap-3 p-4">
            <Settings className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold">Remote Support</h3>
              <p className="text-sm text-muted-foreground">Screen sharing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Support Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Create Support Ticket
            </CardTitle>
            <CardDescription>
              Report issues specific to this machine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Issue Title</label>
                <Input
                  id="title"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select 
                  value={ticketForm.category} 
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware Issue</SelectItem>
                    <SelectItem value="software">Software Problem</SelectItem>
                    <SelectItem value="payment">Payment System</SelectItem>
                    <SelectItem value="network">Network/Connectivity</SelectItem>
                    <SelectItem value="maintenance">Maintenance Request</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <Select 
                  value={ticketForm.priority} 
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the issue, steps to reproduce, etc."
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Support Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Machine Status & Quick Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Machine Status
            </CardTitle>
            <CardDescription>
              Current system status and diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>VR System Status</span>
                </div>
                <Badge variant="default">Online</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span>Network Connection</span>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Payment System</span>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span>Last Maintenance</span>
                </div>
                <Badge variant="outline">3 days ago</Badge>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Run Full Diagnostics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Common Issues & Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Quick Solutions</CardTitle>
          <CardDescription>
            Frequently encountered problems and their solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonIssues.map((issue, index) => (
              <Card key={index} className="border-l-4 border-l-vr-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{issue.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {issue.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Solution:</strong> {issue.solution}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MachineSupportTab;
