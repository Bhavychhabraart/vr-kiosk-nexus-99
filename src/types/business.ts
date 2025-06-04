
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

// New types for Super Admin Panel
export type Venue = Database["public"]["Tables"]["venues"]["Row"];
export type VenueInsert = Database["public"]["Tables"]["venues"]["Insert"];
export type VenueUpdate = Database["public"]["Tables"]["venues"]["Update"];

export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate = Database["public"]["Tables"]["notifications"]["Update"];

export type BusinessAnalytics = Database["public"]["Tables"]["business_analytics"]["Row"];
export type BusinessAnalyticsInsert = Database["public"]["Tables"]["business_analytics"]["Insert"];
export type BusinessAnalyticsUpdate = Database["public"]["Tables"]["business_analytics"]["Update"];

export type AdminUser = Database["public"]["Tables"]["admin_users"]["Row"];
export type AdminUserInsert = Database["public"]["Tables"]["admin_users"]["Insert"];
export type AdminUserUpdate = Database["public"]["Tables"]["admin_users"]["Update"];

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

export interface VenueWithAnalytics extends Venue {
  daily_revenue?: number;
  monthly_sessions?: number;
  customer_count?: number;
  status_color?: string;
}

export interface BusinessMetrics {
  totalRevenue: number;
  totalVenues: number;
  activeVenues: number;
  totalCustomers: number;
  averageSessionDuration: number;
  topPerformingVenue?: Venue;
}
