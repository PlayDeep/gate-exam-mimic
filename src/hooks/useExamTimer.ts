import { useEffect, useRef, useCallback } from 'react';

interface UseExamTimerProps {
  timeLeft: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  isLoading: boolean;
  sessionId: string;
  onTimeUp: () => void;
}

export const useExamTimer = ({
  timeLeft,
  setTimeLeft,
  isLoading,
  sessionId,
  onTimeUp
}: UseExamTimerProps) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  const hasCalledTimeUpRef = useRef(false);
  const isMountedRef = useRef(true);
  const isTimerActiveRef = useRef(false);

  // Keep onTimeUp reference current
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleTimeUp = useCallback(() => {
    if (!hasCalledTimeUpRef.current && isMountedRef.current) {
      console.log('Timer: Time is up, calling onTimeUp callback');
      hasCalledTimeUpRef.current = true;
      onTimeUpRef.current();
    }
  }, []);

  const cleanupTimer = useCallback(() => {
    if (timerRef.current) {
      console.log('Timer: Cleaning up timer');
      clearInterval(timerRef.current);
      timerRef.current = null;
      isTimerActiveRef.current = false;
    }
  }, []);

  const startTimer = useCallback(() => {
    // Prevent multiple timers
    if (isTimerActiveRef.current) {
      console.log('Timer: Already active, skipping start');
      return;
    }

    console.log('Timer: Starting countdown timer with', timeLeft, 'seconds');
    isTimerActiveRef.current = true;
    
    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        cleanupTimer();
        return;
      }
      
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime <= 0 && !hasCalledTimeUpRef.current) {
          console.log('Timer: Time reached 0, triggering time up');
          setTimeout(() => handleTimeUp(), 0);
        }
        return newTime;
      });
    }, 1000);
  }, [timeLeft, setTimeLeft, handleTimeUp, cleanupTimer]);

  // Main timer effect - only start when conditions are met
  useEffect(() => {
    // Clean up any existing timer first
    cleanupTimer();
    
    // Reset time up flag when starting new session
    if (sessionId) {
      hasCalledTimeUpRef.current = false;
    }
    
    // Don't start timer if loading, no session, already called time up, or time is up
    if (isLoading || !sessionId || timeLeft <= 0 || hasCalledTimeUpRef.current) {
      console.log('Timer: Not starting - isLoading:', isLoading, 'sessionId:', !!sessionId, 'timeLeft:', timeLeft, 'hasCalledTimeUp:', hasCalledTimeUpRef.current);
      return;
    }
    
    startTimer();
    return cleanupTimer;
  }, [isLoading, sessionId, startTimer, cleanupTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupTimer;
  }, [cleanupTimer]);

  const formatTime = (seconds: number) => {
    const validSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(validSeconds / 3600);
    const minutes = Math.floor((validSeconds % 3600) / 60);
    const secs = validSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    formattedTime: formatTime(timeLeft)
  };
};
