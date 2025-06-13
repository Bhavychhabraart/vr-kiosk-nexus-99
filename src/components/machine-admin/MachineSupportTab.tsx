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
  Monitor,
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupportTickets } from "@/hooks/useSupportTickets";

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

  const { tickets, isLoading, createTicket, isCreating } = useSupportTickets(venueId);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title.trim() || !ticketForm.description.trim() || !ticketForm.category) {
      return;
    }

    createTicket({
      title: ticketForm.title,
      description: ticketForm.description,
      category: ticketForm.category,
      priority: ticketForm.priority,
      venue_id: venueId,
    });

    // Clear form after submission
    setTicketForm({
      title: "",
      description: "",
      category: "",
      priority: "medium"
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
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
                  disabled={isCreating}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">Category</label>
                <Select 
                  value={ticketForm.category} 
                  onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}
                  disabled={isCreating}
                  required
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
                  disabled={isCreating}
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
                  disabled={isCreating}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Ticket...
                  </>
                ) : (
                  'Submit Support Ticket'
                )}
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

      {/* Recent Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
          <CardDescription>
            Your submitted tickets and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{ticket.ticket_number}</span>
                      <Badge className={`text-white ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={`text-white ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </Badge>
                    </div>
                    <h4 className="font-medium">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {ticket.category} • {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No support tickets found. Create your first ticket above.
            </p>
          )}
        </CardContent>
      </Card>

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
