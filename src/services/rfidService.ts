
import { supabase } from "@/integrations/supabase/client";

export interface RFIDCard {
  tag_id: string;
  name?: string;
  status: string;
  created_at: string;
  last_used_at?: string;
}

export interface SessionRecord {
  id: string;
  game_id: string;
  rfid_tag: string;
  start_time: string;
  status: string;
}

class RFIDService {
  // Simulate RFID tap (for testing without hardware)
  async simulateRFIDTap(): Promise<string> {
    // Generate a test card ID
    const testCardId = `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a temporary test card in the database
    await this.createTestCard(testCardId);
    
    return testCardId;
  }

  // Create a test card for simulation
  private async createTestCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('rfid_cards')
      .upsert({
        tag_id: cardId,
        name: `Test Card ${cardId.split('_')[1]}`,
        status: 'active',
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'tag_id'
      });

    if (error) {
      console.error('Error creating test card:', error);
      throw new Error('Failed to create test card');
    }
  }

  // Validate RFID card
  async validateRFIDCard(cardId: string): Promise<RFIDCard> {
    const { data, error } = await supabase
      .from('rfid_cards')
      .select('*')
      .eq('tag_id', cardId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      throw new Error('Invalid or inactive RFID card');
    }

    return data as RFIDCard;
  }

  // Check if card has active session
  async checkActiveSession(cardId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('session_history')
      .select('id')
      .eq('rfid_tag', cardId)
      .eq('status', 'active')
      .limit(1);

    if (error) {
      console.error('Error checking active session:', error);
      return false;
    }

    return data && data.length > 0;
  }

  // Create session from RFID tap
  async createSessionFromRFID(cardId: string, gameId: string, durationSeconds: number): Promise<string> {
    // Validate card first
    const card = await this.validateRFIDCard(cardId);
    
    // Check for existing active session
    const hasActiveSession = await this.checkActiveSession(cardId);
    if (hasActiveSession) {
      throw new Error('This card already has an active session');
    }

    // Create new session record
    const sessionData = {
      game_id: gameId,
      rfid_tag: cardId,
      start_time: new Date().toISOString(),
      duration_seconds: durationSeconds,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('session_history')
      .insert(sessionData)
      .select('id')
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session record');
    }

    // Update card's last used time
    await supabase
      .from('rfid_cards')
      .update({ last_used_at: new Date().toISOString() })
      .eq('tag_id', cardId);

    return data.id;
  }

  // End session
  async endSession(sessionId: string, rating?: number): Promise<void> {
    const updateData: any = {
      end_time: new Date().toISOString(),
      status: 'completed'
    };

    if (rating) {
      updateData.rating = rating;
    }

    const { error } = await supabase
      .from('session_history')
      .update(updateData)
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending session:', error);
      throw new Error('Failed to end session');
    }
  }

  // Get session by ID
  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const { data, error } = await supabase
      .from('session_history')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return data as SessionRecord;
  }

  // Get card info
  async getCardInfo(cardId: string): Promise<RFIDCard | null> {
    const { data, error } = await supabase
      .from('rfid_cards')
      .select('*')
      .eq('tag_id', cardId)
      .single();

    if (error) {
      console.error('Error getting card info:', error);
      return null;
    }

    return data as RFIDCard;
  }
}

export const rfidService = new RFIDService();
