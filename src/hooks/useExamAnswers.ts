
import { useState } from 'react';

export const useExamAnswers = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const clearAnswer = (questionId: number) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  return {
    answers,
    setAnswers,
    handleAnswerSelect,
    clearAnswer,
    getAnsweredCount
  };
};
