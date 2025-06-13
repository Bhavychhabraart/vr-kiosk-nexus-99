
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  venue_id: string;
  assigned_to: string | null;
  assigned_to_user_id: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  venues?: {
    name: string;
    city: string;
    state: string;
  };
}

interface CreateTicketData {
  title: string;
  description: string;
  category: string;
  priority: string;
  venue_id: string;
}

export const useSupportTickets = (venueId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tickets for a specific venue or all tickets (for super admin)
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['supportTickets', venueId],
    queryFn: async (): Promise<SupportTicket[]> => {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          venues (
            name,
            city,
            state
          )
        `)
        .order('created_at', { ascending: false });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching support tickets:', error);
        throw error;
      }

      return data || [];
    },
  });

  // Create a new support ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: CreateTicketData) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) {
        console.error('Error creating support ticket:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      toast({
        title: "Support Ticket Created",
        description: `Ticket ${data.ticket_number} has been created successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Create ticket error:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update ticket status
  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SupportTicket> }) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating support ticket:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      toast({
        title: "Ticket Updated",
        description: "Support ticket has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Update ticket error:', error);
      toast({
        title: "Error",
        description: "Failed to update support ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    tickets,
    isLoading,
    error,
    createTicket: createTicketMutation.mutate,
    isCreating: createTicketMutation.isPending,
    updateTicket: updateTicketMutation.mutate,
    isUpdating: updateTicketMutation.isPending,
  };
};
