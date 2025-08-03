export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: number
          new_value: string | null
          old_value: string | null
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: number
          new_value?: string | null
          old_value?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      admin_stats_cache: {
        Row: {
          id: number
          stats: Json
          updated_at: string | null
        }
        Insert: {
          id?: number
          stats: Json
          updated_at?: string | null
        }
        Update: {
          id?: number
          stats?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: number
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          edited_at: string | null
          edited_by: string | null
          id: number
          image_url: string | null
          is_admin: boolean
          is_deleted: boolean | null
          message: string
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          chat_id: number
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          edited_by?: string | null
          id?: number
          image_url?: string | null
          is_admin?: boolean
          is_deleted?: boolean | null
          message: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          chat_id?: number
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          edited_at?: string | null
          edited_by?: string | null
          id?: number
          image_url?: string | null
          is_admin?: boolean
          is_deleted?: boolean | null
          message?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "support_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          date: string
          due_date: string | null
          id: number
          note: string | null
          payment_method: string | null
          plan_id: number | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          date?: string
          due_date?: string | null
          id?: never
          note?: string | null
          payment_method?: string | null
          plan_id?: number | null
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          date?: string
          due_date?: string | null
          id?: never
          note?: string | null
          payment_method?: string | null
          plan_id?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_replies: {
        Row: {
          created_at: string | null
          id: number
          notification_id: number
          reply_message: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          notification_id: number
          reply_message: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          notification_id?: number
          reply_message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_replies_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          notification_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message: string
          notification_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          is_read?: boolean | null
          message?: string
          notification_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_requests: {
        Row: {
          created_at: string
          email: string
          id: number
          ip_address: string | null
          notes: string | null
          processed_at: string | null
          request_type: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          ip_address?: string | null
          notes?: string | null
          processed_at?: string | null
          request_type?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          ip_address?: string | null
          notes?: string | null
          processed_at?: string | null
          request_type?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          description: string | null
          id: number
          is_active: boolean | null
          name: string
          price: number
          speed: string
        }
        Insert: {
          description?: string | null
          id?: never
          is_active?: boolean | null
          name: string
          price: number
          speed: string
        }
        Update: {
          description?: string | null
          id?: never
          is_active?: boolean | null
          name?: string
          price?: number
          speed?: string
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: number
          installation_location: string | null
          name: string
          phone: string
          plan_id: number | null
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: never
          installation_location?: string | null
          name: string
          phone: string
          plan_id?: number | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: never
          installation_location?: string | null
          name?: string
          phone?: string
          plan_id?: number | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: number
          monthly_price: number
          plan_id: number | null
          start_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: never
          monthly_price?: number
          plan_id?: number | null
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: never
          monthly_price?: number
          plan_id?: number | null
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_chats: {
        Row: {
          admin_assigned: string | null
          closed_at: string | null
          created_at: string | null
          id: number
          priority: string | null
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_assigned?: string | null
          closed_at?: string | null
          created_at?: string | null
          id?: number
          priority?: string | null
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_assigned?: string | null
          closed_at?: string | null
          created_at?: string | null
          id?: number
          priority?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          action_url: string | null
          admin_response: string | null
          created_at: string | null
          id: number
          is_read: boolean | null
          message: string
          notification_type: string
          priority: string | null
          processed_at: string | null
          processed_by: string | null
          request_details: Json | null
          request_id: number | null
          request_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          admin_response?: string | null
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message: string
          notification_type: string
          priority?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_details?: Json | null
          request_id?: number | null
          request_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          admin_response?: string | null
          created_at?: string | null
          id?: number
          is_read?: boolean | null
          message?: string
          notification_type?: string
          priority?: string | null
          processed_at?: string | null
          processed_by?: string | null
          request_details?: Json | null
          request_id?: number | null
          request_type?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_requests: {
        Row: {
          admin_response: string | null
          created_at: string | null
          description: string
          feedback: string | null
          id: number
          priority: string | null
          rating: number | null
          request_type: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          description: string
          feedback?: string | null
          id?: number
          priority?: string | null
          rating?: number | null
          request_type: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          description?: string
          feedback?: string | null
          id?: number
          priority?: string | null
          rating?: number | null
          request_type?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_verified: boolean | null
          last_login: string | null
          latitude: number | null
          location_notes: string | null
          longitude: number | null
          password: string | null
          phone: string | null
          username: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          latitude?: number | null
          location_notes?: string | null
          longitude?: number | null
          password?: string | null
          phone?: string | null
          username: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_verified?: boolean | null
          last_login?: string | null
          latitude?: number | null
          location_notes?: string | null
          longitude?: number | null
          password?: string | null
          phone?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_closed_chats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_test_users_secure: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          active_subscriptions: number
          pending_invoices: number
          total_revenue: number
          pending_requests: number
          average_rating: number
          open_chats: number
        }[]
      }
      get_current_user_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      log_password_reset_request: {
        Args: {
          request_email: string
          request_ip?: string
          request_user_agent?: string
        }
        Returns: undefined
      }
      mark_password_reset_completed: {
        Args: { reset_email: string }
        Returns: undefined
      }
      migrate_requests_to_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_admin_stats_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_password: {
        Args: { input_password: string; stored_password: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
