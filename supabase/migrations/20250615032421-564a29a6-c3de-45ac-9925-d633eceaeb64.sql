
-- First, delete duplicate entries keeping only the most recent one for each session_id, question_id combination
DELETE FROM public.user_answers 
WHERE id NOT IN (
  SELECT DISTINCT ON (session_id, question_id) id
  FROM public.user_answers
  ORDER BY session_id, question_id, answered_at DESC
);

-- Now add the unique constraint
ALTER TABLE public.user_answers 
ADD CONSTRAINT user_answers_session_question_unique 
UNIQUE (session_id, question_id);
