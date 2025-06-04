export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      earnings_summary: {
        Row: {
          created_at: string | null
          date: string
          id: string
          kiosk_id: string | null
          rfid_revenue: number | null
          session_breakdown: Json | null
          total_revenue: number | null
          total_sessions: number | null
          upi_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          kiosk_id?: string | null
          rfid_revenue?: number | null
          session_breakdown?: Json | null
          total_revenue?: number | null
          total_sessions?: number | null
          upi_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          kiosk_id?: string | null
          rfid_revenue?: number | null
          session_breakdown?: Json | null
          total_revenue?: number | null
          total_sessions?: number | null
          upi_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "earnings_summary_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          arguments: string | null
          created_at: string
          description: string | null
          executable_path: string | null
          id: string
          image_url: string | null
          is_active: boolean
          max_duration_seconds: number
          min_duration_seconds: number
          title: string
          trailer_url: string | null
          updated_at: string
          working_directory: string | null
        }
        Insert: {
          arguments?: string | null
          created_at?: string
          description?: string | null
          executable_path?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_duration_seconds?: number
          min_duration_seconds?: number
          title: string
          trailer_url?: string | null
          updated_at?: string
          working_directory?: string | null
        }
        Update: {
          arguments?: string | null
          created_at?: string
          description?: string | null
          executable_path?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_duration_seconds?: number
          min_duration_seconds?: number
          title?: string
          trailer_url?: string | null
          updated_at?: string
          working_directory?: string | null
        }
        Relationships: []
      }
      kiosk_owners: {
        Row: {
          address: string | null
          business_license: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          kiosk_name: string
          logo_url: string | null
          operating_hours: Json | null
          owner_name: string
          theme_colors: Json | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          business_license?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          kiosk_name: string
          logo_url?: string | null
          operating_hours?: Json | null
          owner_name: string
          theme_colors?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          business_license?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          kiosk_name?: string
          logo_url?: string | null
          operating_hours?: Json | null
          owner_name?: string
          theme_colors?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          id: string
          kiosk_id: string | null
          payment_gateway_config: Json | null
          rfid_enabled: boolean | null
          updated_at: string | null
          upi_enabled: boolean | null
          upi_merchant_id: string | null
          upi_qr_settings: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          kiosk_id?: string | null
          payment_gateway_config?: Json | null
          rfid_enabled?: boolean | null
          updated_at?: string | null
          upi_enabled?: boolean | null
          upi_merchant_id?: string | null
          upi_qr_settings?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          kiosk_id?: string | null
          payment_gateway_config?: Json | null
          rfid_enabled?: boolean | null
          updated_at?: string | null
          upi_enabled?: boolean | null
          upi_merchant_id?: string | null
          upi_qr_settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      popular_games: {
        Row: {
          average_rating: number | null
          created_at: string | null
          game_id: string | null
          id: string
          kiosk_id: string | null
          last_played_at: string | null
          monthly_sessions: number | null
          total_revenue: number | null
          total_sessions: number | null
          updated_at: string | null
          weekly_sessions: number | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          kiosk_id?: string | null
          last_played_at?: string | null
          monthly_sessions?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          weekly_sessions?: number | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          game_id?: string | null
          id?: string
          kiosk_id?: string | null
          last_played_at?: string | null
          monthly_sessions?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          updated_at?: string | null
          weekly_sessions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "popular_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "popular_games_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      rfid_cards: {
        Row: {
          created_at: string
          id: string
          last_used_at: string | null
          name: string | null
          status: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string | null
          status?: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string | null
          status?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_history: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          game_id: string | null
          id: string
          notes: string | null
          rating: number | null
          rfid_tag: string | null
          start_time: string
          status: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          rfid_tag?: string | null
          start_time?: string
          status?: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          rfid_tag?: string | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: string
          updated_at: string
          value: Json
        }
        Insert: {
          id: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_history: Json | null
          created_at: string | null
          end_date: string | null
          features: Json | null
          id: string
          kiosk_id: string | null
          max_games: number | null
          max_sessions_per_month: number | null
          monthly_cost: number
          plan_name: string
          plan_tier: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          billing_history?: Json | null
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          kiosk_id?: string | null
          max_games?: number | null
          max_sessions_per_month?: number | null
          monthly_cost: number
          plan_name: string
          plan_tier: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_history?: Json | null
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          kiosk_id?: string | null
          max_games?: number | null
          max_sessions_per_month?: number | null
          monthly_cost?: number
          plan_name?: string
          plan_tier?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string
          created_at: string | null
          description: string
          id: string
          kiosk_id: string | null
          priority: string | null
          resolution: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category: string
          created_at?: string | null
          description: string
          id?: string
          kiosk_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          kiosk_id?: string | null
          priority?: string | null
          resolution?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          estimated_price: number | null
          features: Json | null
          id: string
          name: string
          pre_order_available: boolean | null
          preview_image_url: string | null
          release_date: string | null
          status: string | null
          trailer_url: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          estimated_price?: number | null
          features?: Json | null
          id?: string
          name: string
          pre_order_available?: boolean | null
          preview_image_url?: string | null
          release_date?: string | null
          status?: string | null
          trailer_url?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          estimated_price?: number | null
          features?: Json | null
          id?: string
          name?: string
          pre_order_available?: boolean | null
          preview_image_url?: string | null
          release_date?: string | null
          status?: string | null
          trailer_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
