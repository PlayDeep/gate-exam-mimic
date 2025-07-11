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
  const isSubmittingRef = useRef(false);
  const lastSessionIdRef = useRef<string>('');

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
    if (!hasCalledTimeUpRef.current && isMountedRef.current && !isSubmittingRef.current) {
      console.log('Timer: Time is up, calling onTimeUp callback');
      hasCalledTimeUpRef.current = true;
      isSubmittingRef.current = true;
      
      // Clean up timer immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        isTimerActiveRef.current = false;
      }
      
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

  const stopTimerForSubmission = useCallback(() => {
    console.log('Timer: Stopping timer for submission');
    isSubmittingRef.current = true;
    cleanupTimer();
  }, [cleanupTimer]);

  const startTimer = useCallback(() => {
    // Prevent multiple timers or starting during submission
    if (isTimerActiveRef.current || isSubmittingRef.current) {
      return;
    }

    console.log('Timer: Starting countdown timer with', timeLeft, 'seconds');
    isTimerActiveRef.current = true;
    
    timerRef.current = setInterval(() => {
      if (!isMountedRef.current || isSubmittingRef.current) {
        cleanupTimer();
        return;
      }
      
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime <= 0 && !hasCalledTimeUpRef.current && !isSubmittingRef.current) {
          console.log('Timer: Time reached 0, triggering time up');
          setTimeout(() => handleTimeUp(), 0);
        }
        return newTime;
      });
    }, 1000);
  }, [timeLeft, setTimeLeft, handleTimeUp, cleanupTimer]);

  // Reset flags when session changes
  useEffect(() => {
    if (sessionId && sessionId !== lastSessionIdRef.current) {
      console.log('Timer: New session detected, resetting flags');
      hasCalledTimeUpRef.current = false;
      isSubmittingRef.current = false;
      lastSessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  // Main timer effect - only start when conditions are met and avoid re-starting
  useEffect(() => {
    // Don't start timer if loading, no session, time is up, or already running
    if (isLoading || !sessionId || timeLeft <= 0 || hasCalledTimeUpRef.current || isSubmittingRef.current || isTimerActiveRef.current) {
      return;
    }
    
    startTimer();
    
    // Only cleanup on unmount or when session changes
    return () => {
      if (!isMountedRef.current || sessionId !== lastSessionIdRef.current) {
        cleanupTimer();
      }
    };
  }, [isLoading, sessionId, startTimer, cleanupTimer]); // Removed timeLeft from dependencies to prevent recreation

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
    formattedTime: formatTime(timeLeft),
    stopTimerForSubmission
  };
};
