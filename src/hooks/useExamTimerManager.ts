
import { useEffect, useRef, useCallback } from 'react';
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
  const lastQuestionRef = useRef(0);
  
  const { 
    startTimer, 
    stopTimer, 
    getTimeSpent, 
    getAllTimeData,
    getDetailedTimeData,
    resetTimers,
    getTotalSessionTime
  } = useQuestionTimer();

  // Enhanced session management
  useEffect(() => {
    if (sessionId && sessionId !== sessionIdRef.current) {
      console.log('TimerManager: New session detected, resetting timers');
      console.log('TimerManager: Previous session:', sessionIdRef.current);
      console.log('TimerManager: New session:', sessionId);
      
      // Reset all timers for new session
      resetTimers();
      currentQuestionRef.current = 0;
      lastQuestionRef.current = 0;
      isActiveRef.current = false;
      sessionIdRef.current = sessionId;
    }
  }, [sessionId, resetTimers]);

  // Enhanced question timer management
  useEffect(() => {
    // Skip if not ready
    if (isLoading || !sessionId || questionsLength === 0 || isSubmitting) {
      if (isActiveRef.current) {
        console.log('TimerManager: Pausing timer due to conditions:', {
          isLoading,
          sessionId: !!sessionId,
          questionsLength,
          isSubmitting
        });
        stopTimer();
        isActiveRef.current = false;
      }
      return;
    }

    // Only process if question actually changed
    if (currentQuestionRef.current !== currentQuestion) {
      console.log('TimerManager: Question transition:', {
        from: currentQuestionRef.current,
        to: currentQuestion,
        wasActive: isActiveRef.current
      });
      
      // Stop current timer if running
      if (isActiveRef.current) {
        console.log('TimerManager: Stopping timer for question', currentQuestionRef.current);
        stopTimer();
      }
      
      // Start timer for new question
      if (currentQuestion > 0 && currentQuestion <= questionsLength) {
        console.log('TimerManager: Starting timer for question', currentQuestion);
        startTimer(currentQuestion);
        isActiveRef.current = true;
        currentQuestionRef.current = currentQuestion;
        lastQuestionRef.current = currentQuestion;
      }
    }
  }, [currentQuestion, isLoading, questionsLength, sessionId, isSubmitting, startTimer, stopTimer]);

  // Enhanced cleanup with better logging
  const cleanupTimers = useCallback(() => {
    console.log('TimerManager: Comprehensive cleanup initiated');
    console.log('TimerManager: Current state:', {
      currentQuestion: currentQuestionRef.current,
      isActive: isActiveRef.current,
      lastQuestion: lastQuestionRef.current,
      sessionId: sessionIdRef.current
    });
    
    if (isActiveRef.current) {
      console.log('TimerManager: Stopping active timer before cleanup');
      stopTimer();
      isActiveRef.current = false;
    }
    
    // Get final time data before cleanup
    const finalTimeData = getAllTimeData();
    console.log('TimerManager: Final time data before cleanup:', {
      questionsWithTime: finalTimeData.length,
      totalTime: finalTimeData.reduce((sum, q) => sum + q.timeSpent, 0)
    });
    
    return finalTimeData;
  }, [stopTimer, getAllTimeData]);

  // Enhanced time data retrieval with validation
  const getEnhancedTimeData = useCallback(() => {
    const timeData = getAllTimeData();
    const detailedData = getDetailedTimeData();
    const totalSessionTime = getTotalSessionTime();
    
    console.log('TimerManager: Enhanced time data retrieved:', {
      basicTimeData: timeData.length,
      detailedData: detailedData.length,
      totalSessionTime,
      currentlyActive: isActiveRef.current,
      currentQuestion: currentQuestionRef.current
    });
    
    return {
      questionTimeData: timeData,
      detailedTimeData: detailedData,
      totalSessionTime,
      isCurrentlyTracking: isActiveRef.current,
      currentQuestion: currentQuestionRef.current
    };
  }, [getAllTimeData, getDetailedTimeData, getTotalSessionTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('TimerManager: Component unmounting, performing cleanup');
      cleanupTimers();
    };
  }, [cleanupTimers]);

  return {
    getTimeSpent,
    getAllTimeData,
    getEnhancedTimeData,
    cleanupTimers,
    isActivelyTracking: isActiveRef.current,
    currentTrackedQuestion: currentQuestionRef.current
  };
};
