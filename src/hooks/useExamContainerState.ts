
import { useState, useEffect, useRef } from "react";
import { Question } from "@/services/questionService";

interface UseExamContainerStateProps {
  initialQuestions: Question[];
  initialSessionId: string;
}

export const useExamContainerState = ({
  initialQuestions,
  initialSessionId
}: UseExamContainerStateProps) => {
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions] = useState<Question[]>(initialQuestions);
  const [sessionId] = useState<string>(initialSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const totalQuestions = questions.length;

  // Component mount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize loading state
  useEffect(() => {
    if (questions.length > 0 && sessionId) {
      setIsLoading(false);
    }
  }, [questions.length, sessionId]);

  const clearAnswer = (questionNumber: number) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionNumber];
      return newAnswers;
    });
  };

  const navigateToQuestion = (questionNumber: number) => {
    if (questionNumber >= 1 && questionNumber <= totalQuestions) {
      setCurrentQuestion(questionNumber);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const toggleMarkForReview = (questionNumber: number) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionNumber)) {
        newSet.delete(questionNumber);
      } else {
        newSet.add(questionNumber);
      }
      return newSet;
    });
  };

  const updateAnswer = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionNumber]: answer
    }));
  };

  return {
    timeLeft,
    setTimeLeft,
    currentQuestion,
    answers,
    markedForReview,
    isFullscreen,
    setIsFullscreen,
    questions,
    sessionId,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    totalQuestions,
    clearAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    toggleMarkForReview,
    updateAnswer,
    isMountedRef
  };
};
