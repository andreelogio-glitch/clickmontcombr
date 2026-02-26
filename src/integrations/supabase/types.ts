export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_training_data: {
        Row: {
          address_region: string | null
          bid_amount: number | null
          brand: string | null
          created_at: string
          final_amount: number | null
          furniture_type: string | null
          id: string
          order_id: string | null
          resolution_type: string | null
          service_type: string | null
        }
        Insert: {
          address_region?: string | null
          bid_amount?: number | null
          brand?: string | null
          created_at?: string
          final_amount?: number | null
          furniture_type?: string | null
          id?: string
          order_id?: string | null
          resolution_type?: string | null
          service_type?: string | null
        }
        Update: {
          address_region?: string | null
          bid_amount?: number | null
          brand?: string | null
          created_at?: string
          final_amount?: number | null
          furniture_type?: string | null
          id?: string
          order_id?: string | null
          resolution_type?: string | null
          service_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_data_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          accepted: boolean | null
          amount: number
          created_at: string
          id: string
          message: string | null
          montador_id: string
          order_id: string
        }
        Insert: {
          accepted?: boolean | null
          amount: number
          created_at?: string
          id?: string
          message?: string | null
          montador_id: string
          order_id: string
        }
        Update: {
          accepted?: boolean | null
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          montador_id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_preset: boolean
          message: string
          order_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_preset?: boolean
          message: string
          order_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_preset?: boolean
          message?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          brand: string | null
          city: string | null
          client_id: string
          code_validated: boolean | null
          created_at: string
          description: string
          furniture_type: string
          id: string
          is_urgent: boolean
          montador_arrived: boolean | null
          needs_wall_mount: boolean
          photo_url: string | null
          service_type: string
          started_at: string | null
          status: string
          title: string
          verification_code: string | null
        }
        Insert: {
          address: string
          brand?: string | null
          city?: string | null
          client_id: string
          code_validated?: boolean | null
          created_at?: string
          description: string
          furniture_type: string
          id?: string
          is_urgent?: boolean
          montador_arrived?: boolean | null
          needs_wall_mount?: boolean
          photo_url?: string | null
          service_type?: string
          started_at?: string | null
          status?: string
          title: string
          verification_code?: string | null
        }
        Update: {
          address?: string
          brand?: string | null
          city?: string | null
          client_id?: string
          code_validated?: boolean | null
          created_at?: string
          description?: string
          furniture_type?: string
          id?: string
          is_urgent?: boolean
          montador_arrived?: boolean | null
          needs_wall_mount?: boolean
          photo_url?: string | null
          service_type?: string
          started_at?: string | null
          status?: string
          title?: string
          verification_code?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          document_url: string | null
          experience_proof_url: string | null
          full_name: string
          id: string
          is_approved: boolean
          is_verified: boolean
          lgpd_accepted_at: string | null
          phone: string | null
          pix_key: string | null
          role: string
          selfie_url: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          document_url?: string | null
          experience_proof_url?: string | null
          full_name: string
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          lgpd_accepted_at?: string | null
          phone?: string | null
          pix_key?: string | null
          role?: string
          selfie_url?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          document_url?: string | null
          experience_proof_url?: string | null
          full_name?: string
          id?: string
          is_approved?: boolean
          is_verified?: boolean
          lgpd_accepted_at?: string | null
          phone?: string | null
          pix_key?: string | null
          role?: string
          selfie_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          opened_by: string
          order_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          opened_by: string
          order_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          opened_by?: string
          order_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          media_url: string | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_url?: string | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_url?: string | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          montador_id: string
          order_id: string | null
          status: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          montador_id: string
          order_id?: string | null
          status?: string
          type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          montador_id?: string
          order_id?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
