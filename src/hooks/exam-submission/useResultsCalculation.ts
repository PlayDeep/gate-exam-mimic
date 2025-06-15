
import { useCallback } from 'react';
import { Question } from '@/services/questionService';

const EXAM_DURATION_MINUTES = 180; // 3 hours

interface CalculationProps {
  questions: Question[];
  answers: Record<number, string>;
  timeLeft: number;
}

export const useResultsCalculation = () => {
  const calculateResults = useCallback(({ questions, answers, timeLeft }: CalculationProps) => {
    console.log('=== CALCULATING RESULTS ===');
    
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
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

    totalScore = Math.max(0, Math.round(totalScore * 100) / 100);
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
    
    const totalTimeInSeconds = EXAM_DURATION_MINUTES * 60;
    const timeTakenInSeconds = Math.max(0, totalTimeInSeconds - timeLeft);
    const timeTakenInMinutes = Math.round(timeTakenInSeconds / 60);

    console.log('Results calculated:', {
      totalScore,
      maxPossibleScore,
      percentage,
      correctAnswers,
      wrongAnswers,
      timeTakenInMinutes
    });

    return {
      totalScore,
      maxPossibleScore,
      percentage,
      correctAnswers,
      wrongAnswers,
      answeredQuestions,
      totalQuestions,
      timeTakenInMinutes
    };
  }, []);

  return { calculateResults };
};
