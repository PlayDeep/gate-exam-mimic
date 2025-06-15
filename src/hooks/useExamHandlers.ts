
import { useMemo, useRef, useEffect } from "react";
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

  // Use refs for values that should remain stable across renders
  const stablePropsRef = useRef({
    sessionId,
    questions,
    subject,
    updateAnswer,
    clearAnswer,
    toggleMarkForReview,
    navigateToQuestion,
    nextQuestion,
    previousQuestion
  });

  // Update refs only when values actually change
  useEffect(() => {
    stablePropsRef.current = {
      sessionId,
      questions,
      subject,
      updateAnswer,
      clearAnswer,
      toggleMarkForReview,
      navigateToQuestion,
      nextQuestion,
      previousQuestion
    };
  }, [sessionId, questions, subject, updateAnswer, clearAnswer, toggleMarkForReview, navigateToQuestion, nextQuestion, previousQuestion]);

  // Memoize submission handler props with ultra-stable dependencies
  const submissionHandlerProps = useMemo(() => ({
    sessionId: stablePropsRef.current.sessionId,
    questions: stablePropsRef.current.questions,
    answers,
    timeLeft,
    subject: stablePropsRef.current.subject,
    currentQuestion,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    isMountedRef
  }), [answers, timeLeft, currentQuestion, isLoading, isSubmitting, setIsSubmitting, isMountedRef]);

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

  // Stable answer handler props - use ref values
  const answerHandlerProps = useMemo(() => ({
    sessionId: stablePropsRef.current.sessionId,
    questions: stablePropsRef.current.questions,
    updateAnswer: stablePropsRef.current.updateAnswer,
    getTimeSpent
  }), [getTimeSpent]);

  const { handleAnswerChange } = useExamAnswerHandler(answerHandlerProps);

  // Stable navigation handler props - use ref values
  const navigationHandlerProps = useMemo(() => ({
    currentQuestion,
    totalQuestions,
    isLoading,
    isSubmitting: submissionInProgress,
    navigateToQuestion: stablePropsRef.current.navigateToQuestion,
    nextQuestion: stablePropsRef.current.nextQuestion,
    previousQuestion: stablePropsRef.current.previousQuestion
  }), [currentQuestion, totalQuestions, isLoading, submissionInProgress]);

  const { handleQuestionNavigation, handleNext, handlePrevious } = useExamNavigationHandler(navigationHandlerProps);

  const { toggleFullscreen } = useExamFullscreen({ setIsFullscreen });

  // Stable confirmation handler props - use ref values
  const confirmationHandlerProps = useMemo(() => ({
    currentQuestion,
    clearAnswer: stablePropsRef.current.clearAnswer,
    toggleMarkForReview: stablePropsRef.current.toggleMarkForReview,
    handleSubmit
  }), [currentQuestion, handleSubmit]);

  const confirmationHandlers = useExamConfirmationHandlers(confirmationHandlerProps);

  // Time warnings hook - stable props
  const timeWarningsProps = useMemo(() => ({
    timeLeft,
    isLoading,
    isSubmitting: submissionInProgress
  }), [timeLeft, isLoading, submissionInProgress]);

  useTimeWarnings(timeWarningsProps);

  // Keyboard navigation hook - stable props
  const keyboardNavProps = useMemo(() => ({
    currentQuestion,
    totalQuestions,
    isLoading,
    isSubmitting: submissionInProgress,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onMarkForReview: confirmationHandlers.handleMarkForReview,
    onClearResponse: confirmationHandlers.handleClearResponse
  }), [currentQuestion, totalQuestions, isLoading, submissionInProgress, handleNext, handlePrevious, confirmationHandlers.handleMarkForReview, confirmationHandlers.handleClearResponse]);

  useKeyboardNavigation(keyboardNavProps);

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
