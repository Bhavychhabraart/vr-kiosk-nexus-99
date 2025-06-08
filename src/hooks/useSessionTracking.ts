
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SessionData {
  sessionId: string;
  gameId: string;
  venueId: string;
  paymentMethod: 'rfid' | 'upi' | 'free';
  amountPaid: number;
  rfidTag?: string;
}

export const useSessionTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const startSession = useCallback(async (data: SessionData) => {
    try {
      setIsTracking(true);
      
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
      
      // Check if session with this ID already exists to prevent double creation
      const { data: existingSession } = await supabase
        .from('session_tracking')
        .select('id')
        .eq('session_id', data.sessionId)
        .maybeSingle();

      if (existingSession) {
        console.log('Session already exists, skipping creation');
        return true;
      }

      const { error } = await supabase
        .from('session_tracking')
        .insert({
          session_id: data.sessionId,
          game_id: data.gameId,
          venue_id: data.venueId,
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
      
      // Get the session to calculate duration and ensure it exists
      const { data: session } = await supabase
        .from('session_tracking')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .maybeSingle();

      if (!session) {
        console.error('Active session not found:', sessionId);
        return false;
      }

      // Prevent double ending by checking if already completed
      if (session.status === 'completed') {
        console.log('Session already completed:', sessionId);
        return true;
      }

      let durationSeconds = 0;
      if (session.start_time) {
        const startTime = new Date(session.start_time);
        const endTimeDate = new Date(endTime);
        durationSeconds = Math.floor((endTimeDate.getTime() - startTime.getTime()) / 1000);
      }

      // Update session_tracking table with completed status
      const { error: updateError } = await supabase
        .from('session_tracking')
        .update({
          end_time: endTime,
          duration_seconds: durationSeconds,
          status: 'completed',
          rating: rating
        })
        .eq('session_id', sessionId)
        .eq('status', 'active'); // Only update if still active

      if (updateError) {
        console.error('Error updating session tracking:', updateError);
        throw updateError;
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
