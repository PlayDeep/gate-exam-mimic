
import { supabase } from '@/integrations/supabase/client';

export interface SessionActivity {
  id: string;
  session_id: string;
  user_id: string;
  activity_type: 'question_change' | 'answer_update' | 'heartbeat' | 'session_start' | 'session_end';
  question_number?: number;
  timestamp: string;
  metadata?: any;
}

export const trackActivity = async (
  sessionId: string,
  activityType: SessionActivity['activity_type'],
  questionNumber?: number,
  metadata?: any
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return;

  try {
    const { error } = await supabase
      .from('test_session_tracking')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        activity_type: activityType,
        question_number: questionNumber,
        metadata: metadata
      });

    if (error) {
      console.error('Error tracking activity:', error);
    }
  } catch (error) {
    console.error('Failed to track activity:', error);
  }
};

export const startHeartbeat = (sessionId: string): NodeJS.Timeout => {
  return setInterval(() => {
    trackActivity(sessionId, 'heartbeat');
  }, 30000); // Send heartbeat every 30 seconds
};

export const stopHeartbeat = (heartbeatInterval: NodeJS.Timeout): void => {
  clearInterval(heartbeatInterval);
};

export const getSessionActivity = async (sessionId: string): Promise<SessionActivity[]> => {
  const { data, error } = await supabase
    .from('test_session_tracking')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp', { ascending: true });

  if (error) {
    console.error('Error fetching session activity:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    session_id: item.session_id || '',
    user_id: item.user_id,
    activity_type: item.activity_type as SessionActivity['activity_type'],
    question_number: item.question_number || undefined,
    timestamp: item.timestamp,
    metadata: item.metadata
  }));
};
