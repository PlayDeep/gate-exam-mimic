
import { supabase } from '@/integrations/supabase/client';

export const saveUserAnswer = async (
  sessionId: string,
  questionId: string,
  userAnswer: string,
  isCorrect: boolean,
  marksAwarded: number,
  timeSpent: number
) => {
  console.log('Saving user answer for session:', sessionId, 'question:', questionId);
  
  const { error } = await supabase
    .from('user_answers')
    .upsert({
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      marks_awarded: marksAwarded,
      time_spent: timeSpent
    }, {
      onConflict: 'session_id,question_id'
    });

  if (error) {
    console.error('Error saving user answer:', error);
    throw error;
  }
};
