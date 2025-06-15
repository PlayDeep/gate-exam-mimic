
import { saveUserAnswer } from '@/services/testService';
import { Question } from '@/services/questionService';

interface UseExamAnswerHandlerProps {
  sessionId: string;
  questions: Question[];
  updateAnswer: (questionId: number, answer: string) => void;
  getTimeSpent: (questionId: number) => number;
}

export const useExamAnswerHandler = ({
  sessionId,
  questions,
  updateAnswer,
  getTimeSpent
}: UseExamAnswerHandlerProps) => {
  
  const handleAnswerChange = async (questionId: number, answer: string) => {
    console.log(`AnswerHandler: Answer changed for Q${questionId}:`, answer);
    updateAnswer(questionId, answer);
    
    if (sessionId && questions[questionId - 1]) {
      const question = questions[questionId - 1];
      const normalizedAnswer = String(answer).trim();
      const normalizedCorrectAnswer = String(question.correct_answer || '').trim();
      const isCorrect = normalizedAnswer === normalizedCorrectAnswer;
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks || 1;
      } else if (question.question_type === 'MCQ') {
        marksAwarded = -(question.negative_marks || 0);
      }
      
      try {
        await saveUserAnswer(
          sessionId,
          question.id,
          answer,
          isCorrect,
          marksAwarded,
          getTimeSpent(questionId)
        );
        console.log(`AnswerHandler: Answer saved successfully for Q${questionId}`);
      } catch (error) {
        console.error(`AnswerHandler: Error saving answer for Q${questionId}:`, error);
        // Don't throw error to user, just log it - exam can continue
      }
    }
  };

  return {
    handleAnswerChange
  };
};
