
import { useState } from 'react';
import { Question } from "@/services/questionService";

export const useSimpleExamState = () => {
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = questions.length > 0 ? Math.min(questions.length, 65) : 0;

  const clearAnswer = () => {
    if (isSubmitting) {
      console.log('Cannot clear answer: submission in progress');
      return;
    }
    
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion];
      return newAnswers;
    });
  };

  const navigateToQuestion = (questionNum: number) => {
    if (isSubmitting) {
      console.log('Cannot navigate: submission in progress');
      return;
    }
    
    if (questionNum >= 1 && questionNum <= totalQuestions) {
      setCurrentQuestion(questionNum);
    }
  };

  const nextQuestion = () => {
    if (isSubmitting) {
      console.log('Cannot navigate next: submission in progress');
      return;
    }
    
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (isSubmitting) {
      console.log('Cannot navigate previous: submission in progress');
      return;
    }
    
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const toggleMarkForReview = () => {
    if (isSubmitting) {
      console.log('Cannot mark for review: submission in progress');
      return;
    }
    
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const updateAnswer = (questionId: number, answer: string) => {
    if (isSubmitting) {
      console.log('Cannot update answer: submission in progress');
      return;
    }
    
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  return {
    // State
    timeLeft,
    setTimeLeft,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    markedForReview,
    setMarkedForReview,
    isFullscreen,
    setIsFullscreen,
    questions,
    setQuestions,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    isSubmitting,
    setIsSubmitting,
    totalQuestions,
    
    // Actions
    clearAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    toggleMarkForReview,
    updateAnswer
  };
};
