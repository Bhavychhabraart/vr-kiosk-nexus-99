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
      admin_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          token: string
          used_at: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          token: string
          used_at?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          token?: string
          used_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_invitations_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          permissions: Json | null
          role: string
          updated_at: string | null
          username: string
          venue_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          username: string
          venue_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: Json | null
          role?: string
          updated_at?: string | null
          username?: string
          venue_ids?: string[] | null
        }
        Relationships: []
      }
      auth_attempts: {
        Row: {
          attempted_at: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          product_id: string | null
          success: boolean | null
          user_agent: string | null
          venue_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          product_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          venue_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          product_id?: string | null
          success?: boolean | null
          user_agent?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_attempts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      business_analytics: {
        Row: {
          active_venues: number | null
          average_session_duration: number | null
          created_at: string | null
          date: string
          id: string
          new_customers: number | null
          regional_breakdown: Json | null
          top_performing_venue_id: string | null
          total_customers: number | null
          total_revenue: number | null
          total_sessions: number | null
          total_venues: number | null
        }
        Insert: {
          active_venues?: number | null
          average_session_duration?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_customers?: number | null
          regional_breakdown?: Json | null
          top_performing_venue_id?: string | null
          total_customers?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          total_venues?: number | null
        }
        Update: {
          active_venues?: number | null
          average_session_duration?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_customers?: number | null
          regional_breakdown?: Json | null
          top_performing_venue_id?: string | null
          total_customers?: number | null
          total_revenue?: number | null
          total_sessions?: number | null
          total_venues?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_analytics_top_performing_venue_id_fkey"
            columns: ["top_performing_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          gender: string | null
          id: string
          last_visit_date: string | null
          loyalty_points: number | null
          name: string | null
          phone: string | null
          preferred_venue_id: string | null
          total_sessions: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_visit_date?: string | null
          loyalty_points?: number | null
          name?: string | null
          phone?: string | null
          preferred_venue_id?: string | null
          total_sessions?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_visit_date?: string | null
          loyalty_points?: number | null
          name?: string | null
          phone?: string | null
          preferred_venue_id?: string | null
          total_sessions?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_preferred_venue_id_fkey"
            columns: ["preferred_venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
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
          venue_id: string | null
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
          venue_id?: string | null
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
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earnings_summary_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_summary_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
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
          venue_id: string | null
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
          venue_id?: string | null
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
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_owners_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_options: {
        Row: {
          created_at: string
          default_duration_minutes: number
          id: string
          price_per_minute: number
          qr_payment_enabled: boolean
          rfid_enabled: boolean
          tap_to_start_enabled: boolean
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          default_duration_minutes?: number
          id?: string
          price_per_minute?: number
          qr_payment_enabled?: boolean
          rfid_enabled?: boolean
          tap_to_start_enabled?: boolean
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          default_duration_minutes?: number
          id?: string
          price_per_minute?: number
          qr_payment_enabled?: boolean
          rfid_enabled?: boolean
          tap_to_start_enabled?: boolean
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_options_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: true
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_auth: {
        Row: {
          access_level: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          product_id: string
          product_key: string
          updated_at: string | null
          venue_id: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          product_id: string
          product_key: string
          updated_at?: string | null
          venue_id: string
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          product_id?: string
          product_key?: string
          updated_at?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machine_auth_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_games: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          game_id: string
          id: string
          is_active: boolean | null
          venue_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          game_id: string
          id?: string
          is_active?: boolean | null
          venue_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          game_id?: string
          id?: string
          is_active?: boolean | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machine_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machine_games_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      machine_setup_status: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          current_status: Database["public"]["Enums"]["setup_status"] | null
          id: string
          machine_serial_number: string
          setup_data: Json | null
          updated_at: string | null
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_status?: Database["public"]["Enums"]["setup_status"] | null
          id?: string
          machine_serial_number: string
          setup_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_status?: Database["public"]["Enums"]["setup_status"] | null
          id?: string
          machine_serial_number?: string
          setup_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          message: string
          priority: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          target_ids: string[] | null
          target_type: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          target_ids?: string[] | null
          target_type: string
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          target_ids?: string[] | null
          target_type?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      owner_registration: {
        Row: {
          business_address: string | null
          business_city: string | null
          business_name: string
          business_pin_code: string | null
          business_state: string | null
          business_type: string | null
          created_at: string | null
          email_verified_at: string | null
          expected_hours: Json | null
          id: string
          machine_serial_number: string
          owner_email: string
          owner_name: string
          owner_phone: string | null
          phone_verified_at: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          business_address?: string | null
          business_city?: string | null
          business_name: string
          business_pin_code?: string | null
          business_state?: string | null
          business_type?: string | null
          created_at?: string | null
          email_verified_at?: string | null
          expected_hours?: Json | null
          id?: string
          machine_serial_number: string
          owner_email: string
          owner_name: string
          owner_phone?: string | null
          phone_verified_at?: string | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          business_address?: string | null
          business_city?: string | null
          business_name?: string
          business_pin_code?: string | null
          business_state?: string | null
          business_type?: string | null
          created_at?: string | null
          email_verified_at?: string | null
          expected_hours?: Json | null
          id?: string
          machine_serial_number?: string
          owner_email?: string
          owner_name?: string
          owner_phone?: string | null
          phone_verified_at?: string | null
          updated_at?: string | null
          verification_status?: string | null
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
          venue_id: string | null
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
          venue_id?: string | null
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
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_methods_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
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
          venue_id: string | null
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
          venue_id?: string | null
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
          venue_id?: string | null
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
          {
            foreignKeyName: "popular_games_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rfid_cards: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          last_used_at: string | null
          name: string | null
          status: string
          tag_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          last_used_at?: string | null
          name?: string | null
          status?: string
          tag_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          last_used_at?: string | null
          name?: string | null
          status?: string
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfid_cards_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      session_history: {
        Row: {
          created_at: string
          customer_id: string | null
          duration_seconds: number | null
          end_time: string | null
          game_id: string | null
          id: string
          notes: string | null
          rating: number | null
          rfid_tag: string | null
          start_time: string
          status: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          rfid_tag?: string | null
          start_time?: string
          status?: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          notes?: string | null
          rating?: number | null
          rfid_tag?: string | null
          start_time?: string
          status?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_history_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      session_tracking: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          duration_seconds: number | null
          end_time: string | null
          game_id: string | null
          id: string
          payment_method: string | null
          rating: number | null
          rfid_tag: string | null
          session_id: string
          start_time: string
          status: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          payment_method?: string | null
          rating?: number | null
          rfid_tag?: string | null
          session_id: string
          start_time?: string
          status?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          game_id?: string | null
          id?: string
          payment_method?: string | null
          rating?: number | null
          rfid_tag?: string | null
          session_id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_tracking_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_tracking_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
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
      setup_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          machine_serial_number: string
          token: string
          token_type: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          machine_serial_number: string
          token: string
          token_type?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          machine_serial_number?: string
          token?: string
          token_type?: string
          used_at?: string | null
        }
        Relationships: []
      }
      simplified_user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["simplified_user_role"]
          updated_at: string | null
          user_id: string
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["simplified_user_role"]
          updated_at?: string | null
          user_id: string
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["simplified_user_role"]
          updated_at?: string | null
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simplified_user_roles_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
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
          venue_id: string | null
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
          venue_id?: string | null
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
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
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
          venue_id: string | null
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
          venue_id?: string | null
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
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
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
      user_roles: {
        Row: {
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
          venue_id: string | null
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
          venue_id?: string | null
        }
        Update: {
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_settings: {
        Row: {
          admin_password: string | null
          brightness: number | null
          created_at: string | null
          id: string
          password_protection_enabled: boolean | null
          rfid_enabled: boolean | null
          sound_effects_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          upi_enabled: boolean | null
          upi_merchant_id: string | null
          venue_id: string
          volume: number | null
        }
        Insert: {
          admin_password?: string | null
          brightness?: number | null
          created_at?: string | null
          id?: string
          password_protection_enabled?: boolean | null
          rfid_enabled?: boolean | null
          sound_effects_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          upi_enabled?: boolean | null
          upi_merchant_id?: string | null
          venue_id: string
          volume?: number | null
        }
        Update: {
          admin_password?: string | null
          brightness?: number | null
          created_at?: string | null
          id?: string
          password_protection_enabled?: boolean | null
          rfid_enabled?: boolean | null
          sound_effects_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          upi_enabled?: boolean | null
          upi_merchant_id?: string | null
          venue_id?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_settings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: true
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          city: string
          created_at: string | null
          first_boot_completed: boolean | null
          id: string
          installation_date: string | null
          last_maintenance: string | null
          latitude: number | null
          longitude: number | null
          machine_mode: Database["public"]["Enums"]["machine_mode"] | null
          machine_model: string | null
          manager_email: string | null
          manager_name: string | null
          manager_phone: string | null
          name: string
          pin_code: string
          serial_number: string | null
          setup_completed_at: string | null
          state: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          first_boot_completed?: boolean | null
          id?: string
          installation_date?: string | null
          last_maintenance?: string | null
          latitude?: number | null
          longitude?: number | null
          machine_mode?: Database["public"]["Enums"]["machine_mode"] | null
          machine_model?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name: string
          pin_code: string
          serial_number?: string | null
          setup_completed_at?: string | null
          state: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          first_boot_completed?: boolean | null
          id?: string
          installation_date?: string | null
          last_maintenance?: string | null
          latitude?: number | null
          longitude?: number | null
          machine_mode?: Database["public"]["Enums"]["machine_mode"] | null
          machine_model?: string | null
          manager_email?: string | null
          manager_name?: string | null
          manager_phone?: string | null
          name?: string
          pin_code?: string
          serial_number?: string | null
          setup_completed_at?: string | null
          state?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: Json
      }
      assign_machine_admin_role: {
        Args: { p_user_id: string; p_venue_id: string; p_granted_by?: string }
        Returns: Json
      }
      create_machine_admin_invitation: {
        Args: { p_email: string; p_venue_id: string; p_invited_by: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
          _venue_id?: string
        }
        Returns: boolean
      }
      has_simplified_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["simplified_user_role"]
          _venue_id?: string
        }
        Returns: boolean
      }
      initialize_machine_setup: {
        Args: { p_serial_number: string; p_model?: string }
        Returns: Json
      }
      update_setup_progress: {
        Args: {
          p_serial_number: string
          p_status: Database["public"]["Enums"]["setup_status"]
          p_step_data?: Json
        }
        Returns: Json
      }
      validate_machine_auth: {
        Args: {
          p_venue_id: string
          p_product_key: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      validate_setup_token: {
        Args: { p_token: string }
        Returns: Json
      }
    }
    Enums: {
      machine_mode: "setup" | "customer" | "admin"
      setup_status:
        | "not_started"
        | "network_configured"
        | "machine_registered"
        | "owner_setup"
        | "system_configured"
        | "completed"
      simplified_user_role: "super_admin" | "machine_admin"
      user_role: "super_admin" | "admin" | "machine_admin" | "setup_user"
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
    Enums: {
      machine_mode: ["setup", "customer", "admin"],
      setup_status: [
        "not_started",
        "network_configured",
        "machine_registered",
        "owner_setup",
        "system_configured",
        "completed",
      ],
      simplified_user_role: ["super_admin", "machine_admin"],
      user_role: ["super_admin", "admin", "machine_admin", "setup_user"],
    },
  },
} as const
