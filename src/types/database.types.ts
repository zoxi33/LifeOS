// Manually written to match Supabase v2 CLI output format.
// Regenerate with: npx supabase gen types typescript --project-id vjrgvcrjsjtwvbiwpkqd > src/types/database.types.ts
// (requires SUPABASE_ACCESS_TOKEN env var or `supabase login`)

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
      checklist_items: {
        Row: { id: string; name: string; active: boolean; sort_order: number; created_at: string; };
        Insert: { id?: string; name: string; active?: boolean; sort_order?: number; created_at?: string; };
        Update: { id?: string; name?: string; active?: boolean; sort_order?: number; created_at?: string; };
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          date: string;
          focus_minutes: number;
          notes: string | null;
          checklist: Record<string, boolean> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          focus_minutes?: number;
          notes?: string | null;
          checklist?: Record<string, boolean> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          focus_minutes?: number;
          notes?: string | null;
          checklist?: Record<string, boolean> | null;
          created_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          name: string;
          freq: string;
          type: string;
          target: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          freq: string;
          type: string;
          target?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          freq?: string;
          type?: string;
          target?: number;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          date: string;
          done: boolean;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          done?: boolean;
        };
        Update: {
          id?: string;
          habit_id?: string;
          date?: string;
          done?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'habit_logs_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habits';
            referencedColumns: ['id'];
          },
        ];
      };
      journal_entries: {
        Row: {
          id: string;
          date: string;
          title: string | null;
          body: string | null;
          mood: number | null;
          sleep_hours: number | null;
          weight_kg: number | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          title?: string | null;
          body?: string | null;
          mood?: number | null;
          sleep_hours?: number | null;
          weight_kg?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          title?: string | null;
          body?: string | null;
          mood?: number | null;
          sleep_hours?: number | null;
          weight_kg?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          current: number | null;
          target: number | null;
          unit: string | null;
          start_date: string | null;
          due_date: string | null;
          note: string | null;
          active: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          current?: number | null;
          target?: number | null;
          unit?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          note?: string | null;
          active?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          current?: number | null;
          target?: number | null;
          unit?: string | null;
          start_date?: string | null;
          due_date?: string | null;
          note?: string | null;
          active?: boolean;
        };
        Relationships: [];
      };
      goal_milestones: {
        Row: {
          id: string;
          goal_id: string;
          name: string;
          done: boolean;
          due_label: string | null;
        };
        Insert: {
          id?: string;
          goal_id: string;
          name: string;
          done?: boolean;
          due_label?: string | null;
        };
        Update: {
          id?: string;
          goal_id?: string;
          name?: string;
          done?: boolean;
          due_label?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'goal_milestones_goal_id_fkey';
            columns: ['goal_id'];
            isOneToOne: false;
            referencedRelation: 'goals';
            referencedColumns: ['id'];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          date: string;
          name: string;
          category: string | null;
          amount: number | null;
          type: string | null;
        };
        Insert: {
          id?: string;
          date: string;
          name: string;
          category?: string | null;
          amount?: number | null;
          type?: string | null;
        };
        Update: {
          id?: string;
          date?: string;
          name?: string;
          category?: string | null;
          amount?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
      sleep_logs: {
        Row: {
          id: string;
          date: string;
          hours: number | null;
          bed_time: number | null;
          wake_time: number | null;
          quality: number | null;
        };
        Insert: {
          id?: string;
          date: string;
          hours?: number | null;
          bed_time?: number | null;
          wake_time?: number | null;
          quality?: number | null;
        };
        Update: {
          id?: string;
          date?: string;
          hours?: number | null;
          bed_time?: number | null;
          wake_time?: number | null;
          quality?: number | null;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          measured_at: string;
          weight_kg: number | null;
        };
        Insert: {
          id?: string;
          measured_at: string;
          weight_kg?: number | null;
        };
        Update: {
          id?: string;
          measured_at?: string;
          weight_kg?: number | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: { key: string; value: Json };
        Insert: { key: string; value: Json };
        Update: { key?: string; value?: Json };
        Relationships: [];
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
