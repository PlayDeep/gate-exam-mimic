
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
  
  console.log('ExamSubmissionHandler: Initializing with:', {
    sessionId,
    questionsCount: questions.length,
    answersCount: Object.keys(answers).length,
    timeLeft,
    subject,
    isSubmitting
  });

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
    console.log('ExamSubmissionHandler: Syncing submission state:', {
      submissionInProgress,
      isSubmitting,
      mounted: isMountedRef.current
    });
    if (isMountedRef.current) {
      setIsSubmitting(submissionInProgress);
    }
  }, [submissionInProgress, setIsSubmitting, isMountedRef]);

  const performSubmission = useCallback(async (source: string) => {
    console.log(`ExamSubmissionHandler: Starting submission from ${source}`);
    console.log('Current state:', {
      mounted: isMountedRef.current,
      submissionInProgress,
      sessionId,
      questionsLength: questions.length,
      answersCount: Object.keys(answers).length
    });
    
    if (!isMountedRef.current) {
      console.log('ExamSubmissionHandler: Component not mounted, aborting');
      return;
    }
    
    if (submissionInProgress) {
      console.log('ExamSubmissionHandler: Submission already in progress, aborting');
      return;
    }

    if (!sessionId) {
      console.error('ExamSubmissionHandler: No session ID available');
      return;
    }

    if (questions.length === 0) {
      console.error('ExamSubmissionHandler: No questions available');
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
  }, [submitExam, submissionInProgress, cleanupTimers, stopTimerForSubmission, isMountedRef, sessionId, questions.length, answers]);

  const handleTimeUp = useCallback(async () => {
    console.log('ExamSubmissionHandler: Time up triggered');
    await performSubmission('time up');
  }, [performSubmission]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamSubmissionHandler: Submit button clicked');
    console.log('Component state:', {
      mounted: isMountedRef.current,
      sessionId: !!sessionId,
      questionsCount: questions.length,
      submissionInProgress,
      timeLeft
    });
    
    // Enhanced validation
    if (!isMountedRef.current) {
      console.error('ExamSubmissionHandler: Component not mounted');
      return;
    }

    if (!sessionId || questions.length === 0) {
      console.error('ExamSubmissionHandler: Invalid state - sessionId:', !!sessionId, 'questions:', questions.length);
      return;
    }

    await performSubmission('manual submit');
  }, [sessionId, questions.length, performSubmission, submissionInProgress, isMountedRef, timeLeft]);

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
