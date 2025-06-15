
import { supabase } from '@/integrations/supabase/client';
import { TestSession } from './testSessionService';

export const getUserTests = async (): Promise<TestSession[]> => {
  console.log('Fetching user tests');
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching user tests:', error);
    throw error;
  }

  return data || [];
};

export const getUserTestSessions = async (): Promise<TestSession[]> => {
  return getUserTests();
};

export const getTestSessionDetails = async (sessionId: string) => {
  console.log('Getting test session details for:', sessionId);
  
  const { data: session, error: sessionError } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError) {
    console.error('Error fetching session:', sessionError);
    throw sessionError;
  }

  const { data: answers, error: answersError } = await supabase
    .from('user_answers')
    .select('*')
    .eq('session_id', sessionId);

  if (answersError) {
    console.error('Error fetching answers:', answersError);
    throw answersError;
  }

  return { session, answers };
};
