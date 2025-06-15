
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { submitTestSession } from "@/services/testService";

interface UseExamSubmissionProps {
  sessionId: string | null;
  answers: Record<number, string>;
  questions: any[];
  timeSpent: number;
}

export const useExamSubmission = (
  sessionId: string | null,
  answers: Record<number, string>,
  questions: any[],
  timeSpent: number
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active session found.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const answeredCount = Object.keys(answers).length;
      
      // Calculate score
      let totalScore = 0;
      let correctAnswers = 0;
      
      questions.forEach((question, index) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        if (userAnswer) {
          const isCorrect = String(userAnswer).trim() === String(question.correct_answer).trim();
          
          if (isCorrect) {
            correctAnswers++;
            totalScore += question.marks;
          } else if (question.question_type === 'MCQ') {
            totalScore -= (question.negative_marks || 0);
          }
        }
      });
      
      const percentage = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
      
      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredCount,
        score: totalScore,
        percentage: percentage,
        time_taken: timeSpent
      });
      
      toast({
        title: "Test Submitted",
        description: "Your test has been submitted successfully!",
      });
      
      navigate('/results', { 
        state: { 
          sessionId,
          answers, 
          questions, 
          timeSpent,
          score: totalScore,
          percentage: percentage
        } 
      });
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
