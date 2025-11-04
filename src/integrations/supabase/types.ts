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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      "audit/admin_logs": {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"] | null
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          status: Database["public"]["Enums"]["audit/admin status"] | null
          target_id: string | null
          target_table: string | null
          user_agent: string | null
        }
        Insert: {
          action_type?: Database["public"]["Enums"]["action_type"] | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          status?: Database["public"]["Enums"]["audit/admin status"] | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"] | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          status?: Database["public"]["Enums"]["audit/admin status"] | null
          target_id?: string | null
          target_table?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      campaign_updates: {
        Row: {
          campaign_id: string
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          campaign_id: string
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          campaign_id?: string
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_updates_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          campaign_organizers: string | null
          campaign_status: Database["public"]["Enums"]["campaign_status"] | null
          category: string
          created_at: string | null
          current_amount: number | null
          description: string
          end_date: string | null
          goal_amount: number
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          rejection_reason: string | null
          story: string
          title: string
          updated_at: string | null
          user_id: string
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          video_url: string | null
          visibility: Database["public"]["Enums"]["visibility"] | null
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          campaign_organizers?: string | null
          campaign_status?:
            | Database["public"]["Enums"]["campaign_status"]
            | null
          category: string
          created_at?: string | null
          current_amount?: number | null
          description: string
          end_date?: string | null
          goal_amount: number
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          rejection_reason?: string | null
          story: string
          title: string
          updated_at?: string | null
          user_id: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          video_url?: string | null
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          campaign_organizers?: string | null
          campaign_status?:
            | Database["public"]["Enums"]["campaign_status"]
            | null
          category?: string
          created_at?: string | null
          current_amount?: number | null
          description?: string
          end_date?: string | null
          goal_amount?: number
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          rejection_reason?: string | null
          story?: string
          title?: string
          updated_at?: string | null
          user_id?: string
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          video_url?: string | null
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          status: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      chat_faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          question: string
          updated_at: string | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          question: string
          updated_at?: string | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          campaign_id: string | null
          content: string | null
          created_at: string | null
          id: string
          likes_count: number | null
          media_url: string | null
          parent_id: string | null
          status: Database["public"]["Enums"]["comment_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_url?: string | null
          parent_id?: string | null
          status?: Database["public"]["Enums"]["comment_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_url?: string | null
          parent_id?: string | null
          status?: Database["public"]["Enums"]["comment_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string | null
          donor_id: string | null
          donor_message: string | null
          id: string
          is_anonymous: boolean | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string | null
          donor_id?: string | null
          donor_message?: string | null
          id?: string
          is_anonymous?: boolean | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_reference: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string | null
          donor_id?: string | null
          donor_message?: string | null
          id?: string
          is_anonymous?: boolean | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_reference?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_engagement_events: {
        Row: {
          amount: number | null
          campaign_id: string | null
          created_at: string | null
          donor_id: string | null
          engagement_type: Database["public"]["Enums"]["engagement_type"] | null
          id: string
          metadata: Json | null
          streak_count: number | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          engagement_type?:
            | Database["public"]["Enums"]["engagement_type"]
            | null
          id?: string
          metadata?: Json | null
          streak_count?: number | null
        }
        Update: {
          amount?: number | null
          campaign_id?: string | null
          created_at?: string | null
          donor_id?: string | null
          engagement_type?:
            | Database["public"]["Enums"]["engagement_type"]
            | null
          id?: string
          metadata?: Json | null
          streak_count?: number | null
        }
        Relationships: []
      }
      donor_engagement_summary: {
        Row: {
          campaigns_supported: number | null
          donor_id: string | null
          engagement_score: number | null
          id: string
          last_donation_at: string | null
          streak_days: number | null
          total_amount: number | null
          total_donations: number | null
          updated_at: string | null
        }
        Insert: {
          campaigns_supported?: number | null
          donor_id?: string | null
          engagement_score?: number | null
          id?: string
          last_donation_at?: string | null
          streak_days?: number | null
          total_amount?: number | null
          total_donations?: number | null
          updated_at?: string | null
        }
        Update: {
          campaigns_supported?: number | null
          donor_id?: string | null
          engagement_score?: number | null
          id?: string
          last_donation_at?: string | null
          streak_days?: number | null
          total_amount?: number | null
          total_donations?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          delivery_channel: Database["public"]["Enums"]["channel_type"] | null
          id: string
          is_read: boolean | null
          message: string | null
          metadata: Json | null
          read_at: string | null
          title: string | null
          type: Database["public"]["Enums"]["notifications_type"] | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          delivery_channel?: Database["public"]["Enums"]["channel_type"] | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notifications_type"] | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          delivery_channel?: Database["public"]["Enums"]["channel_type"] | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["notifications_type"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      "payment logs": {
        Row: {
          amount: number | null
          campaign_id: string | null
          confirmed_at: string | null
          donation_id: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          processed_at: string | null
          response_payload: Json | null
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          campaign_id?: string | null
          confirmed_at?: string | null
          donation_id?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          processed_at?: string | null
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          campaign_id?: string | null
          confirmed_at?: string | null
          donation_id?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          processed_at?: string | null
          response_payload?: Json | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      "reports/flags": {
        Row: {
          action_taken: string | null
          admin_id: string | null
          campaign_id: string | null
          created_at: string | null
          details: string | null
          id: string
          reason: Database["public"]["Enums"]["reason_type"] | null
          reported_id: string | null
          reported_type: Database["public"]["Enums"]["reported_type"][] | null
          reporter_id: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          admin_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["reason_type"] | null
          reported_id?: string | null
          reported_type?: Database["public"]["Enums"]["reported_type"][] | null
          reporter_id?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          admin_id?: string | null
          campaign_id?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: Database["public"]["Enums"]["reason_type"] | null
          reported_id?: string | null
          reported_type?: Database["public"]["Enums"]["reported_type"][] | null
          reporter_id?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          wallet_balance: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          wallet_balance?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          wallet_balance?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_user_ids: {
        Args: never
        Returns: {
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_amount: {
        Args: { amount_to_add: number; campaign_id: string }
        Returns: undefined
      }
    }
    Enums: {
      action_type:
        | "create"
        | "update"
        | "delete"
        | "login"
        | "logout"
        | "suspend_user"
        | "approve_campaign"
        | "reject_campaign"
        | "refund_payment"
        | "system_event"
        | "cron_job"
        | "payment_gateway_error"
        | "security_alert"
      app_role: "admin" | "moderator" | "user"
      "audit/admin status": "success" | "failed"
      campaign_status: "draft" | "active" | "paused" | "completed" | "rejected"
      channel_type: "in_app" | "email" | "sms" | "push"
      comment_status: "edited" | "active" | "deleted" | "flagged"
      engagement_type:
        | "donation"
        | "share"
        | "comment"
        | "visit"
        | "like"
        | "view"
        | "follow"
      notifications_type:
        | "donation_received"
        | "campaign_update"
        | "goal_reached"
        | "comment"
        | "admin_alert"
        | "system"
      payment_method: "mpesa" | "paypal" | "card"
      payment_status:
        | "pending"
        | "completed"
        | "failed"
        | "refunded"
        | "chargeback"
        | "successful"
      reason_type: "spam" | "fraud" | "offensive" | "misleading" | "other"
      report_status: "pending" | "reviewed" | "action_taken" | "dismissed"
      reported_type: "user" | "campaign" | "comment" | "donation"
      reports_status: "pending" | "reviewed" | "action_taken" | "dismissed"
      user_role: "user" | "admin" | "campaigner" | "donor"
      verification_status: "pending" | "verified" | "rejected" | "unverified"
      visibility: "members" | "private" | "public"
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
      action_type: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "suspend_user",
        "approve_campaign",
        "reject_campaign",
        "refund_payment",
        "system_event",
        "cron_job",
        "payment_gateway_error",
        "security_alert",
      ],
      app_role: ["admin", "moderator", "user"],
      "audit/admin status": ["success", "failed"],
      campaign_status: ["draft", "active", "paused", "completed", "rejected"],
      channel_type: ["in_app", "email", "sms", "push"],
      comment_status: ["edited", "active", "deleted", "flagged"],
      engagement_type: [
        "donation",
        "share",
        "comment",
        "visit",
        "like",
        "view",
        "follow",
      ],
      notifications_type: [
        "donation_received",
        "campaign_update",
        "goal_reached",
        "comment",
        "admin_alert",
        "system",
      ],
      payment_method: ["mpesa", "paypal", "card"],
      payment_status: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "chargeback",
        "successful",
      ],
      reason_type: ["spam", "fraud", "offensive", "misleading", "other"],
      report_status: ["pending", "reviewed", "action_taken", "dismissed"],
      reported_type: ["user", "campaign", "comment", "donation"],
      reports_status: ["pending", "reviewed", "action_taken", "dismissed"],
      user_role: ["user", "admin", "campaigner", "donor"],
      verification_status: ["pending", "verified", "rejected", "unverified"],
      visibility: ["members", "private", "public"],
    },
  },
} as const
