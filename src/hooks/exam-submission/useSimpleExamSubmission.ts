
import { useState } from 'react';
import { Question } from '@/services/questionService';
import { useSubmissionProcess } from './useSubmissionProcess';

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

  const { processSubmission } = useSubmissionProcess({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    questionTimeData,
    isSubmitting,
    setIsSubmitting
  });

  return { 
    submitExam: processSubmission, 
    isSubmitting 
  };
};
