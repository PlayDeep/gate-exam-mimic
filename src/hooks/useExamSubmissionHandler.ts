
import { useCallback, useEffect } from "react";
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
  
  const { getTimeSpent, getAllTimeData, cleanupTimers } = useExamTimerManager({
    currentQuestion,
    isLoading,
    questionsLength: questions.length,
    sessionId,
    isSubmitting
  });

  const { submitExam, isSubmitting: submissionInProgress } = useSimpleExamSubmission({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    questionTimeData: getAllTimeData()
  });

  // Sync submission states
  useEffect(() => {
    console.log('ExamSubmissionHandler: Syncing submission state:', submissionInProgress);
    setIsSubmitting(submissionInProgress);
  }, [submissionInProgress, setIsSubmitting]);

  const performSubmission = useCallback(async (source: string) => {
    console.log(`ExamSubmissionHandler: Starting submission from ${source}`);
    
    if (!isMountedRef.current) {
      console.log('ExamSubmissionHandler: Component not mounted, aborting');
      return;
    }
    
    if (submissionInProgress) {
      console.log('ExamSubmissionHandler: Submission already in progress, aborting');
      return;
    }
    
    // Stop all timers before submission
    console.log('ExamSubmissionHandler: Stopping timers before submission');
    if (stopTimerForSubmission) {
      stopTimerForSubmission();
    }
    cleanupTimers();
    
    console.log('ExamSubmissionHandler: Calling submitExam');
    try {
      await submitExam();
      console.log('ExamSubmissionHandler: Submission completed successfully');
    } catch (error) {
      console.error(`ExamSubmissionHandler: ${source} submission failed:`, error);
    }
  }, [submitExam, submissionInProgress, cleanupTimers, stopTimerForSubmission, isMountedRef]);

  const handleTimeUp = useCallback(async () => {
    console.log('ExamSubmissionHandler: Time up triggered');
    await performSubmission('time up');
  }, [performSubmission]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamSubmissionHandler: Submit button clicked');
    console.log('Component mounted:', isMountedRef.current);
    console.log('Session ID:', sessionId);
    console.log('Questions count:', questions.length);
    console.log('Submission in progress:', submissionInProgress);
    
    // Enhanced validation
    if (!isMountedRef.current) {
      console.log('ExamSubmissionHandler: Component not mounted');
      return;
    }

    if (!sessionId || questions.length === 0) {
      console.log('ExamSubmissionHandler: Invalid state - sessionId:', !!sessionId, 'questions:', questions.length);
      return;
    }

    await performSubmission('manual submit');
  }, [sessionId, questions.length, performSubmission, submissionInProgress, isMountedRef]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('ExamSubmissionHandler: Component unmounting, cleaning up timers');
      cleanupTimers();
      isMountedRef.current = false;
    };
  }, [cleanupTimers, isMountedRef]);

  return {
    handleTimeUp,
    handleSubmit,
    getTimeSpent,
    submissionInProgress
  };
};
