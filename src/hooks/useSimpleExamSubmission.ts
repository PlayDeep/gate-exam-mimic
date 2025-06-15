
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

const EXAM_DURATION_MINUTES = 180; // 3 hours

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
    // Enhanced validation at start
    if (!sessionId) {
      console.warn('submitExam: No sessionId provided');
      toast({
        title: "Submission Error",
        description: "No active session found. Please restart the exam.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) {
      console.warn('submitExam: Already submitting, ignoring duplicate call');
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      console.error('submitExam: No questions available');
      toast({
        title: "Submission Error",
        description: "No questions available for submission.",
        variant: "destructive",
      });
      return;
    }

    console.log('=== STARTING EXAM SUBMISSION ===');
    console.log('Session ID:', sessionId);
    console.log('Questions count:', questions.length);
    console.log('Answers count:', Object.keys(answers).length);
    console.log('Time left:', timeLeft);
    console.log('Subject:', subject);
    
    setIsSubmitting(true);

    try {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      
      console.log('=== CALCULATING SCORES ===');
      
      let totalScore = 0;
      let maxPossibleScore = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      
      questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const userAnswer = answers[questionNumber];
        const marks = typeof question.marks === 'number' && question.marks > 0 ? question.marks : 1;
        
        maxPossibleScore += marks;
        
        if (userAnswer !== undefined && userAnswer !== '') {
          const normalizedUserAnswer = String(userAnswer).trim();
          const normalizedCorrectAnswer = String(question.correct_answer || '').trim();
          const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
          
          console.log(`Q${questionNumber}: User="${normalizedUserAnswer}" vs Correct="${normalizedCorrectAnswer}" = ${isCorrect ? 'CORRECT' : 'WRONG'}`);
          
          if (isCorrect) {
            correctAnswers++;
            totalScore += marks;
          } else {
            wrongAnswers++;
            if (question.question_type === 'MCQ') {
              const negativeMarks = typeof question.negative_marks === 'number' && question.negative_marks >= 0
                ? question.negative_marks 
                : (marks === 1 ? 1/3 : 2/3);
              totalScore -= negativeMarks;
            }
          }
        }
      });

      // Ensure score doesn't go below 0
      totalScore = Math.max(0, Math.round(totalScore * 100) / 100);
      const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
      
      const totalTimeInSeconds = EXAM_DURATION_MINUTES * 60;
      const timeTakenInSeconds = Math.max(0, totalTimeInSeconds - timeLeft);
      const timeTakenInMinutes = Math.round(timeTakenInSeconds / 60);

      console.log('=== FINAL CALCULATIONS ===');
      console.log('Total Score:', totalScore);
      console.log('Max Possible Score:', maxPossibleScore);
      console.log('Percentage:', percentage);
      console.log('Correct Answers:', correctAnswers);
      console.log('Wrong Answers:', wrongAnswers);
      console.log('Time Taken (minutes):', timeTakenInMinutes);

      console.log('=== SUBMITTING TO DATABASE ===');
      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredQuestions,
        score: totalScore,
        percentage: percentage,
        time_taken: timeTakenInMinutes
      });

      console.log('Database submission successful');
      
      const resultsData = {
        sessionId,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        answeredQuestions,
        totalQuestions,
        timeTaken: timeTakenInMinutes,
        timeSpent: timeTakenInMinutes,
        answers: { ...answers },
        questions: [...questions],
        subject: subject || 'Unknown',
        questionTimeData: questionTimeData.length > 0 ? [...questionTimeData] : []
      };

      console.log('=== PREPARED RESULTS DATA ===');
      console.log('Results data summary:', {
        hasScore: typeof resultsData.score === 'number',
        hasPercentage: typeof resultsData.percentage === 'number',
        answersCount: Object.keys(resultsData.answers).length,
        questionsCount: resultsData.questions.length,
        timeDataCount: resultsData.questionTimeData.length
      });

      // Enhanced storage with error handling
      try {
        const dataToStore = JSON.stringify(resultsData);
        if (typeof Storage !== 'undefined' && window.sessionStorage) {
          sessionStorage.setItem('examResults', dataToStore);
          console.log('Results data stored in sessionStorage successfully');
        } else {
          console.warn('SessionStorage not available');
        }
      } catch (storageError) {
        console.error('Failed to store results in sessionStorage:', storageError);
        // Continue anyway, navigation state should work
      }

      toast({
        title: "Exam Submitted Successfully",
        description: `Score: ${totalScore}/${maxPossibleScore} (${percentage}%)`,
      });

      console.log('=== NAVIGATING TO RESULTS ===');
      
      // Enhanced navigation with fallback
      try {
        navigate('/results', {
          state: resultsData,
          replace: true
        });
        console.log('Navigation initiated to results page');
      } catch (navError) {
        console.error('Navigation error:', navError);
        // Fallback to home page if navigation fails
        navigate('/', { replace: true });
      }
      
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : "Failed to submit the test. Please try again.";
      
      toast({
        title: "Submission Failed", 
        description: errorMessage,
        variant: "destructive",
      });

      // Reset submitting state on error to allow retry
      setIsSubmitting(false);
    } finally {
      // Only set to false if no error occurred (successful submission should not reset this)
      if (!error) {
        setIsSubmitting(false);
      }
      console.log('=== SUBMISSION PROCESS COMPLETED ===');
    }
  };

  return { 
    submitExam, 
    isSubmitting 
  };
};
