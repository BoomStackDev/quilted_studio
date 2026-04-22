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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      affiliated_clicks: {
        Row: {
          clicked_at: string | null
          course_id: string
          creator_id: string
          id: string
          ip_hash: string | null
          link_id: string
          student_id: string | null
          user_agent: string | null
        }
        Insert: {
          clicked_at?: string | null
          course_id: string
          creator_id: string
          id?: string
          ip_hash?: string | null
          link_id: string
          student_id?: string | null
          user_agent?: string | null
        }
        Update: {
          clicked_at?: string | null
          course_id?: string
          creator_id?: string
          id?: string
          ip_hash?: string | null
          link_id?: string
          student_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliated_clicks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliated_clicks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliated_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "affiliated_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliated_clicks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliated_links: {
        Row: {
          course_id: string
          created_at: string | null
          destination_url: string
          id: string
          is_healthy: boolean | null
          last_checked_at: string | null
          slug: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          destination_url: string
          id?: string
          is_healthy?: boolean | null
          last_checked_at?: string | null
          slug: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          destination_url?: string
          id?: string
          is_healthy?: boolean | null
          last_checked_at?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliated_links_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tags: {
        Row: {
          course_id: string
          tag_id: string
        }
        Insert: {
          course_id: string
          tag_id: string
        }
        Update: {
          course_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tags_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "specialty_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          course_type: string
          created_at: string | null
          creator_id: string
          delivery_mode: string | null
          description: string | null
          external_url: string | null
          id: string
          level: string | null
          price: number | null
          published: boolean | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          tagline: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_type: string
          created_at?: string | null
          creator_id: string
          delivery_mode?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          level?: string | null
          price?: number | null
          published?: boolean | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tagline?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_type?: string
          created_at?: string | null
          creator_id?: string
          delivery_mode?: string | null
          description?: string | null
          external_url?: string | null
          id?: string
          level?: string | null
          price?: number | null
          published?: boolean | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          tagline?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_applications: {
        Row: {
          admin_notes: string | null
          email: string
          id: string
          name: string
          primary_platform: string | null
          referral_source: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string | null
          youtube_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          email: string
          id?: string
          name: string
          primary_platform?: string | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          email?: string
          id?: string
          name?: string
          primary_platform?: string | null
          referral_source?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_tags: {
        Row: {
          creator_id: string
          tag_id: string
        }
        Insert: {
          creator_id: string
          tag_id: string
        }
        Update: {
          creator_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_tags_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "specialty_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_videos: {
        Row: {
          created_at: string | null
          creator_id: string
          id: string
          level: string | null
          position: number | null
          tag_id: string | null
          thumbnail_url: string | null
          title: string | null
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          id?: string
          level?: string | null
          position?: number | null
          tag_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          youtube_id: string
          youtube_url: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          id?: string
          level?: string | null
          position?: number | null
          tag_id?: string | null
          thumbnail_url?: string | null
          title?: string | null
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_videos_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "specialty_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      creators: {
        Row: {
          admin_notes: string | null
          badge: string | null
          bio: string | null
          confirmed_commission: boolean | null
          created_at: string | null
          creator_type: string
          display_name: string | null
          feedback_for_creator: string | null
          id: string
          instagram_url: string | null
          photo_url: string | null
          published: boolean | null
          status: string
          stripe_account_id: string | null
          stripe_onboarded: boolean | null
          tagline: string | null
          updated_at: string | null
          website_url: string | null
          youtube_subscriber_count: number | null
          youtube_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          badge?: string | null
          bio?: string | null
          confirmed_commission?: boolean | null
          created_at?: string | null
          creator_type?: string
          display_name?: string | null
          feedback_for_creator?: string | null
          id: string
          instagram_url?: string | null
          photo_url?: string | null
          published?: boolean | null
          status?: string
          stripe_account_id?: string | null
          stripe_onboarded?: boolean | null
          tagline?: string | null
          updated_at?: string | null
          website_url?: string | null
          youtube_subscriber_count?: number | null
          youtube_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          badge?: string | null
          bio?: string | null
          confirmed_commission?: boolean | null
          created_at?: string | null
          creator_type?: string
          display_name?: string | null
          feedback_for_creator?: string | null
          id?: string
          instagram_url?: string | null
          photo_url?: string | null
          published?: boolean | null
          status?: string
          stripe_account_id?: string | null
          stripe_onboarded?: boolean | null
          tagline?: string | null
          updated_at?: string | null
          website_url?: string | null
          youtube_subscriber_count?: number | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          amount_paid: number | null
          course_id: string
          creator_payout: number | null
          enrolled_at: string | null
          id: string
          platform_fee: number | null
          stripe_charge_id: string | null
          stripe_payment_intent: string | null
          student_id: string
        }
        Insert: {
          amount_paid?: number | null
          course_id: string
          creator_payout?: number | null
          enrolled_at?: string | null
          id?: string
          platform_fee?: number | null
          stripe_charge_id?: string | null
          stripe_payment_intent?: string | null
          student_id: string
        }
        Update: {
          amount_paid?: number | null
          course_id?: string
          creator_payout?: number | null
          enrolled_at?: string | null
          id?: string
          platform_fee?: number | null
          stripe_charge_id?: string | null
          stripe_payment_intent?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id: string
          student_id: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          cloudflare_video_id: string | null
          course_id: string
          created_at: string | null
          drip_days: number | null
          id: string
          pdf_storage_path: string | null
          position: number
          title: string
        }
        Insert: {
          cloudflare_video_id?: string | null
          course_id: string
          created_at?: string | null
          drip_days?: number | null
          id?: string
          pdf_storage_path?: string | null
          position: number
          title: string
        }
        Update: {
          cloudflare_video_id?: string | null
          course_id?: string
          created_at?: string | null
          drip_days?: number | null
          id?: string
          pdf_storage_path?: string | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      specialty_tags: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          id: string
          level: string
          name: string
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          id?: string
          level: string
          name: string
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          id?: string
          level?: string
          name?: string
        }
        Relationships: []
      }
      student_affiliated_courses: {
        Row: {
          course_id: string
          id: string
          saved_at: string | null
          student_id: string
        }
        Insert: {
          course_id: string
          id?: string
          saved_at?: string | null
          student_id: string
        }
        Update: {
          course_id?: string
          id?: string
          saved_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_affiliated_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_affiliated_courses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          active: boolean | null
          author_name: string
          author_platform: string | null
          content: string
          created_at: string | null
          creator_id: string
          display_order: number | null
          id: string
        }
        Insert: {
          active?: boolean | null
          author_name: string
          author_platform?: string | null
          content: string
          created_at?: string | null
          creator_id: string
          display_order?: number | null
          id?: string
        }
        Update: {
          active?: boolean | null
          author_name?: string
          author_platform?: string | null
          content?: string
          created_at?: string | null
          creator_id?: string
          display_order?: number | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
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
