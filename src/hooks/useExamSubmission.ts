
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { submitTestSession } from "@/services/testService";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";

interface UseExamSubmissionProps {
  sessionId: string;
  user: any;
  questions: any[];
  answers: Record<number, string>;
  timeLeft: number;
  totalQuestions: number;
  subject: string | undefined;
}

export const useExamSubmission = ({
  sessionId,
  user,
  questions,
  answers,
  timeLeft,
  totalQuestions,
  subject
}: UseExamSubmissionProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stopTimer, getAllTimeData } = useQuestionTimer();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitExam = async () => {
    console.log('=== SUBMIT EXAM START ===');
    console.log('Session ID:', sessionId);
    console.log('Is Submitting:', isSubmitting);
    console.log('User:', user?.id);
    console.log('Questions length:', questions.length);
    console.log('Answers count:', Object.keys(answers).length);
    
    if (!sessionId) {
      console.error('No session ID found');
      toast({
        title: "Error",
        description: "No active session found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.error('No user found');
      toast({
        title: "Error",
        description: "Authentication required. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    
    if (isSubmitting) {
      console.log('Already submitting, preventing duplicate submission');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Stop current timer
      stopTimer();
      
      const timeSpentMinutes = Math.floor((180 * 60 - timeLeft) / 60);
      const answeredCount = Object.keys(answers).length;
      
      // Calculate score with detailed logging
      let totalScore = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unansweredCount = 0;
      
      console.log('=== FINAL SCORE CALCULATION START ===');
      console.log('Total answers provided:', Object.keys(answers).length);
      console.log('Total questions:', questions.length);
      console.log('Answers object:', answers);
      
      // Process each question
      questions.forEach((question, index) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        console.log(`\n--- Question ${questionNum} ---`);
        console.log('Question ID:', question.id);
        console.log('Question Type:', question.question_type);
        console.log('User Answer:', userAnswer);
        console.log('Correct Answer:', question.correct_answer);
        console.log('Marks:', question.marks);
        console.log('Negative Marks:', question.negative_marks);
        
        if (!userAnswer || userAnswer === '') {
          unansweredCount++;
          console.log('Status: UNANSWERED');
          return;
        }
        
        // Normalize both answers for comparison
        const normalizedUserAnswer = String(userAnswer).trim();
        const normalizedCorrectAnswer = String(question.correct_answer).trim();
        
        console.log('Normalized User Answer:', normalizedUserAnswer);
        console.log('Normalized Correct Answer:', normalizedCorrectAnswer);
        
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        console.log('Is Correct:', isCorrect);
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.marks;
          console.log(`Status: CORRECT - Added ${question.marks} marks. Running total: ${totalScore}`);
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
            const penalty = question.negative_marks || 0;
            totalScore -= penalty;
            console.log(`Status: WRONG (MCQ) - Deducted ${penalty} marks. Running total: ${totalScore}`);
          } else {
            console.log(`Status: WRONG (NAT) - No penalty. Running total: ${totalScore}`);
          }
        }
      });
      
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      console.log('\n=== FINAL RESULTS ===');
      console.log('Total Score:', totalScore);
      console.log('Correct Answers:', correctAnswers);
      console.log('Wrong Answers:', wrongAnswers);
      console.log('Unanswered:', unansweredCount);
      console.log('Total Questions:', totalQuestions);
      console.log('Percentage:', percentage);
      console.log('Answered Count:', answeredCount);
      console.log('=== FINAL SCORE CALCULATION END ===');
      
      // Submit test session with timestamp
      console.log('Submitting test session...');
      console.log('Submission data:', {
        end_time: new Date().toISOString(),
        answered_questions: answeredCount,
        score: totalScore,
        percentage: percentage,
        time_taken: timeSpentMinutes
      });
      
      await submitTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredCount,
        score: totalScore,
        percentage: percentage,
        time_taken: timeSpentMinutes
      });
      
      console.log('Test session submitted successfully');
      
      // Get all time data for results
      const questionTimeData = getAllTimeData();
      console.log('All time data being passed to results:', questionTimeData);
      
      toast({
        title: "Test Submitted",
        description: "Your test has been submitted successfully!",
      });
      
      console.log('Navigating to results...');
      navigate('/results', { 
        state: { 
          sessionId,
          answers, 
          questions, 
          timeSpent: timeSpentMinutes,
          subject,
          score: totalScore,
          percentage: percentage,
          questionTimeData: questionTimeData
        } 
      });
      
      console.log('=== SUBMIT EXAM SUCCESS ===');
    } catch (error) {
      console.error('Error submitting exam:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "Error",
        description: `Failed to submit exam: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('=== SUBMIT EXAM END ===');
    }
  };

  return {
    handleSubmitExam,
    isSubmitting
  };
};
