
import { Database } from "@/integrations/supabase/types";

// Export specific types from the auto-generated Supabase types
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
export type GameUpdate = Database["public"]["Tables"]["games"]["Update"];

export type SessionHistory = Database["public"]["Tables"]["session_history"]["Row"];
export type SessionHistoryInsert = Database["public"]["Tables"]["session_history"]["Insert"];
export type SessionHistoryUpdate = Database["public"]["Tables"]["session_history"]["Update"];

export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type SettingsInsert = Database["public"]["Tables"]["settings"]["Insert"];
export type SettingsUpdate = Database["public"]["Tables"]["settings"]["Update"];

// Add any additional custom types here
export interface WebSocketSettings {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
}

export interface KioskSettings {
  name: string;
  location: string;
  idleTimeout: number;
}
