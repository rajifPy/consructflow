// ============================================
// packages/shared-db/src/types.ts
// Auto-generated Supabase types
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
      suppliers: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          phone: string | null
          email: string | null
          address: string | null
          rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_person?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          rating?: number | null
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
      purchase_orders: {
        Row: {
          id: string
          po_number: string
          project_id: string | null
          supplier_id: string | null
          order_date: string
          expected_delivery: string | null
          total_amount: number
          status: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled'
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          attachment_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          po_number?: string
          project_id?: string | null
          supplier_id?: string | null
          order_date?: string
          expected_delivery?: string | null
          total_amount?: number
          status?: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled'
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          attachment_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          po_number?: string
          project_id?: string | null
          supplier_id?: string | null
          order_date?: string
          expected_delivery?: string | null
          total_amount?: number
          status?: 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled'
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          attachment_url?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      po_items: {
        Row: {
          id: string
          po_id: string | null
          material_id: string | null
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          po_id?: string | null
          material_id?: string | null
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          po_id?: string | null
          material_id?: string | null
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          type: string
          serial_number: string | null
          purchase_date: string | null
          status: 'available' | 'deployed' | 'maintenance' | 'retired'
          current_project_id: string | null
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          maintenance_interval_days: number
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          serial_number?: string | null
          purchase_date?: string | null
          status?: 'available' | 'deployed' | 'maintenance' | 'retired'
          current_project_id?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          maintenance_interval_days?: number
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          serial_number?: string | null
          purchase_date?: string | null
          status?: 'available' | 'deployed' | 'maintenance' | 'retired'
          current_project_id?: string | null
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          maintenance_interval_days?: number
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_logs: {
        Row: {
          id: string
          equipment_id: string | null
          maintenance_date: string
          maintenance_type: 'routine' | 'repair' | 'inspection' | null
          description: string | null
          cost: number | null
          performed_by: string | null
          next_maintenance_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          equipment_id?: string | null
          maintenance_date: string
          maintenance_type?: 'routine' | 'repair' | 'inspection' | null
          description?: string | null
          cost?: number | null
          performed_by?: string | null
          next_maintenance_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          equipment_id?: string | null
          maintenance_date?: string
          maintenance_type?: 'routine' | 'repair' | 'inspection' | null
          description?: string | null
          cost?: number | null
          performed_by?: string | null
          next_maintenance_date?: string | null
          created_at?: string
        }
      }
      crews: {
        Row: {
          id: string
          name: string
          foreman_id: string | null
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          foreman_id?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          foreman_id?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crew_members: {
        Row: {
          id: string
          crew_id: string | null
          user_id: string | null
          role: string | null
          joined_date: string
          created_at: string
        }
        Insert: {
          id?: string
          crew_id?: string | null
          user_id?: string | null
          role?: string | null
          joined_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          crew_id?: string | null
          user_id?: string | null
          role?: string | null
          joined_date?: string
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          log_date: string
          project_id: string | null
          crew_id: string | null
          weather: string | null
          activities: Json | null
          materials_used: Json | null
          equipment_used: Json | null
          progress_photos: string[] | null
          issues: string | null
          notes: string | null
          submitted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          log_date?: string
          project_id?: string | null
          crew_id?: string | null
          weather?: string | null
          activities?: Json | null
          materials_used?: Json | null
          equipment_used?: Json | null
          progress_photos?: string[] | null
          issues?: string | null
          notes?: string | null
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          log_date?: string
          project_id?: string | null
          crew_id?: string | null
          weather?: string | null
          activities?: Json | null
          materials_used?: Json | null
          equipment_used?: Json | null
          progress_photos?: string[] | null
          issues?: string | null
          notes?: string | null
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
