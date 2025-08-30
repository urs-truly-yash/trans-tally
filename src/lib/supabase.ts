import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Transaction = {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category_id: string
  date: string
  receipt_url?: string
  created_at: string
  updated_at: string
  categories?: Category
}

export type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
  color: string
  created_at: string
}

export type Receipt = {
  id: string
  user_id: string
  file_url: string
  file_name: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  extracted_data?: any
  created_at: string
}