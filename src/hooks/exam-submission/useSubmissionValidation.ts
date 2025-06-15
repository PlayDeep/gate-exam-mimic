
import { useCallback } from 'react';
import { Question } from '@/services/questionService';

interface ValidationProps {
  sessionId: string;
  questions: Question[];
  answers: Record<number, string>;
  timeLeft: number;
  isSubmitting: boolean;
}

export const useSubmissionValidation = () => {
  const validateSubmissionState = useCallback(({
    sessionId,
    questions,
    answers,
    timeLeft,
    isSubmitting
  }: ValidationProps) => {
    console.log('=== VALIDATING SUBMISSION STATE ===');
    
    // Check if already submitting
    if (isSubmitting) {
      console.error('Validation failed: Already submitting');
      return { isValid: false, error: 'Submission already in progress' };
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
  }, []);

  return {
    validateSubmissionState
  };
};
