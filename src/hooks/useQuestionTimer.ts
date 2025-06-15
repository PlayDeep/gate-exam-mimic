
import { useCallback, useRef } from 'react';

interface QuestionTimeData {
  questionNumber: number;
  timeSpent: number;
}

interface QuestionTimer {
  startTime: number;
  totalTime: number;
  sessionCount: number;
  lastUpdate: number;
}

export const useQuestionTimer = () => {
  const questionTimersRef = useRef<Record<number, QuestionTimer>>({});
  const currentQuestionRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  const startTimer = useCallback((questionNumber: number) => {
    console.log('QuestionTimer: Starting timer for question', questionNumber);
    
    const now = Date.now();
    
    // Stop previous timer if exists and different question
    if (currentQuestionRef.current !== null && currentQuestionRef.current !== questionNumber) {
      stopTimer();
    }
    
    // Initialize or update question timer
    if (!questionTimersRef.current[questionNumber]) {
      questionTimersRef.current[questionNumber] = {
        startTime: now,
        totalTime: 0,
        sessionCount: 1,
        lastUpdate: now
      };
    } else {
      // Resume timer - update start time and increment session count
      const timer = questionTimersRef.current[questionNumber];
      timer.startTime = now;
      timer.sessionCount += 1;
      timer.lastUpdate = now;
    }
    
    currentQuestionRef.current = questionNumber;
    console.log('QuestionTimer: Timer started for question', questionNumber, 'Sessions:', questionTimersRef.current[questionNumber].sessionCount);
  }, []);

  const stopTimer = useCallback(() => {
    const currentQuestion = currentQuestionRef.current;
    if (currentQuestion === null) return;
    
    const timer = questionTimersRef.current[currentQuestion];
    if (!timer) return;
    
    const now = Date.now();
    const sessionTime = Math.max(0, now - timer.startTime);
    
    // Only add time if session was meaningful (> 1 second)
    if (sessionTime > 1000) {
      timer.totalTime += sessionTime;
      timer.lastUpdate = now;
      
      console.log('QuestionTimer: Stopped timer for question', currentQuestion, {
        sessionTime: Math.round(sessionTime / 1000),
        totalTime: Math.round(timer.totalTime / 1000),
        sessions: timer.sessionCount
      });
    }
    
    currentQuestionRef.current = null;
  }, []);

  const getTimeSpent = useCallback((questionNumber: number): number => {
    const timer = questionTimersRef.current[questionNumber];
    if (!timer) return 0;
    
    let totalTime = timer.totalTime;
    
    // Add current session time if this question is active
    if (currentQuestionRef.current === questionNumber) {
      const currentSessionTime = Math.max(0, Date.now() - timer.startTime);
      // Only add if session is meaningful
      if (currentSessionTime > 1000) {
        totalTime += currentSessionTime;
      }
    }
    
    const timeInSeconds = Math.round(totalTime / 1000);
    return Math.max(0, timeInSeconds);
  }, []);

  const getAllTimeData = useCallback((): QuestionTimeData[] => {
    // Stop current timer to get accurate final data
    if (currentQuestionRef.current !== null) {
      stopTimer();
    }
    
    const timeData = Object.entries(questionTimersRef.current)
      .map(([questionNum, timer]) => ({
        questionNumber: parseInt(questionNum, 10),
        timeSpent: Math.max(0, Math.round(timer.totalTime / 1000))
      }))
      .filter(data => data.timeSpent > 0)
      .sort((a, b) => a.questionNumber - b.questionNumber);
    
    console.log('QuestionTimer: Final time data collected:', timeData);
    console.log('QuestionTimer: Total questions with time data:', timeData.length);
    
    return timeData;
  }, [stopTimer]);

  const getDetailedTimeData = useCallback(() => {
    return Object.entries(questionTimersRef.current).map(([questionNum, timer]) => ({
      questionNumber: parseInt(questionNum, 10),
      timeSpent: Math.max(0, Math.round(timer.totalTime / 1000)),
      sessions: timer.sessionCount,
      lastVisited: new Date(timer.lastUpdate).toISOString(),
      avgTimePerSession: timer.sessionCount > 0 ? Math.round(timer.totalTime / timer.sessionCount / 1000) : 0
    }));
  }, []);

  const resetTimers = useCallback(() => {
    console.log('QuestionTimer: Resetting all timers');
    // Stop current timer before reset
    if (currentQuestionRef.current !== null) {
      stopTimer();
    }
    questionTimersRef.current = {};
    currentQuestionRef.current = null;
    sessionStartRef.current = Date.now();
  }, [stopTimer]);

  const getTotalSessionTime = useCallback(() => {
    return Math.round((Date.now() - sessionStartRef.current) / 1000);
  }, []);

  return {
    startTimer,
    stopTimer,
    getTimeSpent,
    getAllTimeData,
    getDetailedTimeData,
    resetTimers,
    getTotalSessionTime
  };
};
