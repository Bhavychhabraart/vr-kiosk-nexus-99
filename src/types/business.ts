
import { Database } from "@/integrations/supabase/types";

// Export specific types from the auto-generated Supabase types
export type KioskOwner = Database["public"]["Tables"]["kiosk_owners"]["Row"];
export type KioskOwnerInsert = Database["public"]["Tables"]["kiosk_owners"]["Insert"];
export type KioskOwnerUpdate = Database["public"]["Tables"]["kiosk_owners"]["Update"];

export type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
export type PaymentMethodInsert = Database["public"]["Tables"]["payment_methods"]["Insert"];
export type PaymentMethodUpdate = Database["public"]["Tables"]["payment_methods"]["Update"];

export type EarningsSummary = Database["public"]["Tables"]["earnings_summary"]["Row"];
export type EarningsSummaryInsert = Database["public"]["Tables"]["earnings_summary"]["Insert"];
export type EarningsSummaryUpdate = Database["public"]["Tables"]["earnings_summary"]["Update"];

export type PopularGame = Database["public"]["Tables"]["popular_games"]["Row"];
export type PopularGameInsert = Database["public"]["Tables"]["popular_games"]["Insert"];
export type PopularGameUpdate = Database["public"]["Tables"]["popular_games"]["Update"];

export type UpcomingProduct = Database["public"]["Tables"]["upcoming_products"]["Row"];
export type UpcomingProductInsert = Database["public"]["Tables"]["upcoming_products"]["Insert"];
export type UpcomingProductUpdate = Database["public"]["Tables"]["upcoming_products"]["Update"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

export type SupportTicket = Database["public"]["Tables"]["support_tickets"]["Row"];
export type SupportTicketInsert = Database["public"]["Tables"]["support_tickets"]["Insert"];
export type SupportTicketUpdate = Database["public"]["Tables"]["support_tickets"]["Update"];

// Additional business interfaces
export interface PaymentSettings {
  rfidEnabled: boolean;
  upiEnabled: boolean;
  upiMerchantId?: string;
  qrCodeSettings?: {
    displayDuration: number;
    size: string;
    backgroundColor: string;
  };
}

export interface EarningsData {
  daily: number;
  weekly: number;
  monthly: number;
  breakdown: {
    rfid: number;
    upi: number;
  };
}

export interface GamePerformance extends PopularGame {
  game_title?: string;
  revenue_per_session?: number;
  engagement_score?: number;
}

export interface ProductPreview extends UpcomingProduct {
  is_featured?: boolean;
  demo_available?: boolean;
}
