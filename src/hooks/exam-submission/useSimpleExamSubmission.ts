
import { useState, useCallback, useEffect } from 'react';
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

  const {
    validateSubmissionState,
    markSubmissionAttempted,
    resetSubmissionAttempt,
    isMountedRef
  } = useSubmissionValidation();

  const { calculateResults } = useResultsCalculation();

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const submitExam = useCallback(async () => {
    console.log('=== STARTING EXAM SUBMISSION ===');
    
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
      toast({
        title: "Submission Error",
        description: validation.error || "Invalid state for submission",
        variant: "destructive",
      });
      return;
    }

    // Mark submission as attempted
    markSubmissionAttempted();
    setIsSubmitting(true);

    try {
      // Calculate results
      const results = calculateResults({ questions, answers, timeLeft });
      
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

      toast({
        title: "Exam Submitted Successfully",
        description: `Score: ${results.totalScore}/${results.maxPossibleScore} (${results.percentage}%)`,
      });

      console.log('=== NAVIGATING TO RESULTS ===');
      
      // Navigate to results
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
      resetSubmissionAttempt();
      
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
    validateSubmissionState, calculateResults, markSubmissionAttempted, 
    resetSubmissionAttempt, navigate, toast, isMountedRef
  ]);

  return { 
    submitExam, 
    isSubmitting 
  };
};
