
import { supabase } from '@/integrations/supabase/client';

export interface TestSession {
  id: string;
  user_id: string;
  subject: string;
  start_time: string;
  end_time?: string;
  total_questions: number;
  answered_questions?: number;
  score?: number;
  percentage?: number;
  status: string;
  is_submitted: boolean;
  submitted_at?: string;
  time_taken?: number;
}

export const createTestSession = async (subject: string, totalQuestions: number): Promise<string> => {
  console.log('Creating test session for subject:', subject, 'with', totalQuestions, 'questions');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('test_sessions')
    .insert({
      user_id: user.id,
      subject: subject.toUpperCase(),
      total_questions: totalQuestions,
      status: 'in_progress'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating test session:', error);
    throw error;
  }

  console.log('Test session created:', data.id);
  return data.id;
};

export const submitTestSession = async (sessionId: string, updateData: {
  end_time: string;
  answered_questions: number;
  score: number;
  percentage: number;
  time_taken: number;
}) => {
  console.log('Submitting test session:', sessionId);
  
  const { error } = await supabase
    .from('test_sessions')
    .update({
      ...updateData,
      status: 'completed',
      is_submitted: true,
      submitted_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error submitting test session:', error);
    throw error;
  }

  console.log('Test session submitted successfully');
};

export const checkIfTestSubmitted = async (sessionId: string): Promise<boolean> => {
  console.log('Checking if test is submitted:', sessionId);
  
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

export const deleteTestSession = async (sessionId: string): Promise<void> => {
  console.log('Deleting test session:', sessionId);
  
  try {
    // Delete in specific order to avoid foreign key conflicts
    
    // 1. Delete tracking data (non-critical, can fail silently)
    try {
      const { error: trackingError } = await supabase
        .from('test_session_tracking')
        .delete()
        .eq('session_id', sessionId);
      
      if (trackingError) {
        console.warn('Non-critical: Could not delete tracking data:', trackingError);
      }
    } catch (trackingDeleteError) {
      console.warn('Non-critical tracking deletion error:', trackingDeleteError);
    }

    // 2. Delete user answers (critical)
    const { error: answersError } = await supabase
      .from('user_answers')
      .delete()
      .eq('session_id', sessionId);

    if (answersError) {
      console.error('Error deleting answers:', answersError);
      throw answersError;
    }

    // 3. Delete test session (critical)
    const { error: sessionError } = await supabase
      .from('test_sessions')
      .delete()
      .eq('id', sessionId);

    if (sessionError) {
      console.error('Error deleting session:', sessionError);
      throw sessionError;
    }

    console.log('Test session deleted successfully');
  } catch (error) {
    console.error('Error in deleteTestSession:', error);
    throw error;
  }
};
