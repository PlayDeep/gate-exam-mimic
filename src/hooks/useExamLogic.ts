
import { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";
import { useRealTimeTracking } from "@/hooks/useRealTimeTracking";
import { useExamInitialization } from "@/hooks/useExamInitialization";
import { useExamSubmission } from "@/hooks/useExamSubmission";
import { useExamNavigation } from "@/hooks/useExamNavigation";
import { useExamAnswers } from "@/hooks/useExamAnswers";

interface UseExamLogicProps {
  subject: string | undefined;
  timeLeft: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  currentQuestion: number;
  setCurrentQuestion: (value: number) => void;
  answers: Record<number, string>;
  setAnswers: (value: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
  markedForReview: Set<number>;
  setMarkedForReview: (value: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  questions: any[];
  setQuestions: (value: any[]) => void;
  sessionId: string;
  setSessionId: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  totalQuestions: number;
}

export const useExamLogic = ({
  subject,
  timeLeft,
  setTimeLeft,
  currentQuestion,
  setCurrentQuestion,
  answers,
  setAnswers,
  markedForReview,
  setMarkedForReview,
  isFullscreen,
  setIsFullscreen,
  questions,
  setQuestions,
  sessionId,
  setSessionId,
  isLoading,
  setIsLoading,
  totalQuestions
}: UseExamLogicProps) => {
  const { user, loading } = useAuth();
  const { startTimer, stopTimer, getTimeSpent } = useQuestionTimer();
  
  // Only initialize real-time tracking when we have a valid session and exam is loaded
  const { trackQuestionChange } = useRealTimeTracking({ 
    sessionId, 
    isActive: !isLoading && sessionId !== '' && totalQuestions > 0 
  });

  // Initialize exam (authentication, questions loading, session creation)
  useExamInitialization({
    subject,
    user,
    loading,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    setQuestions
  });

  // Handle exam submission
  const { handleSubmitExam, isSubmitting } = useExamSubmission({
    sessionId,
    user,
    questions,
    answers,
    timeLeft,
    totalQuestions,
    subject
  });

  // Handle navigation
  const { handleNext, handlePrevious, navigateToQuestion } = useExamNavigation({
    currentQuestion,
    setCurrentQuestion,
    totalQuestions,
    isLoading
  });

  // Handle answers and marking for review
  const { handleAnswerChange, handleMarkForReview } = useExamAnswers({
    sessionId,
    questions,
    answers,
    setAnswers,
    markedForReview,
    setMarkedForReview,
    isLoading
  });

  // Start timer for first question when exam loads and handle question changes
  useEffect(() => {
    if (!isLoading && totalQuestions > 0 && currentQuestion > 0) {
      console.log('Starting timer for question:', currentQuestion);
      startTimer(currentQuestion);
      
      // Only track question changes if we have a valid session
      if (sessionId) {
        trackQuestionChange(currentQuestion);
      }
    }
  }, [currentQuestion, isLoading, totalQuestions, startTimer, trackQuestionChange, sessionId]);

  // Timer effect
  useEffect(() => {
    if (isLoading || !sessionId) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, sessionId, setTimeLeft, handleSubmitExam]);

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsFullscreen]);

  // Prevent navigation away from test
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isLoading && sessionId) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isLoading, sessionId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const openCalculator = () => {
    window.open('https://www.tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html#nogo', '_blank');
  };

  return {
    handleAnswerChange,
    handleMarkForReview,
    handleSubmitExam,
    toggleFullscreen,
    openCalculator,
    handleNext,
    handlePrevious,
    navigateToQuestion,
    getTimeSpent,
    isSubmitting
  };
};
