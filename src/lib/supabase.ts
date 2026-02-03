import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type QuestionCategory = 'hr' | 'technical' | 'behavioral';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: QuestionCategory;
  difficulty: DifficultyLevel;
  question_text: string;
  sample_answer: string | null;
  tags: string[] | null;
  time_limit_seconds: number | null;
  is_active: boolean | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  target_role: string | null;
  experience_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  category: QuestionCategory | null;
  total_questions: number;
  completed_questions: number;
  average_score: number | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export interface SessionResponse {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: string | null;
  score: number | null;
  feedback: string | null;
  time_taken_seconds: number | null;
  created_at: string;
}

export interface PerformanceMetrics {
  id: string;
  user_id: string;
  metric_date: string;
  total_sessions: number | null;
  total_questions_answered: number | null;
  average_score: number | null;
  hr_score: number | null;
  technical_score: number | null;
  behavioral_score: number | null;
  created_at: string;
}
