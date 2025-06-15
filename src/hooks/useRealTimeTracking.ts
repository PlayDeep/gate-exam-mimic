
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackActivity, startHeartbeat, stopHeartbeat } from '@/services/testTrackingService';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealTimeTrackingProps {
  sessionId: string;
  isActive: boolean;
}

interface TestSessionPayload {
  new?: {
    is_submitted?: boolean;
    [key: string]: any;
  };
  old?: {
    is_submitted?: boolean;
    [key: string]: any;
  };
}

export const useRealTimeTracking = ({ sessionId, isActive }: UseRealTimeTrackingProps) => {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!sessionId || !isActive) return;

    // Start session tracking
    trackActivity(sessionId, 'session_start');

    // Start heartbeat
    heartbeatIntervalRef.current = startHeartbeat(sessionId);

    // Set up real-time channel for monitoring
    channelRef.current = supabase
      .channel(`test_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload: TestSessionPayload) => {
          console.log('Test session change:', payload);
          
          // Check if session was force-submitted by admin
          if (payload.new?.is_submitted && !payload.old?.is_submitted) {
            console.log('Session was submitted by admin');
            // Could show a notification or redirect user
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'test_session_tracking',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New tracking activity:', payload);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      // Track session end
      trackActivity(sessionId, 'session_end');
      
      // Stop heartbeat
      if (heartbeatIntervalRef.current) {
        stopHeartbeat(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }

      // Unsubscribe from channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, isActive]);

  const trackQuestionChange = (questionNumber: number) => {
    if (sessionId && isActive) {
      trackActivity(sessionId, 'question_change', questionNumber);
    }
  };

  const trackAnswerUpdate = (questionNumber: number, answer: string) => {
    if (sessionId && isActive) {
      trackActivity(sessionId, 'answer_update', questionNumber, { answer });
    }
  };

  return {
    trackQuestionChange,
    trackAnswerUpdate
  };
};
