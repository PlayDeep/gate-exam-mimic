
import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '@/services/questionService';
import { submitTestSession } from '@/services/testService';
import { useToast } from '@/hooks/use-toast';
import { useSubmissionValidation } from './useSubmissionValidation';
import { useResultsCalculation } from './useResultsCalculation';

interface UseSimpleExamSubmissionProps {
  sessionId: string;
  questions: Question[];
  answers: Record<number, string>;
  timeLeft: number;
  subject?: string;
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
}

export const useSimpleExamSubmission = ({
  sessionId,
  questions,
  answers,
  timeLeft,
  subject,
  questionTimeData = []
}: UseSimpleExamSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMountedRef = useRef(true);
  const hasSubmittedRef = useRef(false);
  const submissionLockRef = useRef(false);

  const { validateSubmissionState } = useSubmissionValidation();
  const { calculateResults } = useResultsCalculation();

  // Component mount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const submitExam = useCallback(async () => {
    console.log('=== STARTING EXAM SUBMISSION ===');
    console.log('Component mounted:', isMountedRef.current);
    console.log('Has submitted:', hasSubmittedRef.current);
    console.log('Is submitting:', isSubmitting);
    console.log('Submission lock:', submissionLockRef.current);
    
    // Immediate lock to prevent concurrent submissions
    if (submissionLockRef.current) {
      console.log('Submission locked, aborting');
      return;
    }
    submissionLockRef.current = true;

    // Check if component is still mounted
    if (!isMountedRef.current) {
      console.log('Component unmounted, aborting submission');
      submissionLockRef.current = false;
      return;
    }

    // Check if already submitted
    if (hasSubmittedRef.current) {
      console.log('Already submitted, aborting');
      submissionLockRef.current = false;
      return;
    }

    // Check if submission is already in progress
    if (isSubmitting) {
      console.log('Submission already in progress, aborting');
      submissionLockRef.current = false;
      return;
    }

    try {
      // Mark as submitted immediately to prevent multiple calls
      hasSubmittedRef.current = true;
      
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
        hasSubmittedRef.current = false;
        submissionLockRef.current = false;
        
        if (isMountedRef.current) {
          toast({
            title: "Submission Error",
            description: validation.error || "Invalid state for submission",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Setting isSubmitting to true');
      if (isMountedRef.current) {
        setIsSubmitting(true);
      }

      // Calculate results
      console.log('Calculating results...');
      const results = calculateResults({ questions, answers, timeLeft });
      console.log('Results calculated:', results);
      
      console.log('=== SUBMITTING TO DATABASE ===');
      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: results.answeredQuestions,
        score: results.totalScore,
        percentage: results.percentage,
        time_taken: results.timeTakenInMinutes
      });

      console.log('Database submission successful');
      
      const resultsData = {
        sessionId,
        score: results.totalScore,
        maxScore: results.maxPossibleScore,
        percentage: results.percentage,
        answeredQuestions: results.answeredQuestions,
        totalQuestions: results.totalQuestions,
        timeTaken: results.timeTakenInMinutes,
        timeSpent: results.timeTakenInMinutes,
        answers: { ...answers },
        questions: [...questions],
        subject: subject || 'Unknown',
        questionTimeData: questionTimeData.length > 0 ? [...questionTimeData] : []
      };

      // Store results in sessionStorage
      try {
        const dataToStore = JSON.stringify(resultsData);
        if (typeof Storage !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('examResults', dataToStore);
          console.log('Results stored in sessionStorage');
        }
      } catch (storageError) {
        console.error('Failed to store results in sessionStorage:', storageError);
      }

      if (isMountedRef.current) {
        toast({
          title: "Exam Submitted Successfully",
          description: `Score: ${results.totalScore}/${results.maxPossibleScore} (${results.percentage}%)`,
        });
      }

      console.log('=== NAVIGATING TO RESULTS ===');
      
      // Navigate to results only if component is still mounted
      if (isMountedRef.current) {
        navigate('/results', {
          state: resultsData,
          replace: true
        });
        console.log('Navigation to results initiated');
      }
      
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      // Reset submission state on error
      hasSubmittedRef.current = false;
      submissionLockRef.current = false;
      
      if (isMountedRef.current) {
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
    validateSubmissionState, calculateResults, navigate, toast, isSubmitting
  ]);

  return { 
    submitExam, 
    isSubmitting 
  };
};
