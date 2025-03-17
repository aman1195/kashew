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
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          company_name: string | null
          email: string
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          company_name?: string | null
          email: string
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          company_name?: string | null
          email?: string
          avatar_url?: string | null
        }
      }
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string
          phone: string | null
          address: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email: string
          phone?: string | null
          address?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string
          phone?: string | null
          address?: string | null
          user_id?: string
        }
      }
      invoices: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          number: string
          date: string
          due_date: string
          status: 'draft' | 'sent' | 'paid' | 'overdue'
          total: number
          client_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          number: string
          date: string
          due_date: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          total: number
          client_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          number?: string
          date?: string
          due_date?: string
          status?: 'draft' | 'sent' | 'paid' | 'overdue'
          total?: number
          client_id?: string
          user_id?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          description: string
          quantity: number
          price: number
          invoice_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          description: string
          quantity: number
          price: number
          invoice_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          description?: string
          quantity?: number
          price?: number
          invoice_id?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          type: string
          unit: string
          tax_rate: number
          archived: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          type?: string
          unit?: string
          tax_rate?: number
          archived?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          type?: string
          unit?: string
          tax_rate?: number
          archived?: boolean
          user_id?: string
        }
      }
    }
  }
} 