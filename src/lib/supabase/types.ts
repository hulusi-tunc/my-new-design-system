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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          github_username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          github_username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
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
      };
    };
  };
}
