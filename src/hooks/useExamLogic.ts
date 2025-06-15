import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { useAuth } from "@/contexts/AuthContext";
// Removed the useExamInitialization import since it was deleted
import { useExamAnswers } from "./useExamAnswers";
import { useExamTimer } from "./useExamTimer";
import { useExamNavigation } from "./useExamNavigation";
import { useExamSubmission } from "./useExamSubmission";
import { Question } from "@/types/question";

export const useExamLogic = (
  subject: string,
  totalQuestions: number,
  questions: Question[]
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    answers,
    setAnswers,
    handleAnswerSelect,
    clearAnswer,
    getAnsweredCount
  } = useExamAnswers();

  const {
    timeRemaining,
    timeSpent,
    startTimer,
    stopTimer,
    isTimeUp
  } = useExamTimer(totalQuestions * 3);

  const {
    currentQuestionIndex,
    setCurrentQuestionIndex,
    nextQuestion,
    previousQuestion,
    goToQuestion
  } = useExamNavigation(questions.length);

  const {
    isSubmitting,
    handleSubmit
  } = useExamSubmission(sessionId, answers, questions, timeSpent);

  // Initialize the exam when component mounts
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to take the test.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "No questions available for this subject.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Simple initialization without the complex hook
    setIsLoading(false);
    startTimer();
  }, [user, questions, navigate, toast, startTimer]);

  // Handle time up
  useEffect(() => {
    if (isTimeUp && sessionId && !isSubmitting) {
      handleSubmit();
    }
  }, [isTimeUp, sessionId, isSubmitting, handleSubmit]);

  return {
    // State
    sessionId,
    currentQuestionIndex,
    isLoading,
    isSubmitting,
    
    // Timer
    timeRemaining,
    timeSpent,
    isTimeUp,
    
    // Answers
    answers,
    handleAnswerSelect,
    clearAnswer,
    getAnsweredCount,
    
    // Navigation
    nextQuestion,
    previousQuestion,
    goToQuestion,
    
    // Actions
    handleSubmit
  };
};
