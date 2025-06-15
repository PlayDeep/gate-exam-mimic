
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
  isMountedRef
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
    console.log('ExamContainer: Syncing submission state:', submissionInProgress);
    setIsSubmitting(submissionInProgress);
  }, [submissionInProgress, setIsSubmitting]);

  const handleTimeUp = useCallback(async () => {
    console.log('ExamContainer: Time up triggered');
    
    if (!isMountedRef.current) {
      console.log('ExamContainer: Component not mounted, aborting time up');
      return;
    }
    
    if (submissionInProgress) {
      console.log('ExamContainer: Submission already in progress, aborting time up');
      return;
    }
    
    console.log('ExamContainer: Calling submitExam from time up');
    try {
      await submitExam();
    } catch (error) {
      console.error('ExamContainer: Time up submission failed:', error);
    }
  }, [submitExam, submissionInProgress, isMountedRef]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamContainer: Submit button clicked');
    console.log('Component mounted:', isMountedRef.current);
    console.log('Session ID:', sessionId);
    console.log('Questions count:', questions.length);
    console.log('Submission in progress:', submissionInProgress);
    
    // Enhanced validation
    if (!isMountedRef.current) {
      console.log('ExamContainer: Component not mounted');
      return;
    }

    if (!sessionId || questions.length === 0) {
      console.log('ExamContainer: Invalid state - sessionId:', !!sessionId, 'questions:', questions.length);
      return;
    }

    if (submissionInProgress) {
      console.log('ExamContainer: Submission already in progress');
      return;
    }

    // Cleanup timers before submission
    cleanupTimers();
    
    console.log('ExamContainer: Calling submitExam from submit button');
    try {
      await submitExam();
    } catch (error) {
      console.error('ExamContainer: Manual submission failed:', error);
    }
  }, [sessionId, questions.length, submissionInProgress, cleanupTimers, submitExam, isMountedRef]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('ExamContainer: Component unmounting, cleaning up timers');
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
