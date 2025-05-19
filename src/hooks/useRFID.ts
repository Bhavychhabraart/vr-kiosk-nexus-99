
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RFIDCard, RFIDCardInsert } from '@/types';

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
  const [scanningForRFID, setScanningForRFID] = useState(false);
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
        // Fix for line 205 - use mutate() function properly
        markCardAsUsedMutation.mutate(tagId);
        return card;
      }
      return null;
    } catch (error) {
      console.error('Error checking RFID tag:', error);
      return null;
    }
  }, [markCardAsUsedMutation]);
  
  // Simulate RFID scanning (for development without actual hardware)
  const startRFIDScan = useCallback(() => {
    setScanningForRFID(true);
    setScannedRFID(null);
    
    // In a real implementation, this would connect to actual RFID hardware
    // For development, we'll simulate a scan after a short delay
    const timeout = setTimeout(() => {
      // Generate a random RFID tag for simulation
      const simulatedTag = `RFID-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setScannedRFID(simulatedTag);
      setScanningForRFID(false);
      
      // Check if this is a registered tag
      checkRFIDTag(simulatedTag).then(card => {
        if (!card) {
          console.log('Unregistered RFID tag scanned:', simulatedTag);
        }
      });
      
    }, 2000); // Simulate 2 second scan time
    
    return () => clearTimeout(timeout);
  }, [checkRFIDTag]);
  
  // Cancel an ongoing scan
  const cancelRFIDScan = useCallback(() => {
    setScanningForRFID(false);
    setScannedRFID(null);
  }, []);
  
  return {
    rfidCards,
    isLoadingCards,
    cardsError,
    scanningForRFID,
    scannedRFID,
    startRFIDScan,
    cancelRFIDScan,
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
