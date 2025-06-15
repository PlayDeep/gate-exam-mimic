
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
  const currentQuestionRef = useRef(1);
  const timerCleanupRef = useRef<(() => void) | null>(null);
  
  const { 
    startTimer, 
    stopTimer, 
    getTimeSpent, 
    getAllTimeData 
  } = useQuestionTimer();

  // Timer management - prevent overlapping timers
  useEffect(() => {
    if (!isLoading && questionsLength > 0 && sessionId && !isSubmitting) {
      // Only manage timer if question actually changed
      if (currentQuestionRef.current !== currentQuestion) {
        console.log('TimerManager: Question changed from', currentQuestionRef.current, 'to', currentQuestion);
        
        // Clean up previous timer
        if (timerCleanupRef.current) {
          timerCleanupRef.current();
        }
        
        // Stop any existing timer
        stopTimer();
        
        // Start new timer
        startTimer(currentQuestion);
        currentQuestionRef.current = currentQuestion;
        
        // Store cleanup function
        timerCleanupRef.current = () => {
          stopTimer();
          timerCleanupRef.current = null;
        };
      }
    }
    
    // Cleanup function
    return () => {
      if (timerCleanupRef.current) {
        timerCleanupRef.current();
      }
    };
  }, [currentQuestion, isLoading, questionsLength, sessionId, isSubmitting, startTimer, stopTimer]);

  const cleanupTimers = () => {
    if (timerCleanupRef.current) {
      timerCleanupRef.current();
    }
  };

  return {
    getTimeSpent,
    getAllTimeData,
    cleanupTimers
  };
};
