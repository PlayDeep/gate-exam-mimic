
import { useState } from 'react';
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

export const useSimpleExamSubmission = ({
  sessionId,
  questions,
  answers,
  timeLeft,
  subject,
  questionTimeData = []
}: UseSimpleExamSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submitExam = async () => {
    if (!sessionId || isSubmitting) return;

    console.log('Starting exam submission...');
    setIsSubmitting(true);

    try {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      
      // Calculate score
      let totalScore = 0;
      let maxPossibleScore = 0;
      
      questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const userAnswer = answers[questionNumber];
        maxPossibleScore += question.marks;
        
        if (userAnswer) {
          const isCorrect = String(userAnswer).trim() === String(question.correct_answer).trim();
          if (isCorrect) {
            totalScore += question.marks;
          } else if (question.question_type === 'MCQ') {
            totalScore -= (question.negative_marks || 0);
          }
        }
      });

      // Ensure score doesn't go below 0
      totalScore = Math.max(0, totalScore);
      const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
      
      // Calculate time taken (3 hours - time left)
      const totalTimeInSeconds = 180 * 60; // 3 hours
      const timeTakenInSeconds = totalTimeInSeconds - timeLeft;
      const timeTakenInMinutes = Math.round(timeTakenInSeconds / 60);

      console.log('Submitting with score:', totalScore, 'percentage:', percentage, 'time:', timeTakenInMinutes);

      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredQuestions,
        score: totalScore,
        percentage: percentage,
        time_taken: timeTakenInMinutes
      });

      console.log('Exam submitted successfully');
      
      // Store results in sessionStorage for the results page
      const resultData = {
        sessionId,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        answeredQuestions,
        totalQuestions,
        timeTaken: timeTakenInMinutes,
        answers,
        questions,
        subject: subject || 'Unknown',
        questionTimeData: questionTimeData || []
      };
      
      sessionStorage.setItem('examResults', JSON.stringify(resultData));
      
      toast({
        title: "Exam Submitted",
        description: "Your test has been submitted successfully.",
      });

      // Navigate to results
      navigate('/results');
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Submission Error", 
        description: "Failed to submit the test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitExam, isSubmitting };
};
