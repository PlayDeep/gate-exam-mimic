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
    }
  }, []);

  useEffect(() => {
    // Clean up any existing timer first
    cleanupTimer();
    
    // Reset time up flag when starting new timer
    hasCalledTimeUpRef.current = false;
    
    // Don't start timer if loading, no session, or already called time up
    if (isLoading || !sessionId || timeLeft <= 0) {
      console.log('Timer: Not starting - isLoading:', isLoading, 'sessionId:', !!sessionId, 'timeLeft:', timeLeft);
      return;
    }
    
    console.log('Timer: Starting countdown timer with', timeLeft, 'seconds');
    
    timerRef.current = setInterval(() => {
      if (!isMountedRef.current) {
        cleanupTimer();
        return;
      }
      
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime <= 0 && !hasCalledTimeUpRef.current) {
          console.log('Timer: Time reached 0, triggering time up');
          // Use setTimeout to avoid calling during render
          setTimeout(() => handleTimeUp(), 0);
        }
        return newTime;
      });
    }, 1000);

    return cleanupTimer;
  }, [isLoading, sessionId, timeLeft, setTimeLeft, handleTimeUp, cleanupTimer]);

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
