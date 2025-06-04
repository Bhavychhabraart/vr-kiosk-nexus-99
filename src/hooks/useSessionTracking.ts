
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SessionData {
  sessionId: string;
  gameId: string;
  venueId?: string;
  paymentMethod: 'rfid' | 'upi';
  amountPaid: number;
  rfidTag?: string;
}

export const useSessionTracking = () => {
  const [isTracking, setIsTracking] = useState(false);

  const startSession = useCallback(async (data: SessionData) => {
    try {
      setIsTracking(true);
      
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

      console.log('Session tracking started:', data.sessionId);
      return true;
    } catch (error) {
      console.error('Failed to start session tracking:', error);
      toast({
        variant: "destructive",
        title: "Session Tracking Error",
        description: "Failed to start session tracking",
      });
      return false;
    }
  }, []);

  const endSession = useCallback(async (sessionId: string, rating?: number) => {
    try {
      const endTime = new Date().toISOString();
      
      // Get the session to calculate duration
      const { data: session } = await supabase
        .from('session_tracking')
        .select('start_time')
        .eq('session_id', sessionId)
        .single();

      let durationSeconds = 0;
      if (session) {
        const startTime = new Date(session.start_time);
        const endTimeDate = new Date(endTime);
        durationSeconds = Math.floor((endTimeDate.getTime() - startTime.getTime()) / 1000);
      }

      const { error } = await supabase
        .from('session_tracking')
        .update({
          end_time: endTime,
          duration_seconds: durationSeconds,
          status: 'completed',
          rating: rating
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error ending session tracking:', error);
        throw error;
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
