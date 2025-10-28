// types/database.types.ts
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
          user_id: string
          user_type: 'patient' | 'psychologist'
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          user_type: 'patient' | 'psychologist'
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          user_type?: 'patient' | 'psychologist'
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_history: string | null
          current_medications: string | null
          therapy_goals: string | null
          preferred_schedule: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string | null
          current_medications?: string | null
          therapy_goals?: string | null
          preferred_schedule?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_history?: string | null
          current_medications?: string | null
          therapy_goals?: string | null
          preferred_schedule?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      psychologists: {
        Row: {
          id: string
          user_id: string
          crp: string
          specialties: string[]
          approach: string | null
          price_per_session: number
          session_duration: number
          gender: string | null
          languages: string[]
          education: string | null
          experience_years: number | null
          rating: number
          total_reviews: number
          is_accepting_patients: boolean
          available_days: string[] | null
          available_hours: string[] | null
          approval_status: 'pending' | 'approved' | 'rejected'
          bank_name: string | null
          bank_account_type: 'corrente' | 'poupanca' | null
          bank_agency: string | null
          bank_account: string | null
          pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null
          pix_key: string | null
          short_bio: string | null
          full_bio: string | null
          crp_document_url: string | null
          id_document_url: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crp: string
          specialties: string[]
          approach?: string | null
          price_per_session: number
          session_duration?: number
          gender?: string | null
          languages?: string[]
          education?: string | null
          experience_years?: number | null
          rating?: number
          total_reviews?: number
          is_accepting_patients?: boolean
          available_days?: string[] | null
          available_hours?: string[] | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          bank_name?: string | null
          bank_account_type?: 'corrente' | 'poupanca' | null
          bank_agency?: string | null
          bank_account?: string | null
          pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null
          pix_key?: string | null
          short_bio?: string | null
          full_bio?: string | null
          crp_document_url?: string | null
          id_document_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crp?: string
          specialties?: string[]
          approach?: string | null
          price_per_session?: number
          session_duration?: number
          gender?: string | null
          languages?: string[]
          education?: string | null
          experience_years?: number | null
          rating?: number
          total_reviews?: number
          is_accepting_patients?: boolean
          available_days?: string[] | null
          available_hours?: string[] | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          bank_name?: string | null
          bank_account_type?: 'corrente' | 'poupanca' | null
          bank_agency?: string | null
          bank_account?: string | null
          pix_key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null
          pix_key?: string | null
          short_bio?: string | null
          full_bio?: string | null
          crp_document_url?: string | null
          id_document_url?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      psychologist_leads: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          crp: string
          status: 'pending' | 'contacted' | 'approved' | 'rejected'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          crp: string
          status?: 'pending' | 'contacted' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          crp?: string
          status?: 'pending' | 'contacted' | 'approved' | 'rejected'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          psychologist_id: string
          appointment_date: string
          appointment_time: string
          duration: number
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          notes: string | null
          meeting_link: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          psychologist_id: string
          appointment_date: string
          appointment_time: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          meeting_link?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          psychologist_id?: string
          appointment_date?: string
          appointment_time?: string
          duration?: number
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
          notes?: string | null
          meeting_link?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          patient_id: string
          psychologist_id: string
          appointment_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          psychologist_id: string
          appointment_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          psychologist_id?: string
          appointment_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}