export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "13.0.4";
	};
	public: {
		Tables: {
			assessment_assignments: {
				Row: {
					assessment_id: string;
					class_id: string | null;
					created_at: string | null;
					created_by: string | null;
					due_at: string | null;
					id: string;
					opens_at: string | null;
					user_id: string | null;
				};
				Insert: {
					assessment_id: string;
					class_id?: string | null;
					created_at?: string | null;
					created_by?: string | null;
					due_at?: string | null;
					id?: string;
					opens_at?: string | null;
					user_id?: string | null;
				};
				Update: {
					assessment_id?: string;
					class_id?: string | null;
					created_at?: string | null;
					created_by?: string | null;
					due_at?: string | null;
					id?: string;
					opens_at?: string | null;
					user_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "assessment_assignments_assessment_id_fkey";
						columns: ["assessment_id"];
						isOneToOne: false;
						referencedRelation: "assessments";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "assessment_assignments_class_id_fkey";
						columns: ["class_id"];
						isOneToOne: false;
						referencedRelation: "classes";
						referencedColumns: ["id"];
					},
				];
			};
			assessments: {
				Row: {
					created_at: string | null;
					created_by: string | null;
					id: string;
					title: string;
					type: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by?: string | null;
					id?: string;
					title: string;
					type?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string | null;
					id?: string;
					title?: string;
					type?: string | null;
				};
				Relationships: [];
			};
			class_invites: {
				Row: {
					active: boolean;
					class_id: string;
					code: string;
					created_at: string | null;
					created_by: string;
					expires_at: string;
					revoked_at: string | null;
					role: string;
					usage_count: number;
					usage_limit: number;
				};
				Insert: {
					active?: boolean;
					class_id: string;
					code: string;
					created_at?: string | null;
					created_by: string;
					expires_at?: string;
					revoked_at?: string | null;
					role?: string;
					usage_count?: number;
					usage_limit?: number;
				};
				Update: {
					active?: boolean;
					class_id?: string;
					code?: string;
					created_at?: string | null;
					created_by?: string;
					expires_at?: string;
					revoked_at?: string | null;
					role?: string;
					usage_count?: number;
					usage_limit?: number;
				};
				Relationships: [
					{
						foreignKeyName: "class_invites_class_id_fkey";
						columns: ["class_id"];
						isOneToOne: false;
						referencedRelation: "classes";
						referencedColumns: ["id"];
					},
				];
			};
			class_members: {
				Row: {
					class_id: string;
					role: string;
					user_id: string;
				};
				Insert: {
					class_id: string;
					role?: string;
					user_id: string;
				};
				Update: {
					class_id?: string;
					role?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "class_members_class_id_fkey";
						columns: ["class_id"];
						isOneToOne: false;
						referencedRelation: "classes";
						referencedColumns: ["id"];
					},
				];
			};
			classes: {
				Row: {
					created_at: string | null;
					id: string;
					level: string | null;
					name: string;
					teacher_id: string;
					updated_at: string | null;
				};
				Insert: {
					created_at?: string | null;
					id?: string;
					level?: string | null;
					name: string;
					teacher_id: string;
					updated_at?: string | null;
				};
				Update: {
					created_at?: string | null;
					id?: string;
					level?: string | null;
					name?: string;
					teacher_id?: string;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					created_at: string;
					email: string;
					first_name: string | null;
					id: string;
					last_name: string | null;
					role: string;
					track: string | null;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					email: string;
					first_name?: string | null;
					id: string;
					last_name?: string | null;
					role?: string;
					track?: string | null;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					email?: string;
					first_name?: string | null;
					id?: string;
					last_name?: string | null;
					role?: string;
					track?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			admin_set_role: {
				Args: { new_role: string; target_user: string };
				Returns: undefined;
			};
			create_class_invite: {
				Args: {
					p_class_id: string;
					p_expires_at?: string;
					p_usage_limit?: number;
				};
				Returns: {
					active: boolean;
					class_id: string;
					code: string;
					created_at: string | null;
					created_by: string;
					expires_at: string;
					revoked_at: string | null;
					role: string;
					usage_count: number;
					usage_limit: number;
				};
			};
			current_app_role: {
				Args: { uid?: string };
				Returns: string;
			};
			is_superadmin: {
				Args: { uid?: string };
				Returns: boolean;
			};
			random_code: {
				Args: { n?: number };
				Returns: string;
			};
			redeem_class_invite: {
				Args: { p_code: string };
				Returns: {
					class_id: string;
					class_name: string;
					was_added: boolean;
				}[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	public: {
		Enums: {},
	},
} as const;
