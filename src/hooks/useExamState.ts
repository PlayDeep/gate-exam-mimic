
import { useState, useRef } from 'react';
import { Question } from "@/services/questionService";

export const useExamState = () => {
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const totalQuestions = questions.length > 0 ? Math.min(questions.length, 65) : 0;

  return {
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
    totalQuestions
  };
};
