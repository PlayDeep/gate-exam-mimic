
import { supabase } from '@/integrations/supabase/client';

export interface TestSession {
  id: string;
  subject: string;
  start_time: string;
  end_time?: string;
  total_questions: number;
  answered_questions?: number;
  score?: number;
  percentage?: number;
  status: string;
  time_taken?: number;
  submitted_at?: string;
  is_submitted?: boolean;
  last_activity?: string;
}

export interface UserAnswer {
  id: string;
  session_id: string;
  question_id?: string;
  user_answer?: string;
  is_correct?: boolean;
  marks_awarded?: number;
  time_spent?: number;
  answered_at: string;
}

export const createTestSession = async (subject: string, totalQuestions: number): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('test_sessions')
    .insert({
      user_id: user.id,
      subject,
      total_questions: totalQuestions,
      status: 'in_progress',
      is_submitted: false,
      last_activity: new Date().toISOString()
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating test session:', error);
    throw error;
  }

  return data.id;
};

export const updateTestSession = async (
  sessionId: string, 
  updates: Partial<TestSession>
): Promise<void> => {
  const { error } = await supabase
    .from('test_sessions')
    .update({
      ...updates,
      last_activity: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating test session:', error);
    throw error;
  }
};

export const submitTestSession = async (
  sessionId: string,
  updates: Partial<TestSession>
): Promise<void> => {
  const submissionTime = new Date().toISOString();
  
  const { error } = await supabase
    .from('test_sessions')
    .update({
      ...updates,
      is_submitted: true,
      submitted_at: submissionTime,
      last_activity: submissionTime,
      status: 'completed'
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error submitting test session:', error);
    throw error;
  }
};

export const checkIfTestSubmitted = async (sessionId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('test_sessions')
    .select('is_submitted')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error checking test submission status:', error);
    return false;
  }

  return data?.is_submitted || false;
};

export const saveUserAnswer = async (
  sessionId: string,
  questionId: string,
  userAnswer: string,
  isCorrect: boolean,
  marksAwarded: number,
  timeSpent: number
): Promise<void> => {
  const { error } = await supabase
    .from('user_answers')
    .upsert({
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      marks_awarded: marksAwarded,
      time_spent: timeSpent
    });

  if (error) {
    console.error('Error saving user answer:', error);
    throw error;
  }
};

export const getUserTestSessions = async (): Promise<TestSession[]> => {
  const { data, error } = await supabase
    .from('test_sessions')
    .select('*')
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching test sessions:', error);
    return [];
  }

  return data || [];
};

export const getTestSessionDetails = async (sessionId: string) => {
  const { data: session, error: sessionError } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    console.error('Error fetching test session:', sessionError);
    return null;
  }

  const { data: answers, error: answersError } = await supabase
    .from('user_answers')
    .select(`
      *,
      questions (
        question_text,
        correct_answer,
        explanation,
        options
      )
    `)
    .eq('session_id', sessionId);

  if (answersError) {
    console.error('Error fetching answers:', answersError);
    return { session, answers: [] };
  }

  return { session, answers: answers || [] };
};

export const deleteTestSession = async (sessionId: string): Promise<void> => {
  // First delete related user_answers
  const { error: answersError } = await supabase
    .from('user_answers')
    .delete()
    .eq('session_id', sessionId);

  if (answersError) {
    console.error('Error deleting user answers:', answersError);
    throw answersError;
  }

  // Then delete the test session
  const { error: sessionError } = await supabase
    .from('test_sessions')
    .delete()
    .eq('id', sessionId);

  if (sessionError) {
    console.error('Error deleting test session:', sessionError);
    throw sessionError;
  }
};
