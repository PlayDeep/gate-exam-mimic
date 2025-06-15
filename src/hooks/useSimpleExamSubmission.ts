
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
    console.log('Session ID:', sessionId);
    console.log('Questions:', questions.length);
    console.log('Answers:', Object.keys(answers).length);
    
    setIsSubmitting(true);

    try {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      
      // Calculate score and other metrics
      let totalScore = 0;
      let maxPossibleScore = 0;
      
      questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const userAnswer = answers[questionNumber];
        const marks = question.marks || 1;
        maxPossibleScore += marks;
        
        if (userAnswer) {
          const isCorrect = String(userAnswer).trim() === String(question.correct_answer).trim();
          if (isCorrect) {
            totalScore += marks;
          } else if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (marks === 1 ? 1/3 : 2/3);
            totalScore -= negativeMarks;
          }
        }
      });

      // Ensure score doesn't go below 0
      totalScore = Math.max(0, totalScore);
      totalScore = Math.round(totalScore * 100) / 100; // Round to 2 decimal places
      
      const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
      
      // Calculate time taken (3 hours - time left in seconds, convert to minutes)
      const totalTimeInSeconds = 180 * 60; // 3 hours
      const timeTakenInSeconds = totalTimeInSeconds - timeLeft;
      const timeTakenInMinutes = Math.round(timeTakenInSeconds / 60);

      console.log('Submitting with:', {
        score: totalScore,
        percentage,
        timeTaken: timeTakenInMinutes,
        answeredQuestions
      });

      // Submit to database
      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredQuestions,
        score: totalScore,
        percentage: percentage,
        time_taken: timeTakenInMinutes
      });

      console.log('Exam submitted successfully');
      
      // Prepare complete results data
      const resultsData = {
        sessionId,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        answeredQuestions,
        totalQuestions,
        timeTaken: timeTakenInMinutes,
        timeSpent: timeTakenInMinutes, // For backward compatibility
        answers,
        questions,
        subject: subject || 'Unknown',
        questionTimeData: questionTimeData || []
      };

      console.log('Prepared results data:', resultsData);

      // Store in sessionStorage as backup
      try {
        sessionStorage.setItem('examResults', JSON.stringify(resultsData));
        console.log('Results data stored in sessionStorage');
      } catch (error) {
        console.error('Failed to store results in sessionStorage:', error);
      }

      toast({
        title: "Exam Submitted",
        description: "Your test has been submitted successfully.",
      });

      // Navigate to results with complete data
      console.log('Navigating to results page...');
      navigate('/results', {
        state: resultsData,
        replace: true // Use replace to prevent going back to exam
      });
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
