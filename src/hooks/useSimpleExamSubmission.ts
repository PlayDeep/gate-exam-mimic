
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

// Made exam duration configurable instead of hardcoded
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
    if (!sessionId || isSubmitting) {
      console.warn('Submit called with invalid state:', { sessionId, isSubmitting });
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
      // Validate required data
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions available for submission');
      }

      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      
      console.log('=== CALCULATING SCORES ===');
      
      // Calculate score and metrics with detailed logging
      let totalScore = 0;
      let maxPossibleScore = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      
      questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const userAnswer = answers[questionNumber];
        const marks = typeof question.marks === 'number' ? question.marks : 1;
        
        maxPossibleScore += marks;
        
        if (userAnswer !== undefined && userAnswer !== '') {
          // Normalize answers for comparison
          const normalizedUserAnswer = String(userAnswer).trim();
          const normalizedCorrectAnswer = String(question.correct_answer).trim();
          const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
          
          console.log(`Q${questionNumber}: User="${normalizedUserAnswer}" vs Correct="${normalizedCorrectAnswer}" = ${isCorrect}`);
          
          if (isCorrect) {
            correctAnswers++;
            totalScore += marks;
          } else {
            wrongAnswers++;
            // Apply negative marking only for MCQ questions
            if (question.question_type === 'MCQ') {
              const negativeMarks = typeof question.negative_marks === 'number' 
                ? question.negative_marks 
                : (marks === 1 ? 1/3 : 2/3);
              totalScore -= negativeMarks;
            }
          }
        }
      });

      // Ensure score doesn't go below 0 and round properly
      totalScore = Math.max(0, Math.round(totalScore * 100) / 100);
      
      const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
      
      // Calculate time taken using configurable duration
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

      // Submit to database
      console.log('=== SUBMITTING TO DATABASE ===');
      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredQuestions,
        score: totalScore,
        percentage: percentage,
        time_taken: timeTakenInMinutes
      });

      console.log('Database submission successful');
      
      // Prepare comprehensive results data
      const resultsData = {
        sessionId,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        answeredQuestions,
        totalQuestions,
        timeTaken: timeTakenInMinutes,
        timeSpent: timeTakenInMinutes, // For backward compatibility
        answers: { ...answers }, // Create a copy to avoid reference issues
        questions: [...questions], // Create a copy to avoid reference issues
        subject: subject || 'Unknown',
        questionTimeData: questionTimeData.length > 0 ? [...questionTimeData] : []
      };

      console.log('=== PREPARED RESULTS DATA ===');
      console.log('Results data keys:', Object.keys(resultsData));
      console.log('Answers keys count:', Object.keys(resultsData.answers).length);
      console.log('Questions count:', resultsData.questions.length);
      console.log('Question time data count:', resultsData.questionTimeData.length);

      // Store in sessionStorage as backup with improved error handling
      try {
        const dataToStore = JSON.stringify(resultsData);
        if (typeof Storage !== 'undefined') {
          sessionStorage.setItem('examResults', dataToStore);
          console.log('Results data stored in sessionStorage successfully');
        } else {
          console.warn('SessionStorage not available (possibly incognito mode)');
        }
      } catch (storageError) {
        console.error('Failed to store results in sessionStorage:', storageError);
        // Don't fail the submission for storage issues
      }

      // Show success toast
      toast({
        title: "Exam Submitted Successfully",
        description: `Score: ${totalScore}/${maxPossibleScore} (${percentage}%)`,
      });

      console.log('=== NAVIGATING TO RESULTS ===');
      
      // Navigate to results with complete data
      navigate('/results', {
        state: resultsData,
        replace: true // Prevent going back to exam
      });

      console.log('Navigation initiated to results page');
      
    } catch (error) {
      console.error('=== SUBMISSION ERROR ===');
      console.error('Error details:', error);
      
      toast({
        title: "Submission Failed", 
        description: error instanceof Error ? error.message : "Failed to submit the test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('=== SUBMISSION PROCESS COMPLETED ===');
    }
  };

  return { 
    submitExam, 
    isSubmitting 
  };
};
