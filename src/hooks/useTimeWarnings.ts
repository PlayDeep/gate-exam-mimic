
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseTimeWarningsProps {
  timeLeft: number;
  isLoading: boolean;
  isSubmitting: boolean;
}

export const useTimeWarnings = ({ timeLeft, isLoading, isSubmitting }: UseTimeWarningsProps) => {
  const { toast } = useToast();
  const warningsShown = useRef({
    oneHour: false,
    thirtyMinutes: false,
    tenMinutes: false,
    fiveMinutes: false,
    oneMinute: false
  });

  useEffect(() => {
    if (isLoading || isSubmitting) return;

    const oneHour = 60 * 60;
    const thirtyMinutes = 30 * 60;
    const tenMinutes = 10 * 60;
    const fiveMinutes = 5 * 60;
    const oneMinute = 60;

    if (timeLeft <= oneHour && !warningsShown.current.oneHour && timeLeft > thirtyMinutes) {
      warningsShown.current.oneHour = true;
      toast({
        title: "Time Warning",
        description: "1 hour remaining in your exam",
        variant: "default"
      });
    }

    if (timeLeft <= thirtyMinutes && !warningsShown.current.thirtyMinutes && timeLeft > tenMinutes) {
      warningsShown.current.thirtyMinutes = true;
      toast({
        title: "Time Warning",
        description: "30 minutes remaining in your exam",
        variant: "default"
      });
    }

    if (timeLeft <= tenMinutes && !warningsShown.current.tenMinutes && timeLeft > fiveMinutes) {
      warningsShown.current.tenMinutes = true;
      toast({
        title: "Time Warning",
        description: "Only 10 minutes left! Please review your answers.",
        variant: "destructive"
      });
    }

    if (timeLeft <= fiveMinutes && !warningsShown.current.fiveMinutes && timeLeft > oneMinute) {
      warningsShown.current.fiveMinutes = true;
      toast({
        title: "Critical Time Warning",
        description: "Only 5 minutes remaining!",
        variant: "destructive"
      });
    }

    if (timeLeft <= oneMinute && !warningsShown.current.oneMinute) {
      warningsShown.current.oneMinute = true;
      toast({
        title: "Final Warning",
        description: "Less than 1 minute left! Exam will auto-submit soon.",
        variant: "destructive"
      });
    }
  }, [timeLeft, isLoading, isSubmitting, toast]);
};
