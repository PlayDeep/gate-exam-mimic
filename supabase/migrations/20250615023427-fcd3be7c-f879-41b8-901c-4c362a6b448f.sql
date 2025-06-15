
-- Add timestamps and tracking fields to test_sessions table
ALTER TABLE public.test_sessions 
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_submitted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add real-time tracking table for monitoring active sessions
CREATE TABLE IF NOT EXISTS public.test_session_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'question_change', 'answer_update', 'heartbeat'
  question_number INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- Enable RLS on tracking table
ALTER TABLE public.test_session_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for tracking table
CREATE POLICY "Users can view their own tracking data" 
  ON public.test_session_tracking 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tracking data" 
  ON public.test_session_tracking 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Update trigger to track last activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.test_sessions 
  SET last_activity = now() 
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_activity
  AFTER INSERT ON public.test_session_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Enable realtime for both tables
ALTER TABLE public.test_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.test_session_tracking REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_session_tracking;
