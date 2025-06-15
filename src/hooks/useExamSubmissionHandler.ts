
import { useCallback, useEffect, useMemo } from "react";
import { useSimpleExamSubmission } from "@/hooks/useSimpleExamSubmission";
import { useExamTimerManager } from "@/hooks/useExamTimerManager";
import { Question } from "@/services/questionService";

interface UseExamSubmissionHandlerProps {
  sessionId: string;
  questions: Question[];
  answers: Record<number, string>;
  timeLeft: number;
  subject: string;
  currentQuestion: number;
  isLoading: boolean;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  isMountedRef: React.MutableRefObject<boolean>;
  stopTimerForSubmission?: () => void;
}

export const useExamSubmissionHandler = ({
  sessionId,
  questions,
  answers,
  timeLeft,
  subject,
  currentQuestion,
  isLoading,
  isSubmitting,
  setIsSubmitting,
  isMountedRef,
  stopTimerForSubmission
}: UseExamSubmissionHandlerProps) => {
  
  // Memoize the question time data to prevent constant re-initialization
  const { getTimeSpent, getAllTimeData, cleanupTimers } = useExamTimerManager({
    currentQuestion,
    isLoading,
    questionsLength: questions.length,
    sessionId,
    isSubmitting
  });

  // Stable memoized submission props - only update when actual values change
  const submissionProps = useMemo(() => ({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    questionTimeData: getAllTimeData()
  }), [sessionId, questions, answers, timeLeft, subject, getAllTimeData]);

  const { submitExam, isSubmitting: submissionInProgress } = useSimpleExamSubmission(submissionProps);

  // Stable callback for submission - memoize with stable dependencies
  const performSubmission = useCallback(async (source: string) => {
    console.log(`ExamSubmissionHandler: Starting submission from ${source}`);
    
    if (!isMountedRef.current || submissionInProgress || !sessionId || questions.length === 0) {
      console.log('ExamSubmissionHandler: Submission conditions not met, aborting');
      return;
    }
    
    // Stop all timers before submission
    if (stopTimerForSubmission) {
      stopTimerForSubmission();
    }
    cleanupTimers();
    
    try {
      await submitExam();
      console.log('ExamSubmissionHandler: Submission completed successfully');
    } catch (error) {
      console.error(`ExamSubmissionHandler: ${source} submission failed:`, error);
    }
  }, [submitExam, submissionInProgress, cleanupTimers, stopTimerForSubmission, isMountedRef, sessionId, questions.length]);

  // Stable callbacks
  const handleTimeUp = useCallback(async () => {
    console.log('ExamSubmissionHandler: Time up triggered');
    await performSubmission('time up');
  }, [performSubmission]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamSubmissionHandler: Submit button clicked');
    await performSubmission('manual submit');
  }, [performSubmission]);

  // Only sync submission states when actually different - prevent unnecessary updates
  useEffect(() => {
    if (isMountedRef.current && isSubmitting !== submissionInProgress) {
      console.log('ExamSubmissionHandler: Syncing submission state:', submissionInProgress);
      setIsSubmitting(submissionInProgress);
    }
  }, [submissionInProgress, setIsSubmitting, isMountedRef, isSubmitting]);

  // Cleanup effect - only run on unmount
  useEffect(() => {
    return () => {
      console.log('ExamSubmissionHandler: Component unmounting, cleaning up timers');
      cleanupTimers();
    };
  }, [cleanupTimers]);

  return {
    handleTimeUp,
    handleSubmit,
    getTimeSpent,
    submissionInProgress
  };
};
