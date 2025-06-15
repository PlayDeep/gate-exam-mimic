
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
  
  // Stable refs to prevent recreation
  const sessionIdRef = useRef(sessionId);
  const questionsRef = useRef(questions);
  const subjectRef = useRef(subject);
  const stopTimerRef = useRef(stopTimerForSubmission);
  
  // Only update refs when values actually change
  useEffect(() => {
    if (sessionIdRef.current !== sessionId) {
      console.log('ExamSubmissionHandler: Session ID changed from', sessionIdRef.current, 'to', sessionId);
      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);
  
  useEffect(() => {
    if (questionsRef.current !== questions) {
      console.log('ExamSubmissionHandler: Questions changed, updating ref');
      questionsRef.current = questions;
    }
  }, [questions]);
  
  useEffect(() => {
    if (subjectRef.current !== subject) {
      console.log('ExamSubmissionHandler: Subject changed from', subjectRef.current, 'to', subject);
      subjectRef.current = subject;
    }
  }, [subject]);
  
  useEffect(() => {
    stopTimerRef.current = stopTimerForSubmission;
  }, [stopTimerForSubmission]);

  // Create stable timer manager props - only depend on essential values
  const timerManagerProps = useMemo(() => ({
    currentQuestion,
    isLoading,
    questionsLength: questionsRef.current.length,
    sessionId: sessionIdRef.current,
    isSubmitting
  }), [currentQuestion, isLoading, isSubmitting]);

  const { getTimeSpent, getEnhancedTimeData, cleanupTimers } = useExamTimerManager(timerManagerProps);

  // Enhanced submission props with better time data and error handling
  const submissionProps = useMemo(() => {
    try {
      const enhancedTimeData = getEnhancedTimeData();
      console.log('ExamSubmissionHandler: Creating enhanced submission props:', {
        basicTimeData: enhancedTimeData.questionTimeData.length,
        totalSessionTime: enhancedTimeData.totalSessionTime,
        isTracking: enhancedTimeData.isCurrentlyTracking
      });
      
      return {
        sessionId: sessionIdRef.current,
        questions: questionsRef.current,
        answers,
        timeLeft,
        subject: subjectRef.current,
        questionTimeData: enhancedTimeData.questionTimeData || []
      };
    } catch (error) {
      console.error('ExamSubmissionHandler: Error creating submission props:', error);
      // Fallback to basic props without time data
      return {
        sessionId: sessionIdRef.current,
        questions: questionsRef.current,
        answers,
        timeLeft,
        subject: subjectRef.current,
        questionTimeData: []
      };
    }
  }, [answers, timeLeft, getEnhancedTimeData]);

  const { submitExam, isSubmitting: submissionInProgress } = useSimpleExamSubmission(submissionProps);

  // Enhanced submission callback with comprehensive logging and error handling
  const performSubmission = useCallback(async (source: string) => {
    console.log(`ExamSubmissionHandler: Enhanced submission from ${source}`);
    
    try {
      // Get final enhanced time data with error handling
      let finalEnhancedData;
      try {
        finalEnhancedData = getEnhancedTimeData();
      } catch (error) {
        console.error('ExamSubmissionHandler: Error getting enhanced time data:', error);
        finalEnhancedData = {
          questionTimeData: [],
          detailedTimeData: [],
          totalSessionTime: 0,
          isCurrentlyTracking: false,
          currentQuestion: currentQuestion
        };
      }
      
      console.log('ExamSubmissionHandler: Final enhanced time analytics:', {
        source,
        questionsWithTime: finalEnhancedData.questionTimeData.length,
        totalTime: finalEnhancedData.questionTimeData.reduce((sum, q) => sum + q.timeSpent, 0),
        sessionTime: finalEnhancedData.totalSessionTime,
        currentlyTracking: finalEnhancedData.isCurrentlyTracking,
        submissionState: {
          isMounted: isMountedRef.current,
          submissionInProgress,
          sessionId: sessionIdRef.current,
          questionsCount: questionsRef.current.length,
          answersCount: Object.keys(answers).length
        }
      });
      
      if (!isMountedRef.current || submissionInProgress || !sessionIdRef.current || questionsRef.current.length === 0) {
        console.log('ExamSubmissionHandler: Submission conditions not met, aborting');
        return;
      }
      
      // Stop all timers and get final data
      if (stopTimerRef.current) {
        console.log('ExamSubmissionHandler: Stopping main timer for submission');
        stopTimerRef.current();
      }
      
      let finalTimeData = [];
      try {
        finalTimeData = cleanupTimers();
        console.log('ExamSubmissionHandler: Final cleanup completed, time data:', {
          finalDataLength: finalTimeData.length,
          totalTimeTracked: finalTimeData.reduce((sum, q) => sum + q.timeSpent, 0)
        });
      } catch (error) {
        console.error('ExamSubmissionHandler: Error during timer cleanup:', error);
      }
      
      await submitExam();
      console.log('ExamSubmissionHandler: Enhanced submission completed successfully');
    } catch (error) {
      console.error(`ExamSubmissionHandler: Enhanced ${source} submission failed:`, error);
      throw error;
    }
  }, [submitExam, submissionInProgress, cleanupTimers, isMountedRef, answers, timeLeft, getEnhancedTimeData, currentQuestion]);

  const handleTimeUp = useCallback(async () => {
    console.log('ExamSubmissionHandler: Time up triggered');
    try {
      await performSubmission('time up');
    } catch (error) {
      console.error('ExamSubmissionHandler: Time up submission failed:', error);
    }
  }, [performSubmission]);

  const handleSubmit = useCallback(async () => {
    console.log('ExamSubmissionHandler: Submit button clicked');
    try {
      await performSubmission('manual submit');
    } catch (error) {
      console.error('ExamSubmissionHandler: Manual submission failed:', error);
    }
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
      try {
        cleanupTimers();
      } catch (error) {
        console.error('ExamSubmissionHandler: Error during unmount cleanup:', error);
      }
    };
  }, [cleanupTimers]);

  return {
    handleTimeUp,
    handleSubmit,
    getTimeSpent,
    submissionInProgress
  };
};
