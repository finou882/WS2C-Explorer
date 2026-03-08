// database.types.ts を web/functions/ にコピー
// Database types for pos table

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
      pos: {
        Row: {
          id: string;
          name: string;
          pieces: number;
          category: string;
          status: string;
          location: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          name: string;
          pieces?: number;
          category?: string;
          status?: string;
          location?: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          name?: string;
          pieces?: number;
          category?: string;
          status?: string;
          location?: string;
          timestamp?: string;
        };
      };
      activity_days: {
        Row: {
          id: string;
          date: string; // YYYY-MM-DD
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
