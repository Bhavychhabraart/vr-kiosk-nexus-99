
import { Database } from "@/integrations/supabase/types";

export type MachineAuth = Database["public"]["Tables"]["machine_auth"]["Row"];
export type MachineAuthInsert = Database["public"]["Tables"]["machine_auth"]["Insert"];
export type MachineAuthUpdate = Database["public"]["Tables"]["machine_auth"]["Update"];

export type MachineGames = Database["public"]["Tables"]["machine_games"]["Row"];
export type MachineGamesInsert = Database["public"]["Tables"]["machine_games"]["Insert"];
export type MachineGamesUpdate = Database["public"]["Tables"]["machine_games"]["Update"];

export type AuthAttempt = Database["public"]["Tables"]["auth_attempts"]["Row"];

export interface MachineAuthResponse {
  success: boolean;
  venue?: {
    id: string;
    name: string;
    city: string;
    state: string;
    machine_model: string;
    serial_number: string;
  };
  auth?: {
    product_id: string;
    access_level: string;
    expires_at: string | null;
  };
  error?: string;
}

export interface MachineSession {
  venue: {
    id: string;
    name: string;
    city: string;
    state: string;
    machine_model: string;
    serial_number: string;
  };
  auth: {
    product_id: string;
    access_level: string;
    expires_at: string | null;
  };
  authenticated: boolean;
}
