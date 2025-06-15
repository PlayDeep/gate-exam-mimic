
import { useMemo } from "react";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useExamAnswerHandler } from "@/hooks/useExamAnswerHandler";
import { useExamNavigationHandler } from "@/hooks/useExamNavigationHandler";
import { useExamFullscreen } from "@/hooks/useExamFullscreen";
import { useExamSubmissionHandler } from "@/hooks/useExamSubmissionHandler";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useTimeWarnings } from "@/hooks/useTimeWarnings";
import { useExamConfirmationHandlers } from "@/hooks/useExamConfirmationHandlers";
import { Question } from "@/services/questionService";

interface UseExamHandlersProps {
  sessionId: string;
  questions: Question[];
  subject: string;
  timeLeft: number;
  setTimeLeft: (value: number) => void;
  currentQuestion: number;
  answers: Record<number, string>;
  markedForReview: Set<number>;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  totalQuestions: number;
  clearAnswer: (questionNum: number) => void;
  navigateToQuestion: (questionNum: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  toggleMarkForReview: (questionNum: number) => void;
  updateAnswer: (questionNum: number, answer: string) => void;
  isMountedRef: React.MutableRefObject<boolean>;
}

export const useExamHandlers = (props: UseExamHandlersProps) => {
  const {
    sessionId,
    questions,
    subject,
    timeLeft,
    setTimeLeft,
    currentQuestion,
    answers,
    isFullscreen,
    setIsFullscreen,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    totalQuestions,
    clearAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    toggleMarkForReview,
    updateAnswer,
    isMountedRef
  } = props;

  // Memoize submission handler props to prevent re-creation
  const submissionHandlerProps = useMemo(() => ({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    currentQuestion,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    isMountedRef
  }), [sessionId, questions, answers, timeLeft, subject, currentQuestion, isLoading, isSubmitting, setIsSubmitting, isMountedRef]);

  const {
    handleTimeUp,
    handleSubmit,
    getTimeSpent,
    submissionInProgress
  } = useExamSubmissionHandler({
    ...submissionHandlerProps,
    stopTimerForSubmission: () => {} // Will be set by timer
  });

  const { formattedTime, stopTimerForSubmission } = useExamTimer({
    timeLeft,
    setTimeLeft,
    isLoading: isLoading || questions.length === 0,
    sessionId,
    onTimeUp: handleTimeUp
  });

  const { handleAnswerChange } = useExamAnswerHandler({
    sessionId,
    questions,
    updateAnswer,
    getTimeSpent
  });

  const { handleQuestionNavigation, handleNext, handlePrevious } = useExamNavigationHandler({
    currentQuestion,
    totalQuestions,
    isLoading,
    isSubmitting: submissionInProgress,
    navigateToQuestion,
    nextQuestion,
    previousQuestion
  });

  const { toggleFullscreen } = useExamFullscreen({ setIsFullscreen });

  const confirmationHandlers = useExamConfirmationHandlers({
    currentQuestion,
    clearAnswer,
    toggleMarkForReview,
    handleSubmit
  });

  // Time warnings hook
  useTimeWarnings({
    timeLeft,
    isLoading,
    isSubmitting: submissionInProgress
  });

  // Keyboard navigation hook
  useKeyboardNavigation({
    currentQuestion,
    totalQuestions,
    isLoading,
    isSubmitting: submissionInProgress,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onMarkForReview: confirmationHandlers.handleMarkForReview,
    onClearResponse: confirmationHandlers.handleClearResponse
  });

  return {
    formattedTime,
    handleAnswerChange,
    handleQuestionNavigation,
    handleNext,
    handlePrevious,
    toggleFullscreen,
    submissionInProgress,
    ...confirmationHandlers
  };
};
