
import { useCallback, useRef } from 'react';

interface QuestionTimeData {
  questionNumber: number;
  timeSpent: number;
}

export const useQuestionTimer = () => {
  const questionTimersRef = useRef<Record<number, { startTime: number; totalTime: number }>>({});
  const currentQuestionRef = useRef<number | null>(null);

  const startTimer = useCallback((questionNumber: number) => {
    console.log('QuestionTimer: Starting timer for question', questionNumber);
    
    // Stop previous timer if exists
    if (currentQuestionRef.current !== null && currentQuestionRef.current !== questionNumber) {
      stopTimer();
    }
    
    // Initialize question timer if not exists
    if (!questionTimersRef.current[questionNumber]) {
      questionTimersRef.current[questionNumber] = {
        startTime: Date.now(),
        totalTime: 0
      };
    } else {
      // Resume timer
      questionTimersRef.current[questionNumber].startTime = Date.now();
    }
    
    currentQuestionRef.current = questionNumber;
    console.log('QuestionTimer: Timer started for question', questionNumber);
  }, []);

  const stopTimer = useCallback(() => {
    const currentQuestion = currentQuestionRef.current;
    if (currentQuestion === null) return;
    
    const timer = questionTimersRef.current[currentQuestion];
    if (!timer) return;
    
    const sessionTime = Date.now() - timer.startTime;
    timer.totalTime += Math.max(0, sessionTime);
    
    console.log('QuestionTimer: Stopped timer for question', currentQuestion, 'Session time:', sessionTime, 'Total time:', timer.totalTime);
    
    currentQuestionRef.current = null;
  }, []);

  const getTimeSpent = useCallback((questionNumber: number): number => {
    const timer = questionTimersRef.current[questionNumber];
    if (!timer) return 0;
    
    let totalTime = timer.totalTime;
    
    // Add current session time if this question is active
    if (currentQuestionRef.current === questionNumber) {
      const currentSessionTime = Date.now() - timer.startTime;
      totalTime += Math.max(0, currentSessionTime);
    }
    
    const timeInSeconds = Math.round(totalTime / 1000);
    console.log('QuestionTimer: Time spent on question', questionNumber, ':', timeInSeconds, 'seconds');
    return timeInSeconds;
  }, []);

  const getAllTimeData = useCallback((): QuestionTimeData[] => {
    // Stop current timer to get accurate data
    if (currentQuestionRef.current !== null) {
      stopTimer();
    }
    
    const timeData = Object.entries(questionTimersRef.current).map(([questionNum, timer]) => ({
      questionNumber: parseInt(questionNum, 10),
      timeSpent: Math.round(timer.totalTime / 1000)
    })).filter(data => data.timeSpent > 0);
    
    console.log('QuestionTimer: All time data:', timeData);
    return timeData;
  }, [stopTimer]);

  const resetTimers = useCallback(() => {
    console.log('QuestionTimer: Resetting all timers');
    questionTimersRef.current = {};
    currentQuestionRef.current = null;
  }, []);

  return {
    startTimer,
    stopTimer,
    getTimeSpent,
    getAllTimeData,
    resetTimers
  };
};
