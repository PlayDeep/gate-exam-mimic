
import { saveUserAnswer } from "@/services/testService";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";
import { useRealTimeTracking } from "@/hooks/useRealTimeTracking";

interface UseExamAnswersProps {
  sessionId: string;
  questions: any[];
  answers: Record<number, string>;
  setAnswers: (value: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
  markedForReview: Set<number>;
  setMarkedForReview: (value: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  isLoading: boolean;
}

export const useExamAnswers = ({
  sessionId,
  questions,
  answers,
  setAnswers,
  markedForReview,
  setMarkedForReview,
  isLoading
}: UseExamAnswersProps) => {
  const { getTimeSpent } = useQuestionTimer();
  const { trackAnswerUpdate } = useRealTimeTracking({ 
    sessionId, 
    isActive: !isLoading && sessionId !== '' && questions.length > 0
  });

  const handleAnswerChange = async (questionId: number, answer: string) => {
    console.log('=== ANSWER CHANGE START ===');
    console.log('Question ID:', questionId);
    console.log('User Answer:', answer);
    console.log('Answer Type:', typeof answer);
    
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Track answer update in real-time - only if we have a valid session
    if (sessionId && questions.length > 0) {
      trackAnswerUpdate(questionId, answer);
    }
    
    // Save answer to database with actual time spent
    if (sessionId && questions[questionId - 1]) {
      const question = questions[questionId - 1];
      console.log('Question Data:', {
        id: question.id,
        correct_answer: question.correct_answer,
        correct_answer_type: typeof question.correct_answer,
        question_type: question.question_type,
        marks: question.marks,
        negative_marks: question.negative_marks
      });
      
      // Normalize both answers for comparison - convert to strings and trim
      const normalizedUserAnswer = String(answer).trim();
      const normalizedCorrectAnswer = String(question.correct_answer).trim();
      
      console.log('Normalized User Answer:', normalizedUserAnswer);
      console.log('Normalized Correct Answer:', normalizedCorrectAnswer);
      
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      console.log('Is Correct:', isCorrect);
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks;
      } else if (question.question_type === 'MCQ') {
        // Apply negative marking for MCQ
        marksAwarded = -(question.negative_marks || 0);
      }
      // NAT questions don't have negative marking
      
      console.log('Marks Awarded:', marksAwarded);
      
      // Get actual time spent on this question
      const timeSpent = getTimeSpent(questionId);
      console.log('Time Spent on Question:', timeSpent, 'seconds');
      console.log('=== ANSWER CHANGE END ===');
      
      try {
        await saveUserAnswer(
          sessionId,
          question.id,
          answer,
          isCorrect,
          marksAwarded,
          timeSpent
        );
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  const handleMarkForReview = (questionId: number) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  return {
    handleAnswerChange,
    handleMarkForReview
  };
};
