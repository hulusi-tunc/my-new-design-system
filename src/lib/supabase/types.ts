// Database types for Supabase client.
// These mirror the schema in supabase/schema.sql.
// When the schema changes, update these types manually or regenerate via:
//   npx supabase gen types typescript --project-id <your-id> > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Supabase JS 2.x expects per-table `Relationships` and public-schema
// Views/Functions/Enums/CompositeTypes buckets. Missing bits collapse
// insert/update payloads to `never` at compile time.
type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};
type NoRelationships = Relationship[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_username: string | null;
          display_name: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          approval_status: "pending" | "approved" | "rejected";
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          github_username?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          approval_status?: "pending" | "approved" | "rejected";
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          github_username?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          approval_status?: "pending" | "approved" | "rejected";
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
        };
        Relationships: NoRelationships;
      };
      design_systems: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          version: string;
          owner_id: string | null;
          repository_url: string;
          manifest_path: string;
          install_path: string | null;
          default_branch: string;
          platform: string;
          technology: string[];
          tags: string[];
          architecture: string | null;
          license: string;
          parent_id: string | null;
          manifest: Json | null;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          version: string;
          owner_id?: string | null;
          repository_url: string;
          manifest_path?: string;
          install_path?: string | null;
          default_branch?: string;
          platform?: string;
          technology?: string[];
          tags?: string[];
          architecture?: string | null;
          license?: string;
          parent_id?: string | null;
          manifest?: Json | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          version?: string;
          owner_id?: string | null;
          repository_url?: string;
          manifest_path?: string;
          install_path?: string | null;
          default_branch?: string;
          platform?: string;
          technology?: string[];
          tags?: string[];
          architecture?: string | null;
          license?: string;
          parent_id?: string | null;
          manifest?: Json | null;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: NoRelationships;
      };
      ingest_jobs: {
        Row: {
          id: string;
          owner_id: string;
          repo_url: string;
          platform: string;
          branch: string | null;
          subpath: string | null;
          status: string;
          progress: Json | null;
          warnings: Json | null;
          error: string | null;
          draft_manifest: Json | null;
          design_system_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          repo_url: string;
          platform: string;
          branch?: string | null;
          subpath?: string | null;
          status?: string;
          progress?: Json | null;
          warnings?: Json | null;
          error?: string | null;
          draft_manifest?: Json | null;
          design_system_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          repo_url?: string;
          platform?: string;
          branch?: string | null;
          subpath?: string | null;
          status?: string;
          progress?: Json | null;
          warnings?: Json | null;
          error?: string | null;
          draft_manifest?: Json | null;
          design_system_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: NoRelationships;
      };
      design_system_stats: {
        Row: {
          design_system_id: string;
          views: number;
          installs: number;
          stars: number;
          updated_at: string;
        };
        Insert: {
          design_system_id: string;
          views?: number;
          installs?: number;
          stars?: number;
          updated_at?: string;
        };
        Update: {
          design_system_id?: string;
          views?: number;
          installs?: number;
          stars?: number;
          updated_at?: string;
        };
        Relationships: NoRelationships;
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
