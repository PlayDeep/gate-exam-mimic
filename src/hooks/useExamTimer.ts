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

  // Keep onTimeUp reference current to avoid stale closures
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const handleTimeUp = useCallback(() => {
    console.log('Timer: Time is up, calling onTimeUp callback');
    onTimeUpRef.current();
  }, []);

  useEffect(() => {
    // Don't start timer if loading or no session
    if (isLoading || !sessionId) {
      console.log('Timer: Not starting - isLoading:', isLoading, 'sessionId:', !!sessionId);
      return;
    }
    
    console.log('Timer: Starting countdown timer with', timeLeft, 'seconds');
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log('Timer: Time reached 0, triggering time up');
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        console.log('Timer: Cleaning up timer');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoading, sessionId, setTimeLeft, handleTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    formattedTime: formatTime(timeLeft)
  };
};
