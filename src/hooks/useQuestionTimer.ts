
import { useState, useEffect, useRef } from 'react';

interface QuestionTimeData {
  [questionNumber: number]: {
    totalTime: number;
    startTime: number | null;
  };
}

export const useQuestionTimer = () => {
  const [questionTimes, setQuestionTimes] = useState<QuestionTimeData>({});
  const currentQuestionRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = (questionNumber: number) => {
    // Stop previous timer if exists
    if (currentQuestionRef.current !== null && startTimeRef.current !== null) {
      stopTimer();
    }

    // Initialize question time data if not exists
    if (!questionTimes[questionNumber]) {
      setQuestionTimes(prev => ({
        ...prev,
        [questionNumber]: {
          totalTime: 0,
          startTime: null
        }
      }));
    }

    // Start new timer
    currentQuestionRef.current = questionNumber;
    startTimeRef.current = Date.now();
    
    setQuestionTimes(prev => ({
      ...prev,
      [questionNumber]: {
        ...prev[questionNumber],
        startTime: Date.now()
      }
    }));
  };

  const stopTimer = () => {
    if (currentQuestionRef.current !== null && startTimeRef.current !== null) {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const questionNumber = currentQuestionRef.current;
      
      setQuestionTimes(prev => ({
        ...prev,
        [questionNumber]: {
          ...prev[questionNumber],
          totalTime: (prev[questionNumber]?.totalTime || 0) + timeSpent,
          startTime: null
        }
      }));
    }
    
    currentQuestionRef.current = null;
    startTimeRef.current = null;
  };

  const getTimeSpent = (questionNumber: number): number => {
    const questionTime = questionTimes[questionNumber];
    if (!questionTime) return 0;
    
    let totalTime = questionTime.totalTime;
    
    // Add current session time if timer is running for this question
    if (currentQuestionRef.current === questionNumber && startTimeRef.current) {
      totalTime += Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    
    return totalTime;
  };

  const getAllTimeData = () => {
    return Object.entries(questionTimes).map(([questionNumber, data]) => ({
      questionNumber: parseInt(questionNumber),
      timeSpent: getTimeSpent(parseInt(questionNumber))
    }));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return {
    startTimer,
    stopTimer,
    getTimeSpent,
    getAllTimeData,
    questionTimes
  };
};
