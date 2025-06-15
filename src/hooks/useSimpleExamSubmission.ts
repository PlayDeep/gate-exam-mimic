
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { submitTestSession } from "@/services/testService";

interface UseSimpleExamSubmissionProps {
  sessionId: string;
  questions: any[];
  answers: Record<number, string>;
  timeLeft: number;
  subject: string | undefined;
}

export const useSimpleExamSubmission = ({
  sessionId,
  questions,
  answers,
  timeLeft,
  subject
}: UseSimpleExamSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitExam = async () => {
    if (!sessionId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    console.log('Submitting exam...');

    try {
      const timeSpentMinutes = Math.floor((180 * 60 - timeLeft) / 60);
      const answeredCount = Object.keys(answers).length;
      
      // Calculate score
      let totalScore = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      
      questions.forEach((question, index) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        if (!userAnswer) return;
        
        const isCorrect = String(userAnswer).trim() === String(question.correct_answer).trim();
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.marks;
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
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
        time_taken: timeSpentMinutes
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
          timeSpent: timeSpentMinutes,
          subject,
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
    submitExam,
    isSubmitting
  };
};
