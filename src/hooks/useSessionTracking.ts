import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SessionData {
  sessionId: string;
  gameId: string;
  venueId: string; // Make this required instead of optional
  paymentMethod: 'rfid' | 'upi' | 'free';
  amountPaid: number;
  rfidTag?: string;
}

export const useSessionTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const startSession = useCallback(async (data: SessionData) => {
    try {
      setIsTracking(true);
      
      // Validate that venue_id is provided
      if (!data.venueId) {
        console.error('Venue ID is required for session tracking');
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Venue information is missing",
        });
        return false;
      }

      console.log('Starting session with data:', data);
      
      const { error } = await supabase
        .from('session_tracking')
        .insert({
          session_id: data.sessionId,
          game_id: data.gameId,
          venue_id: data.venueId, // Ensure venue_id is always set
          payment_method: data.paymentMethod,
          amount_paid: data.amountPaid,
          rfid_tag: data.rfidTag,
          status: 'active'
        });

      if (error) {
        console.error('Error starting session tracking:', error);
        throw error;
      }

      console.log('Session tracking started successfully:', data.sessionId, 'for venue:', data.venueId);
      return true;
    } catch (error) {
      console.error('Failed to start session tracking:', error);
      toast({
        variant: "destructive",
        title: "Session Tracking Error",
        description: "Failed to start session tracking",
      });
      setIsTracking(false);
      return false;
    }
  }, []);

  const endSession = useCallback(async (sessionId: string, rating?: number) => {
    try {
      const endTime = new Date().toISOString();
      
      // Get the session to calculate duration
      const { data: session } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (!session) {
        console.error('Session not found:', sessionId);
        return false;
      }

      let durationSeconds = 0;
      if (session.start_time) {
        const startTime = new Date(session.start_time);
        const endTimeDate = new Date(endTime);
        durationSeconds = Math.floor((endTimeDate.getTime() - startTime.getTime()) / 1000);
      }

      // Update session_tracking table
      const { error: updateError } = await supabase
        .from('session_tracking')
        .update({
          end_time: endTime,
          duration_seconds: durationSeconds,
          status: 'completed',
          rating: rating
        })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error updating session tracking:', updateError);
        throw updateError;
      }

      // Also insert into session_history for analytics
      const { error: historyError } = await supabase
        .from('session_history')
        .insert({
          id: session.id, // Use same ID to avoid duplicates
          game_id: session.game_id,
          venue_id: session.venue_id,
          start_time: session.start_time,
          end_time: endTime,
          duration_seconds: durationSeconds,
          rfid_tag: session.rfid_tag,
          rating: rating,
          status: 'completed'
        });

      if (historyError && historyError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error inserting session history:', historyError);
        // Don't throw here as the main session update succeeded
      }

      console.log('Session tracking ended:', sessionId);
      setIsTracking(false);
      return true;
    } catch (error) {
      console.error('Failed to end session tracking:', error);
      toast({
        variant: "destructive",
        title: "Session Tracking Error",
        description: "Failed to end session tracking",
      });
      return false;
    }
  }, []);

  const updateSessionStatus = useCallback(async (sessionId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('session_tracking')
        .update({ status })
        .eq('session_id', sessionId);

      if (error) throw error;
      
      console.log('Session status updated:', sessionId, status);
      return true;
    } catch (error) {
      console.error('Failed to update session status:', error);
      return false;
    }
  }, []);

  return {
    isTracking,
    startSession,
    endSession,
    updateSessionStatus
  };
};
