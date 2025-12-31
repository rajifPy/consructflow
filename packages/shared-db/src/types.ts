// ============================================
// packages/shared-db/src/types.ts
// Generate this with: supabase gen types typescript
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'project_manager' | 'procurement_officer' | 'equipment_manager' | 'foreman' | 'worker'
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: 'admin' | 'project_manager' | 'procurement_officer' | 'equipment_manager' | 'foreman' | 'worker'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'project_manager' | 'procurement_officer' | 'equipment_manager' | 'foreman' | 'worker'
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          location: string
          client_name: string | null
          start_date: string
          end_date: string | null
          budget: number | null
          status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          project_manager_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          client_name?: string | null
          start_date: string
          end_date?: string | null
          budget?: number | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          project_manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          client_name?: string | null
          start_date?: string
          end_date?: string | null
          budget?: number | null
          status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
          project_manager_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          project_id: string | null
          name: string
          unit: string
          quantity_on_hand: number
          reorder_level: number
          unit_cost: number | null
          supplier_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          name: string
          unit: string
          quantity_on_hand?: number
          reorder_level?: number
          unit_cost?: number | null
          supplier_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          name?: string
          unit?: string
          quantity_on_hand?: number
          reorder_level?: number
          unit_cost?: number | null
          supplier_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
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
  }
}
