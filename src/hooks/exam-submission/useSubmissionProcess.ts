
import { useCallback } from 'react';
import { Question } from '@/services/questionService';
import { submitTestSession } from '@/services/testService';
import { useToast } from '@/hooks/use-toast';
import { useSubmissionValidation } from './useSubmissionValidation';
import { useResultsCalculation } from './useResultsCalculation';
import { useSubmissionNavigation } from './useSubmissionNavigation';
import { useSubmissionLock } from './useSubmissionLock';

interface UseSubmissionProcessProps {
  sessionId: string;
  questions: Question[];
  answers: Record<number, string>;
  timeLeft: number;
  subject?: string;
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

export const useSubmissionProcess = ({
  sessionId,
  questions,
  answers,
  timeLeft,
  subject,
  questionTimeData = [],
  isSubmitting,
  setIsSubmitting
}: UseSubmissionProcessProps) => {
  const { toast } = useToast();
  const { validateSubmissionState } = useSubmissionValidation();
  const { calculateResults } = useResultsCalculation();
  const { navigateToResults } = useSubmissionNavigation({
    sessionId,
    questions,
    answers,
    subject,
    questionTimeData
  });
  const { acquireLock, releaseLock, isLocked, hasSubmitted, isMounted } = useSubmissionLock();

  const processSubmission = useCallback(async () => {
    console.log('=== STARTING SUBMISSION PROCESS ===');
    console.log('Component mounted:', isMounted());
    console.log('Has submitted:', hasSubmitted());
    console.log('Is submitting:', isSubmitting);
    console.log('Submission lock:', isLocked());
    
    // Enhanced logging for time data
    console.log('Time analytics data:', {
      questionTimeDataLength: questionTimeData.length,
      totalTimeFromData: questionTimeData.reduce((sum, q) => sum + q.timeSpent, 0),
      questionsWithTime: questionTimeData.filter(q => q.timeSpent > 0).length,
      timeDataSample: questionTimeData.slice(0, 3)
    });

    // Acquire lock to prevent concurrent submissions
    if (!acquireLock()) {
      console.log('Could not acquire submission lock, aborting');
      return;
    }

    // Check if component is still mounted
    if (!isMounted()) {
      console.log('Component unmounted, aborting submission');
      releaseLock();
      return;
    }

    // Check if submission is already in progress
    if (isSubmitting) {
      console.log('Submission already in progress, aborting');
      releaseLock();
      return;
    }

    try {
      // Validate submission state
      const validation = validateSubmissionState({
        sessionId,
        questions,
        answers,
        timeLeft,
        isSubmitting
      });
      
      if (!validation.isValid) {
        console.error('Submission blocked:', validation.error);
        releaseLock();
        
        if (isMounted()) {
          toast({
            title: "Submission Error",
            description: validation.error || "Invalid state for submission",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Setting isSubmitting to true');
      if (isMounted()) {
        setIsSubmitting(true);
      }

      // Calculate results with enhanced time tracking
      console.log('Calculating results...');
      const results = calculateResults({ questions, answers, timeLeft });
      console.log('Results calculated:', results);
      
      // Prepare submission data with only valid database columns
      const submissionData = {
        end_time: new Date().toISOString(),
        answered_questions: results.answeredQuestions,
        score: results.totalScore,
        percentage: results.percentage,
        time_taken: results.timeTakenInMinutes
      };
      
      console.log('=== SUBMITTING TO DATABASE ===');
      console.log('Submission data:', submissionData);
      console.log('Question time analytics (not stored in DB):', {
        totalQuestions: questionTimeData.length,
        questionsWithData: questionTimeData.filter(q => q.timeSpent > 0).length,
        totalTimeSpent: questionTimeData.reduce((sum, q) => sum + q.timeSpent, 0)
      });
      
      await submitTestSession(sessionId, submissionData);

      console.log('Database submission successful');

      if (isMounted()) {
        toast({
          title: "Exam Submitted Successfully",
          description: `Score: ${results.totalScore}/${results.maxPossibleScore} (${results.percentage}%)`,
        });
      }

      // Navigate to results with comprehensive data
      if (isMounted()) {
        console.log('Navigating to results');
        navigateToResults({
          ...results,
          questionTimeData
        });
      }
      
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      // Reset submission state on error
      releaseLock();
      
      if (isMounted()) {
        setIsSubmitting(false);
        
        const errorMessage = error instanceof Error ? error.message : "Failed to submit the test. Please try again.";
        
        toast({
          title: "Submission Failed", 
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [
    sessionId, questions, answers, timeLeft, subject, questionTimeData,
    validateSubmissionState, calculateResults, navigateToResults, toast, 
    isSubmitting, setIsSubmitting, acquireLock, releaseLock, isLocked, 
    hasSubmitted, isMounted
  ]);

  return { processSubmission };
};
