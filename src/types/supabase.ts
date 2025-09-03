export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      blocks: {
        Row: {
          checked: boolean | null;
          content: string | null;
          created_at: string;
          id: string;
          is_expanded: boolean | null;
          language: string | null;
          page_id: string;
          parent_block_id: string | null;
          src: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          checked?: boolean | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          is_expanded?: boolean | null;
          language?: string | null;
          page_id: string;
          parent_block_id?: string | null;
          src?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          checked?: boolean | null;
          content?: string | null;
          created_at?: string;
          id?: string;
          is_expanded?: boolean | null;
          language?: string | null;
          page_id?: string;
          parent_block_id?: string | null;
          src?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blocks_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_parent_block_id_fkey";
            columns: ["parent_block_id"];
            isOneToOne: false;
            referencedRelation: "blocks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "blocks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_events: {
        Row: {
          color: string;
          created_at: string;
          date: string;
          id: string;
          tag: string;
          time: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          color: string;
          created_at?: string;
          date: string;
          id?: string;
          tag: string;
          time?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          date?: string;
          id?: string;
          tag?: string;
          time?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          is_expanded: boolean;
          parent_id: string | null;
          title: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_expanded?: boolean;
          parent_id?: string | null;
          title: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          is_expanded?: boolean;
          parent_id?: string | null;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      roadmap_tasks: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: string;
          progress: number;
          start_date: string | null;
          status: string;
          title: string;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          progress?: number;
          start_date?: string | null;
          status?: string;
          title: string;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          progress?: number;
          start_date?: string | null;
          status?: string;
          title?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "roadmap_tasks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
