-- Create enum for question categories
CREATE TYPE public.question_category AS ENUM ('hr', 'technical', 'behavioral');

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  target_role TEXT,
  experience_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table for the question bank
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category question_category NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  question_text TEXT NOT NULL,
  sample_answer TEXT,
  tags TEXT[],
  time_limit_seconds INTEGER DEFAULT 120,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice sessions table
CREATE TABLE public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category question_category,
  total_questions INTEGER NOT NULL DEFAULT 0,
  completed_questions INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC(5,2),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER
);

-- Create session responses table for individual question responses
CREATE TABLE public.session_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  user_answer TEXT,
  score NUMERIC(5,2),
  feedback TEXT,
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance metrics table for tracking progress
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sessions INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  average_score NUMERIC(5,2),
  hr_score NUMERIC(5,2),
  technical_score NUMERIC(5,2),
  behavioral_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Questions RLS policies (everyone can read, only admins can modify - for now everyone can read)
CREATE POLICY "Anyone can view active questions"
ON public.questions FOR SELECT
USING (is_active = true);

-- Practice sessions RLS policies
CREATE POLICY "Users can view their own sessions"
ON public.practice_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
ON public.practice_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.practice_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Session responses RLS policies
CREATE POLICY "Users can view their own responses"
ON public.session_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.practice_sessions ps 
  WHERE ps.id = session_responses.session_id 
  AND ps.user_id = auth.uid()
));

CREATE POLICY "Users can create responses for their sessions"
ON public.session_responses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.practice_sessions ps 
  WHERE ps.id = session_responses.session_id 
  AND ps.user_id = auth.uid()
));

-- Performance metrics RLS policies
CREATE POLICY "Users can view their own metrics"
ON public.performance_metrics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
ON public.performance_metrics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
ON public.performance_metrics FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Insert sample questions
INSERT INTO public.questions (category, difficulty, question_text, sample_answer, tags, time_limit_seconds) VALUES
-- HR Questions
('hr', 'easy', 'Tell me about yourself.', 'Focus on your professional journey, key achievements, and what drives you in your career.', ARRAY['introduction', 'personal'], 120),
('hr', 'easy', 'Why do you want to work for our company?', 'Research the company values, culture, and recent achievements. Connect them to your goals.', ARRAY['motivation', 'company-research'], 90),
('hr', 'medium', 'Where do you see yourself in 5 years?', 'Show ambition while being realistic. Connect your goals to the company growth opportunities.', ARRAY['career-goals', 'growth'], 90),
('hr', 'medium', 'What are your salary expectations?', 'Research market rates, provide a range, and emphasize value over specific numbers.', ARRAY['compensation', 'negotiation'], 60),
('hr', 'hard', 'Why should we hire you over other candidates?', 'Highlight unique skills, achievements, and how you can add immediate value to the team.', ARRAY['differentiation', 'value-proposition'], 120),

-- Technical Questions
('technical', 'easy', 'Explain the difference between a stack and a queue.', 'Stack follows LIFO (Last In First Out), Queue follows FIFO (First In First Out). Give examples.', ARRAY['data-structures', 'fundamentals'], 90),
('technical', 'medium', 'What is the difference between REST and GraphQL?', 'REST uses multiple endpoints with fixed data structures, GraphQL uses single endpoint with flexible queries.', ARRAY['api', 'web-development'], 120),
('technical', 'medium', 'Explain database normalization and its benefits.', 'Normalization reduces data redundancy and improves integrity through organized table structures.', ARRAY['database', 'sql'], 120),
('technical', 'hard', 'How would you design a URL shortening service?', 'Discuss database design, hashing algorithms, scalability considerations, and caching strategies.', ARRAY['system-design', 'scalability'], 180),
('technical', 'hard', 'Explain the CAP theorem and its implications.', 'Consistency, Availability, Partition tolerance - distributed systems can only guarantee two of three.', ARRAY['distributed-systems', 'theory'], 150),

-- Behavioral Questions
('behavioral', 'easy', 'Describe a time when you worked effectively under pressure.', 'Use STAR method: Situation, Task, Action, Result. Be specific about outcomes.', ARRAY['pressure', 'stress-management'], 120),
('behavioral', 'medium', 'Tell me about a conflict you had with a colleague and how you resolved it.', 'Focus on communication, empathy, and finding common ground. Emphasize positive outcome.', ARRAY['conflict-resolution', 'teamwork'], 150),
('behavioral', 'medium', 'Describe a situation where you had to learn something new quickly.', 'Highlight your learning process, resources used, and how you applied the new knowledge.', ARRAY['learning', 'adaptability'], 120),
('behavioral', 'hard', 'Tell me about a time you failed and what you learned from it.', 'Be honest about the failure, focus on lessons learned and how you improved afterward.', ARRAY['failure', 'growth-mindset'], 150),
('behavioral', 'hard', 'Describe a time when you had to convince others to change their minds.', 'Emphasize persuasion techniques, data-driven arguments, and respect for other viewpoints.', ARRAY['influence', 'leadership'], 150);