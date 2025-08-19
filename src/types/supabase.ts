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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      assessment_assignments: {
        Row: {
          assessment_id: string
          class_id: string | null
          created_at: string | null
          created_by: string | null
          due_at: string | null
          id: string
          opens_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_id: string
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_at?: string | null
          id?: string
          opens_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string
          class_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_at?: string | null
          id?: string
          opens_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_assignments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      class_invites: {
        Row: {
          active: boolean
          class_id: string
          code: string
          created_at: string | null
          created_by: string
          expires_at: string
          revoked_at: string | null
          role: string
          usage_count: number
          usage_limit: number
        }
        Insert: {
          active?: boolean
          class_id: string
          code: string
          created_at?: string | null
          created_by: string
          expires_at?: string
          revoked_at?: string | null
          role?: string
          usage_count?: number
          usage_limit?: number
        }
        Update: {
          active?: boolean
          class_id?: string
          code?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string
          revoked_at?: string | null
          role?: string
          usage_count?: number
          usage_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "class_invites_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          role: string
          user_id: string
        }
        Insert: {
          class_id: string
          role?: string
          user_id: string
        }
        Update: {
          class_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          id: string
          level: string | null
          name: string
          owner_id: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: string | null
          name: string
          owner_id: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string | null
          name?: string
          owner_id?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_owner_fk"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_profiles: {
        Row: {
          created_at: string | null
          id: number
          improvement_areas: string[] | null
          level: string | null
          scores: Json | null
          strengths: string[] | null
          summary: string | null
          top_goals: string[] | null
          track: string | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          improvement_areas?: string[] | null
          level?: string | null
          scores?: Json | null
          strengths?: string[] | null
          summary?: string | null
          top_goals?: string[] | null
          track?: string | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          created_at?: string | null
          id?: number
          improvement_areas?: string[] | null
          level?: string | null
          scores?: Json | null
          strengths?: string[] | null
          summary?: string | null
          top_goals?: string[] | null
          track?: string | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          class_id: string | null
          content: Json | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          teacher_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          teacher_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          teacher_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          password_changed: boolean
          role: string
          track: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          last_name?: string | null
          password_changed?: boolean
          role?: string
          track?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          password_changed?: boolean
          role?: string
          track?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      progress_tracking: {
        Row: {
          assessment_id: string | null
          class_id: string
          completion_percentage: number | null
          created_at: string | null
          id: string
          last_activity: string | null
          lesson_id: string | null
          student_id: string
        }
        Insert: {
          assessment_id?: string | null
          class_id: string
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          lesson_id?: string | null
          student_id: string
        }
        Update: {
          assessment_id?: string | null
          class_id?: string
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          last_activity?: string | null
          lesson_id?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_tracking_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_tracking_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_tracking_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_tracking_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_invites: {
        Row: {
          assigns_class: string | null
          code: string
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          status: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          assigns_class?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          status?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          assigns_class?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          status?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_invites_assigns_class_fkey"
            columns: ["assigns_class"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_invites_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_submissions: {
        Row: {
          answer_text: string | null
          assessment_assignment_id: string
          assignment_id: string | null
          content: Json | null
          created_by: string | null
          feedback: string | null
          id: string
          score: number | null
          status: string | null
          student_id: string
          submission_file_path: string | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          answer_text?: string | null
          assessment_assignment_id: string
          assignment_id?: string | null
          content?: Json | null
          created_by?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          status?: string | null
          student_id: string
          submission_file_path?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          answer_text?: string | null
          assessment_assignment_id?: string
          assignment_id?: string | null
          content?: Json | null
          created_by?: string | null
          feedback?: string | null
          id?: string
          score?: number | null
          status?: string | null
          student_id?: string
          submission_file_path?: string | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_assessment_assignment_id_fkey"
            columns: ["assessment_assignment_id"]
            isOneToOne: false
            referencedRelation: "assessment_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assessment_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      superadmin_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean
          one_time: boolean
          used_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          one_time?: boolean
          used_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          one_time?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
      superadmins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      survey_questions: {
        Row: {
          active: boolean | null
          code: string | null
          created_at: string | null
          id: string
          options: string[] | null
          required: boolean | null
          section: string | null
          text: string
          track: string | null
          type: string
          weight: number | null
        }
        Insert: {
          active?: boolean | null
          code?: string | null
          created_at?: string | null
          id?: string
          options?: string[] | null
          required?: boolean | null
          section?: string | null
          text: string
          track?: string | null
          type: string
          weight?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string | null
          created_at?: string | null
          id?: string
          options?: string[] | null
          required?: boolean | null
          section?: string | null
          text?: string
          track?: string | null
          type?: string
          weight?: number | null
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          answer: string
          created_at: string | null
          id: number
          question_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: number
          question_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: number
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_credentials: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invite_code: string | null
          is_used: boolean
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_code?: string | null
          is_used?: boolean
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_code?: string | null
          is_used?: boolean
          used_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      esp_profiles_latest: {
        Row: {
          created_at: string | null
          id: number | null
          improvement_areas: string[] | null
          level: string | null
          scores: Json | null
          strengths: string[] | null
          summary: string | null
          top_goals: string[] | null
          track: string | null
          user_id: string | null
          weaknesses: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      _gen_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      admin_set_role: {
        Args: { new_role: string; target_user: string }
        Returns: undefined
      }
      create_class_invite: {
        Args:
          | { p_class_id: string; p_expires_at?: string; p_max_uses?: number }
          | {
              p_class_id: string
              p_expires_at?: string
              p_usage_limit?: number
            }
        Returns: {
          active: boolean
          class_id: string
          code: string
          created_at: string | null
          created_by: string
          expires_at: string
          revoked_at: string | null
          role: string
          usage_count: number
          usage_limit: number
        }
      }
      current_app_role: {
        Args: { uid?: string }
        Returns: string
      }
      grade_submission: {
        Args: {
          p_feedback: string
          p_score: number
          p_status: string
          p_submission_id: string
        }
        Returns: undefined
      }
      has_role: {
        Args: { r: string; uid?: string }
        Returns: boolean
      }
      is_student: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_superadmin: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_superadmin_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_superadmin0: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher: {
        Args: { uid?: string }
        Returns: boolean
      }
      mark_teacher_invite_used: {
        Args: { p_invite_id: string }
        Returns: undefined
      }
      random_code: {
        Args: { n?: number }
        Returns: string
      }
      redeem_class_invite: {
        Args: { p_code: string }
        Returns: {
          class_id: string
          role: string
          user_id: string
        }
      }
      remove_student_from_class: {
        Args: { class_id_input: string; student_id_input: string }
        Returns: undefined
      }
      revoke_class_invite: {
        Args: { p_code: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { new_role: string; target_email: string }
        Returns: undefined
      }
      use_student_invite: {
        Args: { invite_code_input: string; user_id_input: string }
        Returns: undefined
      }
      validate_invite_code: {
        Args: { code_input: string }
        Returns: {
          code: string
          expires_at: string
          id: string
          status: string
        }[]
      }
      validate_superadmin_code: {
        Args: { p_code: string }
        Returns: {
          ok: boolean
          the_id: string
        }[]
      }
      validate_teacher_invite: {
        Args: { p_code: string; p_email: string }
        Returns: {
          expires_at: string
          invite_id: string
          ok: boolean
        }[]
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
