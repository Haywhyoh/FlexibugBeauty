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
      appointments: {
        Row: {
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          end_time: string
          follow_up_sent: boolean | null
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          professional_id: string
          reminder_sent_24h: boolean | null
          reminder_sent_2h: boolean | null
          service_id: string
          start_time: string
          status: string | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          end_time: string
          follow_up_sent?: boolean | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          professional_id: string
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          service_id: string
          start_time: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          end_time?: string
          follow_up_sent?: boolean | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          professional_id?: string
          reminder_sent_24h?: boolean | null
          reminder_sent_2h?: boolean | null
          service_id?: string
          start_time?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          professional_id: string
          start_time: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          professional_id: string
          start_time: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          professional_id?: string
          start_time?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          client_since: string
          created_at: string
          id: string
          last_appointment_date: string | null
          notes: string | null
          original_lead_id: string | null
          preferences: Json | null
          professional_id: string
          total_appointments: number | null
          total_spent: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_since?: string
          created_at?: string
          id?: string
          last_appointment_date?: string | null
          notes?: string | null
          original_lead_id?: string | null
          preferences?: Json | null
          professional_id: string
          total_appointments?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_since?: string
          created_at?: string
          id?: string
          last_appointment_date?: string | null
          notes?: string | null
          original_lead_id?: string | null
          preferences?: Json | null
          professional_id?: string
          total_appointments?: number | null
          total_spent?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_original_lead_id_fkey"
            columns: ["original_lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          client_id: string
          created_at: string
          id: string
          last_message_at: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_notification_settings: {
        Row: {
          confirmation_enabled: boolean | null
          created_at: string
          custom_confirmation_message: string | null
          custom_follow_up_message: string | null
          custom_reminder_message: string | null
          follow_up_enabled: boolean | null
          id: string
          professional_id: string
          reminder_24h_enabled: boolean | null
          reminder_2h_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          confirmation_enabled?: boolean | null
          created_at?: string
          custom_confirmation_message?: string | null
          custom_follow_up_message?: string | null
          custom_reminder_message?: string | null
          follow_up_enabled?: boolean | null
          id?: string
          professional_id: string
          reminder_24h_enabled?: boolean | null
          reminder_2h_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          confirmation_enabled?: boolean | null
          created_at?: string
          custom_confirmation_message?: string | null
          custom_follow_up_message?: string | null
          custom_reminder_message?: string | null
          follow_up_enabled?: boolean | null
          id?: string
          professional_id?: string
          reminder_24h_enabled?: boolean | null
          reminder_2h_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      follow_up_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          is_completed: boolean | null
          lead_id: string
          priority: string | null
          professional_id: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean | null
          lead_id: string
          priority?: string | null
          professional_id: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean | null
          lead_id?: string
          priority?: string | null
          professional_id?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_up_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          is_system_template: boolean | null
          name: string
          template_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields: Json
          id?: string
          is_system_template?: boolean | null
          name: string
          template_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_system_template?: boolean | null
          name?: string
          template_type?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string
          id: string
          lead_id: string
          notes: string | null
          professional_id: string
          updated_at: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
          professional_id: string
          updated_at?: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
          professional_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_forms: {
        Row: {
          branding: Json | null
          created_at: string
          description: string | null
          embed_code: string | null
          fields: Json
          id: string
          is_active: boolean | null
          professional_id: string
          title: string
          updated_at: string
        }
        Insert: {
          branding?: Json | null
          created_at?: string
          description?: string | null
          embed_code?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          professional_id: string
          title: string
          updated_at?: string
        }
        Update: {
          branding?: Json | null
          created_at?: string
          description?: string | null
          embed_code?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          professional_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          conversion_date: string | null
          converted_to_user_id: string | null
          created_at: string
          data: Json
          follow_up_date: string | null
          form_id: string
          id: string
          invitation_sent_at: string | null
          invitation_token: string | null
          last_contact_date: string | null
          lead_source: string | null
          notes: string | null
          professional_id: string
          score: string | null
          status: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          conversion_date?: string | null
          converted_to_user_id?: string | null
          created_at?: string
          data: Json
          follow_up_date?: string | null
          form_id: string
          id?: string
          invitation_sent_at?: string | null
          invitation_token?: string | null
          last_contact_date?: string | null
          lead_source?: string | null
          notes?: string | null
          professional_id: string
          score?: string | null
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          conversion_date?: string | null
          converted_to_user_id?: string | null
          created_at?: string
          data?: Json
          follow_up_date?: string | null
          form_id?: string
          id?: string
          invitation_sent_at?: string | null
          invitation_token?: string | null
          last_contact_date?: string | null
          lead_source?: string | null
          notes?: string | null
          professional_id?: string
          score?: string | null
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "lead_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_featured: boolean | null
          sort_order: number | null
          specialty_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_featured?: boolean | null
          sort_order?: number | null
          specialty_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_featured?: boolean | null
          sort_order?: number | null
          specialty_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          business_slug: string | null
          created_at: string
          email: string | null
          facebook_handle: string | null
          first_name: string | null
          full_name: string | null
          id: string
          instagram_handle: string | null
          is_profile_public: boolean | null
          last_name: string | null
          location: string | null
          phone: string | null
          tiktok_handle: string | null
          updated_at: string
          user_type: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_slug?: string | null
          created_at?: string
          email?: string | null
          facebook_handle?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          instagram_handle?: string | null
          is_profile_public?: boolean | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          tiktok_handle?: string | null
          updated_at?: string
          user_type?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          business_slug?: string | null
          created_at?: string
          email?: string | null
          facebook_handle?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          instagram_handle?: string | null
          is_profile_public?: boolean | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          tiktok_handle?: string | null
          updated_at?: string
          user_type?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          specialty_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          specialty_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          specialty_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          id: string
          professional_id: string
          start_time: string
          title: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          professional_id: string
          start_time: string
          title?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          professional_id?: string
          start_time?: string
          title?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_score: {
        Args: { lead_data: Json; form_fields: Json }
        Returns: string
      }
      create_lead_with_task: {
        Args: {
          p_form_id: string
          p_professional_id: string
          p_data: Json
          p_score: string
        }
        Returns: string
      }
      generate_business_slug: {
        Args: { business_name_input: string }
        Returns: string
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
