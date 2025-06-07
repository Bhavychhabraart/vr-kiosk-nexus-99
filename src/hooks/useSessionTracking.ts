
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
      
      console.log('Starting session with data:', data);
      
      // Ensure venue_id is set - this is critical for analytics
      if (!data.venueId) {
        console.error('No venue ID provided for session!');
        toast({
          variant: "destructive",
          title: "Session Error",
          description: "Venue ID is required to start a session",
        });
        setIsTracking(false);
        return false;
      }
      
      const sessionData = {
        session_id: data.sessionId,
        game_id: data.gameId,
        venue_id: data.venueId,
        payment_method: data.paymentMethod,
        amount_paid: data.amountPaid,
        rfid_tag: data.rfidTag,
        status: 'active'
      };

      console.log('Inserting session data:', sessionData);

      const { error, data: insertedData } = await supabase
        .from('session_tracking')
        .insert(sessionData)
        .select();

      if (error) {
        console.error('Error starting session tracking:', error);
        throw error;
      }

      console.log('Session tracking started successfully:', insertedData);
      
      // Show immediate feedback
      toast({
        title: "Session Started",
        description: `Game session ${data.sessionId} has been started`,
      });
      
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
      
      console.log('Ending session:', sessionId);
      
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

      console.log('Found session to end:', session);

      let durationSeconds = 0;
      if (session.start_time) {
        const startTime = new Date(session.start_time);
        const endTimeDate = new Date(endTime);
        durationSeconds = Math.floor((endTimeDate.getTime() - startTime.getTime()) / 1000);
      }

      console.log('Calculated duration:', durationSeconds, 'seconds');

      const updateData = {
        end_time: endTime,
        duration_seconds: durationSeconds,
        status: 'completed',
        rating: rating
      };

      console.log('Updating session with:', updateData);

      // Update session_tracking table
      const { error: updateError, data: updatedData } = await supabase
        .from('session_tracking')
        .update(updateData)
        .eq('session_id', sessionId)
        .select();

      if (updateError) {
        console.error('Error updating session tracking:', updateError);
        throw updateError;
      }

      console.log('Session tracking ended successfully:', updatedData);
      
      toast({
        title: "Session Completed",
        description: `Game session completed (${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s)`,
      });
      
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
      console.log('Updating session status:', sessionId, status);
      
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
