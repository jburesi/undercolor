export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      game_history: {
        Row: {
          duration_seconds: number | null;
          id: string;
          image_set_name: string | null;
          is_winner: boolean;
          played_at: string;
          player_count: number;
          role: Database["public"]["Enums"]["player_role"];
          room_code: string;
          room_id: string | null;
          user_id: string | null;
          username: string;
        };
        Insert: {
          duration_seconds?: number | null;
          id?: string;
          image_set_name?: string | null;
          is_winner: boolean;
          played_at?: string;
          player_count: number;
          role: Database["public"]["Enums"]["player_role"];
          room_code: string;
          room_id?: string | null;
          user_id?: string | null;
          username: string;
        };
        Update: {
          duration_seconds?: number | null;
          id?: string;
          image_set_name?: string | null;
          is_winner?: boolean;
          played_at?: string;
          player_count?: number;
          role?: Database["public"]["Enums"]["player_role"];
          room_code?: string;
          room_id?: string | null;
          user_id?: string | null;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_history_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      image_sets: {
        Row: {
          category: string;
          created_at: string;
          created_by: string | null;
          difficulty: Database["public"]["Enums"]["difficulty_level"];
          id: string;
          imposter_image_url: string;
          innocent_image_url: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          created_by?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          id?: string;
          imposter_image_url: string;
          innocent_image_url: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          created_by?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          id?: string;
          imposter_image_url?: string;
          innocent_image_url?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      players: {
        Row: {
          avatar_url: string | null;
          connection_status: Database["public"]["Enums"]["connection_status"];
          created_at: string;
          has_voted: boolean;
          id: string;
          is_alive: boolean;
          is_host: boolean;
          role: Database["public"]["Enums"]["player_role"] | null;
          room_id: string;
          session_id: string;
          updated_at: string;
          user_id: string | null;
          username: string;
          vote_target_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          connection_status?: Database["public"]["Enums"]["connection_status"];
          created_at?: string;
          has_voted?: boolean;
          id?: string;
          is_alive?: boolean;
          is_host?: boolean;
          role?: Database["public"]["Enums"]["player_role"] | null;
          room_id: string;
          session_id: string;
          updated_at?: string;
          user_id?: string | null;
          username: string;
          vote_target_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          connection_status?: Database["public"]["Enums"]["connection_status"];
          created_at?: string;
          has_voted?: boolean;
          id?: string;
          is_alive?: boolean;
          is_host?: boolean;
          role?: Database["public"]["Enums"]["player_role"] | null;
          room_id?: string;
          session_id?: string;
          updated_at?: string;
          user_id?: string | null;
          username?: string;
          vote_target_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "players_vote_target_id_fkey";
            columns: ["vote_target_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          code: string;
          config: Json;
          created_at: string;
          current_image_set_id: string | null;
          current_round: number;
          host_id: string | null;
          id: string;
          is_public: boolean;
          phase_ends_at: string | null;
          phase_started_at: string | null;
          state: Database["public"]["Enums"]["game_state"];
          updated_at: string;
          winner: Database["public"]["Enums"]["player_role"] | null;
        };
        Insert: {
          code: string;
          config?: Json;
          created_at?: string;
          current_image_set_id?: string | null;
          current_round?: number;
          host_id?: string | null;
          id?: string;
          is_public?: boolean;
          phase_ends_at?: string | null;
          phase_started_at?: string | null;
          state?: Database["public"]["Enums"]["game_state"];
          updated_at?: string;
          winner?: Database["public"]["Enums"]["player_role"] | null;
        };
        Update: {
          code?: string;
          config?: Json;
          created_at?: string;
          current_image_set_id?: string | null;
          current_round?: number;
          host_id?: string | null;
          id?: string;
          is_public?: boolean;
          phase_ends_at?: string | null;
          phase_started_at?: string | null;
          state?: Database["public"]["Enums"]["game_state"];
          updated_at?: string;
          winner?: Database["public"]["Enums"]["player_role"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "fk_rooms_host_id";
            columns: ["host_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rooms_current_image_set_id_fkey";
            columns: ["current_image_set_id"];
            isOneToOne: false;
            referencedRelation: "image_sets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_room_code: { Args: never; Returns: string };
    };
    Enums: {
      connection_status: "CONNECTED" | "DISCONNECTED" | "RECONNECTING";
      difficulty_level: "easy" | "medium" | "hard";
      game_state:
        | "LOBBY"
        | "DISTRIBUTING"
        | "OBSERVATION"
        | "DEBATE"
        | "VOTING"
        | "RESOLVING"
        | "FINISHED";
      player_role: "INNOCENT" | "IMPOSTER" | "MR_WHITE";
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      connection_status: ["CONNECTED", "DISCONNECTED", "RECONNECTING"],
      difficulty_level: ["easy", "medium", "hard"],
      game_state: [
        "LOBBY",
        "DISTRIBUTING",
        "OBSERVATION",
        "DEBATE",
        "VOTING",
        "RESOLVING",
        "FINISHED",
      ],
      player_role: ["INNOCENT", "IMPOSTER", "MR_WHITE"],
    },
  },
} as const;
