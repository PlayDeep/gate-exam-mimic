
import { useCallback } from 'react';
import { Question } from '@/services/questionService';

interface UseExamAnswerHandlerProps {
  sessionId: string;
  questions: Question[];
  updateAnswer: (questionNumber: number, answer: string) => void;
  getTimeSpent: (questionNumber: number) => number;
}

export const useExamAnswerHandler = ({
  sessionId,
  questions,
  updateAnswer,
  getTimeSpent
}: UseExamAnswerHandlerProps) => {
  
  const handleAnswerChange = useCallback((questionNumber: number, selectedAnswer: string) => {
    console.log('Answer changed for question', questionNumber, ':', selectedAnswer);
    
    // Validate question number
    if (questionNumber < 1 || questionNumber > questions.length) {
      console.error('Invalid question number:', questionNumber);
      return;
    }

    // Update the answer
    updateAnswer(questionNumber, selectedAnswer);
    
    // Log time spent on this question
    const timeSpent = getTimeSpent(questionNumber);
    console.log(`Time spent on question ${questionNumber}:`, timeSpent, 'seconds');
    
  }, [questions.length, updateAnswer, getTimeSpent]);

  return {
    handleAnswerChange
  };
};
