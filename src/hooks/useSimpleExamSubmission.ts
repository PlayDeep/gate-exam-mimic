
import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Question } from '@/services/questionService';
import { submitTestSession } from '@/services/testService';
import { useToast } from '@/hooks/use-toast';

interface UseSimpleExamSubmissionProps {
  sessionId: string;
  questions: Question[];
  answers: Record<number, string>;
  timeLeft: number;
  subject?: string;
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
}

const EXAM_DURATION_MINUTES = 180; // 3 hours

export const useSimpleExamSubmission = ({
  sessionId,
  questions,
  answers,
  timeLeft,
  subject,
  questionTimeData = []
}: UseSimpleExamSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Track component mount status
  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const validateSubmissionState = useCallback(() => {
    console.log('=== VALIDATING SUBMISSION STATE ===');
    
    // Check if component is mounted
    if (!isMountedRef.current) {
      console.error('Validation failed: Component not mounted');
      return { isValid: false, error: 'Component not mounted' };
    }

    // Check if already submitting
    if (isSubmitting) {
      console.error('Validation failed: Already submitting');
      return { isValid: false, error: 'Submission already in progress' };
    }

    // Check if already attempted submission
    if (submissionAttemptedRef.current) {
      console.error('Validation failed: Submission already attempted');
      return { isValid: false, error: 'Submission already attempted' };
    }

    // Check session ID
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      console.error('Validation failed: Invalid session ID');
      return { isValid: false, error: 'Invalid session ID' };
    }

    // Check questions
    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('Validation failed: No questions available');
      return { isValid: false, error: 'No questions available' };
    }

    // Validate question structure
    const invalidQuestions = questions.filter((q, index) => {
      if (!q || typeof q !== 'object') {
        console.error(`Question ${index + 1}: Not an object`);
        return true;
      }
      if (!q.id) {
        console.error(`Question ${index + 1}: Missing ID`);
        return true;
      }
      if (q.correct_answer === undefined || q.correct_answer === null) {
        console.error(`Question ${index + 1}: Missing correct answer`);
        return true;
      }
      return false;
    });

    if (invalidQuestions.length > 0) {
      console.error('Validation failed: Invalid questions found:', invalidQuestions.length);
      return { isValid: false, error: `${invalidQuestions.length} questions have invalid structure` };
    }

    // Check answers object
    if (!answers || typeof answers !== 'object') {
      console.error('Validation failed: Invalid answers object');
      return { isValid: false, error: 'Invalid answers object' };
    }

    // Check time left
    if (typeof timeLeft !== 'number' || timeLeft < 0) {
      console.error('Validation failed: Invalid time left');
      return { isValid: false, error: 'Invalid time remaining' };
    }

    console.log('Validation passed: All checks successful');
    return { isValid: true };
  }, [sessionId, questions, answers, timeLeft, isSubmitting]);

  const calculateResults = useCallback(() => {
    console.log('=== CALCULATING RESULTS ===');
    
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    
    questions.forEach((question, index) => {
      const questionNumber = index + 1;
      const userAnswer = answers[questionNumber];
      const marks = typeof question.marks === 'number' && question.marks > 0 ? question.marks : 1;
      
      maxPossibleScore += marks;
      
      if (userAnswer !== undefined && userAnswer !== '') {
        const normalizedUserAnswer = String(userAnswer).trim();
        const normalizedCorrectAnswer = String(question.correct_answer || '').trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        console.log(`Q${questionNumber}: User="${normalizedUserAnswer}" vs Correct="${normalizedCorrectAnswer}" = ${isCorrect ? 'CORRECT' : 'WRONG'}`);
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += marks;
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = typeof question.negative_marks === 'number' && question.negative_marks >= 0
              ? question.negative_marks 
              : (marks === 1 ? 1/3 : 2/3);
            totalScore -= negativeMarks;
          }
        }
      }
    });

    totalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    
    const totalTimeInSeconds = EXAM_DURATION_MINUTES * 60;
    const timeTakenInSeconds = Math.max(0, totalTimeInSeconds - timeLeft);
    const timeTakenInMinutes = Math.round(timeTakenInSeconds / 60);

    console.log('Results calculated:', {
      totalScore,
      maxPossibleScore,
      percentage,
      correctAnswers,
      wrongAnswers,
      timeTakenInMinutes
    });

    return {
      totalScore,
      maxPossibleScore,
      percentage,
      correctAnswers,
      wrongAnswers,
      answeredQuestions,
      totalQuestions,
      timeTakenInMinutes
    };
  }, [questions, answers, timeLeft]);

  const submitExam = useCallback(async () => {
    console.log('=== STARTING EXAM SUBMISSION ===');
    
    // Validate submission state
    const validation = validateSubmissionState();
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
    submissionAttemptedRef.current = true;
    setIsSubmitting(true);

    try {
      // Calculate results
      const results = calculateResults();
      
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
      submissionAttemptedRef.current = false;
      
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
  }, [validateSubmissionState, calculateResults, sessionId, answers, questions, subject, questionTimeData, navigate, toast]);

  return { 
    submitExam, 
    isSubmitting 
  };
};
