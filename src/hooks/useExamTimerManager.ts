
import { useEffect, useRef } from 'react';
import { useQuestionTimer } from '@/hooks/useQuestionTimer';

interface UseExamTimerManagerProps {
  currentQuestion: number;
  isLoading: boolean;
  questionsLength: number;
  sessionId: string;
  isSubmitting: boolean;
}

export const useExamTimerManager = ({
  currentQuestion,
  isLoading,
  questionsLength,
  sessionId,
  isSubmitting
}: UseExamTimerManagerProps) => {
  const currentQuestionRef = useRef(0);
  const isActiveRef = useRef(false);
  const sessionIdRef = useRef('');
  
  const { 
    startTimer, 
    stopTimer, 
    getTimeSpent, 
    getAllTimeData 
  } = useQuestionTimer();

  // Reset when session changes
  useEffect(() => {
    if (sessionId && sessionId !== sessionIdRef.current) {
      console.log('TimerManager: New session, resetting question timer');
      currentQuestionRef.current = 0;
      isActiveRef.current = false;
      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  // Manage question timer based on current question
  useEffect(() => {
    // Don't start timer if conditions aren't met
    if (isLoading || !sessionId || questionsLength === 0 || isSubmitting) {
      if (isActiveRef.current) {
        console.log('TimerManager: Stopping timer due to conditions');
        stopTimer();
        isActiveRef.current = false;
      }
      return;
    }

    // Only change timer if question actually changed
    if (currentQuestionRef.current !== currentQuestion) {
      console.log('TimerManager: Question changed from', currentQuestionRef.current, 'to', currentQuestion);
      
      // Stop previous timer if running
      if (isActiveRef.current) {
        stopTimer();
      }
      
      // Start new timer for current question
      startTimer(currentQuestion);
      currentQuestionRef.current = currentQuestion;
      isActiveRef.current = true;
    }
  }, [currentQuestion, isLoading, questionsLength, sessionId, isSubmitting, startTimer, stopTimer]);

  const cleanupTimers = () => {
    console.log('TimerManager: Cleanup called');
    if (isActiveRef.current) {
      stopTimer();
      isActiveRef.current = false;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('TimerManager: Component unmounting');
      cleanupTimers();
    };
  }, []);

  return {
    getTimeSpent,
    getAllTimeData,
    cleanupTimers
  };
};
