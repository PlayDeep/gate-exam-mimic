
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
  
  // Use refs to prevent re-initialization on every render
  const sessionIdRef = useRef(sessionId);
  const questionsRef = useRef(questions);
  const subjectRef = useRef(subject);
  const stopTimerRef = useRef(stopTimerForSubmission);
  
  // Only update refs when values actually change
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);
  
  useEffect(() => {
    subjectRef.current = subject;
  }, [subject]);
  
  useEffect(() => {
    stopTimerRef.current = stopTimerForSubmission;
  }, [stopTimerForSubmission]);

  // Create stable timer manager props
  const timerManagerProps = useMemo(() => ({
    currentQuestion,
    isLoading,
    questionsLength: questions.length,
    sessionId,
    isSubmitting
  }), [currentQuestion, isLoading, questions.length, sessionId, isSubmitting]);

  const { getTimeSpent, getAllTimeData, cleanupTimers } = useExamTimerManager(timerManagerProps);

  // Create stable submission props
  const submissionProps = useMemo(() => ({
    sessionId: sessionIdRef.current,
    questions: questionsRef.current,
    answers,
    timeLeft,
    subject: subjectRef.current,
    questionTimeData: getAllTimeData()
  }), [answers, timeLeft, getAllTimeData]);

  const { submitExam, isSubmitting: submissionInProgress } = useSimpleExamSubmission(submissionProps);

  // Create stable submission callback
  const performSubmission = useCallback(async (source: string) => {
    console.log(`ExamSubmissionHandler: Starting submission from ${source}`);
    
    if (!isMountedRef.current || submissionInProgress || !sessionIdRef.current || questionsRef.current.length === 0) {
      console.log('ExamSubmissionHandler: Submission conditions not met, aborting');
      return;
    }
    
    // Stop all timers before submission
    if (stopTimerRef.current) {
      stopTimerRef.current();
    }
    cleanupTimers();
    
    try {
      await submitExam();
      console.log('ExamSubmissionHandler: Submission completed successfully');
    } catch (error) {
      console.error(`ExamSubmissionHandler: ${source} submission failed:`, error);
    }
  }, [submitExam, submissionInProgress, cleanupTimers, isMountedRef]);

  // Create stable handlers
  const handleTimeUp = useCallback(async () => {
    console.log('ExamSubmissionHandler: Time up triggered');
    await performSubmission('time up');
  }, [performSubmission]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamSubmissionHandler: Submit button clicked');
    await performSubmission('manual submit');
  }, [performSubmission]);

  // Sync submission states only when different
  useEffect(() => {
    if (isMountedRef.current && isSubmitting !== submissionInProgress) {
      console.log('ExamSubmissionHandler: Syncing submission state:', submissionInProgress);
      setIsSubmitting(submissionInProgress);
    }
  }, [submissionInProgress, setIsSubmitting, isMountedRef, isSubmitting]);

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      console.log('ExamSubmissionHandler: Component unmounting, cleaning up timers');
      cleanupTimers();
    };
  }, []); // Empty dependency array - only run on unmount

  return {
    handleTimeUp,
    handleSubmit,
    getTimeSpent,
    submissionInProgress
  };
};
