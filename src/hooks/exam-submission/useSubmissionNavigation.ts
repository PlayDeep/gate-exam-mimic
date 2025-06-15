
import { useNavigate } from 'react-router-dom';
import { Question } from '@/services/questionService';

interface UseSubmissionNavigationProps {
  sessionId: string;
  questions: Question[];
  answers: Record<number, string>;
  subject?: string;
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
}

export const useSubmissionNavigation = ({
  sessionId,
  questions,
  answers,
  subject,
  questionTimeData = []
}: UseSubmissionNavigationProps) => {
  const navigate = useNavigate();

  const navigateToResults = (results: any) => {
    const resultsData = {
      sessionId,
      score: results.totalScore,
      maxScore: results.maxPossibleScore,
      percentage: results.percentage,
      answeredQuestions: results.answeredQuestions,
      totalQuestions: results.totalQuestions,
      timeTaken: results.timeTakenInMinutes,
      timeSpent: results.timeTakenInMinutes,
      answers: { ...answers },
      questions: [...questions],
      subject: subject || 'Unknown',
      questionTimeData: questionTimeData.length > 0 ? [...questionTimeData] : []
    };

    // Store results in sessionStorage
    try {
      const dataToStore = JSON.stringify(resultsData);
      if (typeof Storage !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('examResults', dataToStore);
        console.log('Results stored in sessionStorage');
      }
    } catch (storageError) {
      console.error('Failed to store results in sessionStorage:', storageError);
    }

    console.log('=== NAVIGATING TO RESULTS ===');
    navigate('/results', {
      state: resultsData,
      replace: true
    });
    console.log('Navigation to results initiated');
  };

  return { navigateToResults };
};
