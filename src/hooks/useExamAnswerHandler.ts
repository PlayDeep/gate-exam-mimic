
import { useCallback, useRef } from 'react';
import { saveUserAnswer } from '@/services/testService';
import { Question } from '@/services/questionService';

interface UseExamAnswerHandlerProps {
  sessionId: string;
  questions: Question[];
  updateAnswer: (questionNum: number, answer: string) => void;
  getTimeSpent: (questionNum: number) => number;
}

export const useExamAnswerHandler = ({
  sessionId,
  questions,
  updateAnswer,
  getTimeSpent
}: UseExamAnswerHandlerProps) => {
  const lastSavedAnswerRef = useRef<Record<number, string>>({});

  const handleAnswerChange = useCallback(async (questionNum: number, answer: string) => {
    console.log('ExamAnswerHandler: Answer changed for question', questionNum, 'to:', answer);
    
    // Prevent saving the same answer multiple times
    if (lastSavedAnswerRef.current[questionNum] === answer) {
      console.log('ExamAnswerHandler: Answer unchanged, skipping save');
      return;
    }

    // Update local state immediately
    updateAnswer(questionNum, answer);
    
    // Get question data
    const question = questions[questionNum - 1];
    if (!question) {
      console.error('ExamAnswerHandler: Question not found for number:', questionNum);
      return;
    }

    // Calculate correctness and marks
    const isCorrect = String(answer).trim() === String(question.correct_answer).trim();
    let marksAwarded = 0;
    
    if (answer && answer.trim() !== '') {
      if (isCorrect) {
        marksAwarded = question.marks || 1;
      } else if (question.question_type === 'MCQ') {
        marksAwarded = -(question.negative_marks || 1/3);
      }
    }

    // Get time spent on this question
    const timeSpent = getTimeSpent(questionNum);
    
    console.log('ExamAnswerHandler: Saving answer with details:', {
      questionNum,
      questionId: question.id,
      answer,
      isCorrect,
      marksAwarded,
      timeSpent
    });

    try {
      // Save to database
      await saveUserAnswer(
        sessionId,
        question.id,
        answer,
        isCorrect,
        marksAwarded,
        timeSpent
      );
      
      // Update the last saved answer reference
      lastSavedAnswerRef.current[questionNum] = answer;
      console.log('ExamAnswerHandler: Answer saved successfully');
      
    } catch (error) {
      console.error('ExamAnswerHandler: Failed to save answer:', error);
      // Don't throw error to avoid breaking the UI
      // The answer is still saved locally and will be submitted with the exam
    }
  }, [sessionId, questions, updateAnswer, getTimeSpent]);

  return { handleAnswerChange };
};
