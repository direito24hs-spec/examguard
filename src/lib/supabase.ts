import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]


export type Exam = {
  id: string
  title: string
  description: string | null
  mode: 'prova' | 'simulado'
  duration_minutes: number
  max_attempts: number
  penalty_per_wrong: number
  penalty_per_blank: number
  allow_penalty: boolean
  randomize_questions: boolean
  show_feedback_after: 'submit' | 'release'
  status?: 'draft' | 'open' | 'closed'
  professor_id?: string
}
export interface Database {
  public: {
    Tables: {
      exam_profiles: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          email: string
          role: 'professor' | 'student'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          email: string
          role?: 'professor' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          email?: string
          role?: 'professor' | 'student'
          created_at?: string
        }
      }
      exams: {
        Row: {
          id: string
          title: string
          description: string | null
          instructions: string | null
          mode: 'training' | 'secure'
          max_focus_violations: number | null
          time_limit_minutes: number | null
          penalty_per_violation: number
          min_score_after_penalty: number
          randomize_questions: boolean
          randomize_options: boolean
          status: 'draft' | 'open' | 'closed'
          results_released: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructions?: string | null
          mode?: 'training' | 'secure'
          max_focus_violations?: number | null
          time_limit_minutes?: number | null
          penalty_per_violation?: number
          min_score_after_penalty?: number
          randomize_questions?: boolean
          randomize_options?: boolean
          status?: 'draft' | 'open' | 'closed'
          results_released?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructions?: string | null
          mode?: 'training' | 'secure'
          max_focus_violations?: number | null
          time_limit_minutes?: number | null
          penalty_per_violation?: number
          min_score_after_penalty?: number
          randomize_questions?: boolean
          randomize_options?: boolean
          status?: 'draft' | 'open' | 'closed'
          results_released?: boolean
          created_by?: string | null
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: string
          type: 'mcq_single' | 'true_false'
          stem: string
          options: { id: string; text: string }[]
          correct_option_id: string
          feedback_correct: string | null
          feedback_incorrect: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          type?: 'mcq_single' | 'true_false'
          stem: string
          options?: { id: string; text: string }[]
          correct_option_id: string
          feedback_correct?: string | null
          feedback_incorrect?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          type?: 'mcq_single' | 'true_false'
          stem?: string
          options?: { id: string; text: string }[]
          correct_option_id?: string
          feedback_correct?: string | null
          feedback_incorrect?: string | null
          order_index?: number
        }
      }
      exam_attempts: {
        Row: {
          id: string
          exam_id: string
          student_id: string | null
          student_name: string | null
          student_email: string | null
          status: 'in_progress' | 'submitted' | 'auto_blocked'
          started_at: string
          submitted_at: string | null
          raw_score: number | null
          final_score: number | null
          focus_violations_count: number
          questions_order: string[]
        }
        Insert: {
          id?: string
          exam_id: string
          student_id?: string | null
          student_name?: string | null
          student_email?: string | null
          status?: 'in_progress' | 'submitted' | 'auto_blocked'
          started_at?: string
          submitted_at?: string | null
          raw_score?: number | null
          final_score?: number | null
          focus_violations_count?: number
          questions_order?: string[]
        }
        Update: {
          id?: string
          exam_id?: string
          student_id?: string | null
          student_name?: string | null
          student_email?: string | null
          status?: 'in_progress' | 'submitted' | 'auto_blocked'
          submitted_at?: string | null
          raw_score?: number | null
          final_score?: number | null
          focus_violations_count?: number
          questions_order?: string[]
        }
      }
      answers: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          selected_option_id: string | null
          is_correct: boolean | null
          awarded_score: number | null
          feedback_shown: string | null
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          selected_option_id?: string | null
          is_correct?: boolean | null
          awarded_score?: number | null
          feedback_shown?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          selected_option_id?: string | null
          is_correct?: boolean | null
          awarded_score?: number | null
          feedback_shown?: string | null
        }
      }
      focus_violations: {
        Row: {
          id: string
          attempt_id: string
          event_type: 'blur' | 'visibility_hidden' | 'visibility_visible'
          occurred_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          event_type: 'blur' | 'visibility_hidden' | 'visibility_visible'
          occurred_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          event_type?: 'blur' | 'visibility_hidden' | 'visibility_visible'
          occurred_at?: string
        }
      }
    }
  }
}
