
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  HeadphonesIcon, 
  MessageSquare, 
  Phone, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ExternalLink
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

const SupportTab = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium"
  });

  // Load existing tickets
  React.useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description || !newTicket.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority
        });

      if (error) throw error;

      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted successfully",
      });

      setNewTicket({ title: "", description: "", category: "", priority: "medium" });
      setShowNewTicketForm(false);
      loadTickets();
    } catch (error: any) {
      toast({
        title: "Error Creating Ticket",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Support Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Support</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">24/7 Available</div>
            <p className="text-xs text-muted-foreground mt-1">
              Call us for immediate assistance
            </p>
            <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
              <Phone className="h-4 w-4 mr-1" />
              Call Support
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Support</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">support@vrtech.com</div>
            <p className="text-xs text-muted-foreground mt-1">
              Response within 4 hours
            </p>
            <Button size="sm" variant="outline" className="mt-2 border-green-600 text-green-600">
              <Mail className="h-4 w-4 mr-1" />
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-600">Online Now</div>
            <p className="text-xs text-muted-foreground mt-1">
              Real-time assistance available
            </p>
            <Button size="sm" variant="outline" className="mt-2 border-purple-600 text-purple-600">
              <MessageSquare className="h-4 w-4 mr-1" />
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                Support Tickets
              </CardTitle>
              <CardDescription>
                Track and manage your support requests
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowNewTicketForm(!showNewTicketForm)}
              className="bg-vr-primary hover:bg-vr-primary/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* New Ticket Form */}
          {showNewTicketForm && (
            <Card className="mb-6 border-vr-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">Create New Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ticket-title">Title *</Label>
                      <Input
                        id="ticket-title"
                        value={newTicket.title}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Brief description of the issue"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ticket-category">Category *</Label>
                      <Select 
                        value={newTicket.category} 
                        onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="hardware">Hardware Problem</SelectItem>
                          <SelectItem value="software">Software Issue</SelectItem>
                          <SelectItem value="general">General Inquiry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-description">Description *</Label>
                    <Textarea
                      id="ticket-description"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the issue, steps to reproduce, etc."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Ticket"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewTicketForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <Card key={ticket.id} className="border-l-4 border-l-vr-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Created on {new Date(ticket.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1 capitalize">{ticket.status}</span>
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">Category: {ticket.category}</span>
                        <span>ID: #{ticket.id.slice(-8)}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No support tickets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a ticket if you need assistance with your VR kiosk
                </p>
                <Button 
                  onClick={() => setShowNewTicketForm(true)}
                  variant="outline"
                >
                  Create Your First Ticket
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base & Resources</CardTitle>
          <CardDescription>
            Common solutions and helpful resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Setup & Installation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Step-by-step guides for setting up your VR kiosk
              </p>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Guides
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Troubleshooting</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Common issues and their solutions
              </p>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-1" />
                Browse FAQ
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Video Tutorials</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Learn with step-by-step video instructions
              </p>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-1" />
                Watch Videos
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">System Diagnostics</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Run automated system health checks
              </p>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-1" />
                Run Diagnostics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTab;
