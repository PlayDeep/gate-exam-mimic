
import { useCallback, useEffect, useMemo, useRef } from "react";
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
  
  // Stable refs to prevent unnecessary re-initialization
  const stableSessionIdRef = useRef(sessionId);
  const stableQuestionsRef = useRef(questions);
  const stableSubjectRef = useRef(subject);
  
  // Update refs only when values actually change
  useEffect(() => {
    stableSessionIdRef.current = sessionId;
  }, [sessionId]);
  
  useEffect(() => {
    stableQuestionsRef.current = questions;
  }, [questions]);
  
  useEffect(() => {
    stableSubjectRef.current = subject;
  }, [subject]);

  // Memoize the timer manager with stable dependencies
  const timerManagerProps = useMemo(() => ({
    currentQuestion,
    isLoading,
    questionsLength: questions.length,
    sessionId: stableSessionIdRef.current,
    isSubmitting
  }), [currentQuestion, isLoading, questions.length, isSubmitting]);

  const { getTimeSpent, getAllTimeData, cleanupTimers } = useExamTimerManager(timerManagerProps);

  // Ultra-stable submission props - use refs where possible
  const submissionProps = useMemo(() => {
    const questionTimeData = getAllTimeData();
    return {
      sessionId: stableSessionIdRef.current,
      questions: stableQuestionsRef.current,
      answers,
      timeLeft,
      subject: stableSubjectRef.current,
      questionTimeData
    };
  }, [answers, timeLeft, getAllTimeData]);

  const { submitExam, isSubmitting: submissionInProgress } = useSimpleExamSubmission(submissionProps);

  // Extremely stable callback for submission
  const performSubmission = useCallback(async (source: string) => {
    console.log(`ExamSubmissionHandler: Starting submission from ${source}`);
    
    if (!isMountedRef.current || submissionInProgress || !stableSessionIdRef.current || stableQuestionsRef.current.length === 0) {
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
  }, [submitExam, submissionInProgress, cleanupTimers, stopTimerForSubmission, isMountedRef]);

  // Stable callbacks with minimal dependencies
  const handleTimeUp = useCallback(async () => {
    console.log('ExamSubmissionHandler: Time up triggered');
    await performSubmission('time up');
  }, [performSubmission]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamSubmissionHandler: Submit button clicked');
    await performSubmission('manual submit');
  }, [performSubmission]);

  // Only sync submission states when actually different
  const lastSyncedSubmissionState = useRef(isSubmitting);
  useEffect(() => {
    if (isMountedRef.current && lastSyncedSubmissionState.current !== submissionInProgress) {
      console.log('ExamSubmissionHandler: Syncing submission state:', submissionInProgress);
      setIsSubmitting(submissionInProgress);
      lastSyncedSubmissionState.current = submissionInProgress;
    }
  }, [submissionInProgress, setIsSubmitting, isMountedRef]);

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
