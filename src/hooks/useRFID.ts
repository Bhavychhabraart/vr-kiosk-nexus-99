
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RFIDCard, RFIDCardInsert } from '@/types';
import websocketService, { CommandType } from '@/services/websocket';

// Fetch all RFID cards
const fetchRFIDCards = async (): Promise<RFIDCard[]> => {
  const { data, error } = await supabase
    .from('rfid_cards')
    .select('*')
    .order('last_used_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching RFID cards: ${error.message}`);
  }

  return data || [];
};

// Get a specific RFID card by tag ID
const getRFIDCardByTagId = async (tagId: string): Promise<RFIDCard | null> => {
  const { data, error } = await supabase
    .from('rfid_cards')
    .select('*')
    .eq('tag_id', tagId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw new Error(`Error fetching RFID card: ${error.message}`);
  }

  return data;
};

// Create a new RFID card
const createRFIDCard = async (card: RFIDCardInsert): Promise<RFIDCard> => {
  const { data, error } = await supabase
    .from('rfid_cards')
    .insert(card)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error creating RFID card: ${error.message}`);
  }

  return data;
};

// Update an RFID card
const updateRFIDCard = async (id: string, updates: Partial<RFIDCard>): Promise<RFIDCard> => {
  const { data, error } = await supabase
    .from('rfid_cards')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error updating RFID card: ${error.message}`);
  }

  return data;
};

// Delete an RFID card
const deleteRFIDCard = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('rfid_cards')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting RFID card: ${error.message}`);
  }
};

// Mark an RFID card as used
const markRFIDCardAsUsed = async (tagId: string): Promise<RFIDCard> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('rfid_cards')
    .update({ last_used_at: now })
    .eq('tag_id', tagId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Error updating RFID card usage: ${error.message}`);
  }

  return data;
};

export const useRFID = () => {
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedRFID, setScannedRFID] = useState<string | null>(null);
  
  // Query to get all RFID cards
  const { data: rfidCards = [], isLoading: isLoadingCards, error: cardsError } = useQuery({
    queryKey: ['rfidCards'],
    queryFn: fetchRFIDCards,
  });
  
  // Mutation to create a new RFID card
  const createCardMutation = useMutation({
    mutationFn: createRFIDCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfidCards'] });
      toast({ title: "Success", description: "RFID card created successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
  
  // Mutation to update an RFID card
  const updateCardMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<RFIDCard> }) => 
      updateRFIDCard(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfidCards'] });
      toast({ title: "Success", description: "RFID card updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
  
  // Mutation to delete an RFID card
  const deleteCardMutation = useMutation({
    mutationFn: deleteRFIDCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfidCards'] });
      toast({ title: "Success", description: "RFID card deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });
  
  // Mutation to mark a card as used
  const markCardAsUsedMutation = useMutation({
    mutationFn: markRFIDCardAsUsed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfidCards'] });
    }
  });
  
  // Function to check if an RFID tag is valid
  const checkRFIDTag = useCallback(async (tagId: string) => {
    try {
      const card = await getRFIDCardByTagId(tagId);
      if (card) {
        markCardAsUsedMutation.mutate(tagId);
        return card;
      }
      return null;
    } catch (error) {
      console.error('Error checking RFID tag:', error);
      return null;
    }
  }, [markCardAsUsedMutation]);
  
  // Start RFID scanning using the WebSocket service to connect with hardware
  const startRFIDScan = useCallback(() => {
    setIsScanning(true);
    setScannedRFID(null);
    
    // Use the WebSocket service to send a command to start RFID scanning
    // This connects to the actual hardware through the C++/Python backend
    websocketService.sendCommand(CommandType.SCAN_RFID)
      .then(response => {
        if (response.status === 'success' && response.data?.tagId) {
          const tagId = response.data.tagId;
          setScannedRFID(tagId);
          
          // Check if this is a registered tag
          checkRFIDTag(tagId).then(card => {
            if (!card) {
              console.log('Unregistered RFID tag scanned:', tagId);
            }
          });
        } else {
          toast({
            title: "Scan Error",
            description: "Failed to read RFID card. Please try again.",
            variant: "destructive",
          });
        }
        setIsScanning(false);
      })
      .catch(error => {
        console.error('RFID scan error:', error);
        toast({
          title: "Hardware Error",
          description: "Could not connect to RFID reader. Please check hardware connection.",
          variant: "destructive",
        });
        setIsScanning(false);
      });
  }, [checkRFIDTag]);
  
  // Cancel an ongoing scan
  const cancelRFIDScan = useCallback(() => {
    if (isScanning) {
      websocketService.sendCommand(CommandType.VALIDATE_RFID, { cancel: true })
        .catch(error => console.error('Error cancelling RFID scan:', error));
    }
    
    setIsScanning(false);
    setScannedRFID(null);
  }, [isScanning]);
  
  return {
    rfidCards,
    isLoadingCards,
    cardsError,
    scanningForRFID: isScanning,  // For backward compatibility
    isScanning,                   // New preferred name
    scannedRFID,                  // For backward compatibility
    lastScannedTag: scannedRFID,  // New preferred name
    startRFIDScan,
    cancelRFIDScan,
    stopRFIDScan: cancelRFIDScan, // Aliasing for compatibility
    checkRFIDTag,
    createCard: (card: RFIDCardInsert) => createCardMutation.mutate(card),
    updateCard: (id: string, updates: Partial<RFIDCard>) => 
      updateCardMutation.mutate({ id, updates }),
    deleteCard: (id: string) => deleteCardMutation.mutate(id),
    isCreatingCard: createCardMutation.isPending,
    isUpdatingCard: updateCardMutation.isPending,
    isDeletingCard: deleteCardMutation.isPending
  };
};

export default useRFID;
