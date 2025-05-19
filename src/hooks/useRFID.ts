
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { RFIDCard, RFIDCardInsert, RFIDCardUpdate } from "@/types";
import { CommandType } from "@/services/websocket";
import websocketService from "@/services/websocket";

export function useRFID() {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedTag, setLastScannedTag] = useState<string | null>(null);
  
  // Fetch all RFID cards from the database
  const fetchRFIDCards = async (): Promise<RFIDCard[]> => {
    const { data, error } = await supabase
      .from('rfid_cards')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  };
  
  const { data: rfidCards, isLoading, error } = useQuery({
    queryKey: ['rfid-cards'],
    queryFn: fetchRFIDCards
  });
  
  // Create a new RFID card
  const createRFIDCard = useMutation({
    mutationFn: async (newCard: RFIDCardInsert) => {
      const { data, error } = await supabase
        .from('rfid_cards')
        .insert(newCard)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfid-cards'] });
      toast({
        title: "RFID Card Added",
        description: "The RFID card has been successfully registered.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Adding RFID Card",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update an RFID card
  const updateRFIDCard = useMutation({
    mutationFn: async (card: RFIDCardUpdate) => {
      const { data, error } = await supabase
        .from('rfid_cards')
        .update(card)
        .eq('id', card.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfid-cards'] });
      toast({
        title: "RFID Card Updated",
        description: "The RFID card has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Updating RFID Card",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete an RFID card
  const deleteRFIDCard = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rfid_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfid-cards'] });
      toast({
        title: "RFID Card Deleted",
        description: "The RFID card has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting RFID Card",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Validate an RFID tag
  const validateRFIDTag = async (tagId: string): Promise<boolean> => {
    try {
      // Check if the RFID tag exists in our database
      const { data, error } = await supabase
        .from('rfid_cards')
        .select('*')
        .eq('tag_id', tagId)
        .eq('status', 'active')
        .single();
      
      if (error) {
        console.error("RFID validation error:", error);
        return false;
      }
      
      if (data) {
        // Update the last_used_at timestamp
        await supabase
          .from('rfid_cards')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id);
        
        setLastScannedTag(tagId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error validating RFID:", error);
      return false;
    }
  };
  
  // Start scanning for RFID tags
  const startRFIDScan = async (): Promise<void> => {
    if (!websocketService.getConnectionState()) {
      toast({
        title: "Connection Error",
        description: "Cannot connect to the VR system. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    
    try {
      // Send command to start RFID scanning
      await websocketService.sendCommand(CommandType.HEARTBEAT);
      
      // In a real implementation, we would send a specific command for RFID scanning
      // and listen for responses with the scanned tag ID
      
      // For demo purposes, we'll simulate a scan after a short delay
      // In a real implementation, the tag would come from the VR system via websocket
      setTimeout(() => {
        simulateRFIDScan();
      }, 2000);
      
    } catch (error) {
      setIsScanning(false);
      toast({
        title: "RFID Scan Failed",
        description: "Could not initiate RFID scanning. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Stop scanning for RFID tags
  const stopRFIDScan = (): void => {
    setIsScanning(false);
  };
  
  // Simulate an RFID scan (for demo purposes)
  const simulateRFIDScan = (): void => {
    // Generate a random RFID tag for demonstration
    const tagPrefix = "VR";
    const tagId = `${tagPrefix}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // In a real app, we would receive this from the websocket
    // For now, we'll always validate it as true
    validateRFIDTag(tagId).then(isValid => {
      if (isValid) {
        toast({
          title: "RFID Detected",
          description: `Card ${tagId} successfully authenticated`,
        });
      } else {
        createRFIDCard({ tag_id: tagId })
          .then(() => {
            toast({
              title: "New RFID Card Detected",
              description: `Card ${tagId} has been registered`,
            });
            setLastScannedTag(tagId);
          });
      }
      setIsScanning(false);
    });
  };
  
  return {
    rfidCards,
    isLoading,
    error,
    isScanning,
    lastScannedTag,
    createRFIDCard: (card: RFIDCardInsert) => createRFIDCard.mutate(card),
    updateRFIDCard: (card: RFIDCardUpdate) => updateRFIDCard.mutate(card),
    deleteRFIDCard: (id: string) => deleteRFIDCard.mutate(id),
    validateRFIDTag,
    startRFIDScan,
    stopRFIDScan,
    simulateRFIDScan, // For testing purposes
  };
}
