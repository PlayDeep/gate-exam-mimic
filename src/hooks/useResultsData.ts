
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ResultsData {
  sessionId?: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  answeredQuestions?: number;
  totalQuestions?: number;
  timeTaken?: number;
  timeSpent?: number;
  answers: Record<number, string>;
  questions: any[];
  subject: string;
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
}

export const useResultsData = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useResultsData: Loading results data');
    
    const loadResultsData = () => {
      try {
        let data = location.state;
        
        if (!data?.answers || !data?.questions) {
          console.log('useResultsData: No valid data in location.state, checking sessionStorage...');
          const storedData = sessionStorage.getItem('examResults');
          if (storedData) {
            try {
              data = JSON.parse(storedData);
              sessionStorage.removeItem('examResults');
            } catch (error) {
              console.error('useResultsData: Failed to parse stored exam results:', error);
              setError('Failed to load stored results');
              setIsLoading(false);
              return;
            }
          }
        }

        if (!data?.answers || !data?.questions || !Array.isArray(data.questions)) {
          console.error('useResultsData: Missing or invalid required results data:', data);
          setError('Invalid or missing exam results data');
          setIsLoading(false);
          return;
        }

        const answers = typeof data.answers === 'object' && data.answers !== null ? data.answers : {};
        const questions = Array.isArray(data.questions) ? data.questions : [];
        
        if (questions.length === 0) {
          console.error('useResultsData: No questions in results data');
          setError('No questions found in results');
          setIsLoading(false);
          return;
        }

        const timeSpent = data.timeTaken || data.timeSpent || 0;
        let questionTimeData: Array<{ questionNumber: number; timeSpent: number }> = [];
        
        if (data.questionTimeData && Array.isArray(data.questionTimeData)) {
          questionTimeData = data.questionTimeData.filter(item => 
            typeof item === 'object' && 
            item !== null &&
            typeof item.questionNumber === 'number' && 
            typeof item.timeSpent === 'number'
          );
        }

        const finalResultsData: ResultsData = {
          sessionId: data.sessionId,
          score: typeof data.score === 'number' ? data.score : undefined,
          maxScore: typeof data.maxScore === 'number' ? data.maxScore : undefined,
          percentage: typeof data.percentage === 'number' ? data.percentage : undefined,
          answeredQuestions: typeof data.answeredQuestions === 'number' ? data.answeredQuestions : Object.keys(answers).length,
          totalQuestions: typeof data.totalQuestions === 'number' ? data.totalQuestions : questions.length,
          timeTaken: typeof data.timeTaken === 'number' ? data.timeTaken : undefined,
          timeSpent: typeof data.timeSpent === 'number' ? data.timeSpent : undefined,
          answers,
          questions,
          subject: typeof data.subject === 'string' ? data.subject : 'Unknown',
          questionTimeData
        };

        console.log('useResultsData: Final results data prepared successfully');
        setResultsData(finalResultsData);
        setError(null);
      } catch (error) {
        console.error('useResultsData: Error loading results data:', error);
        setError('Failed to load exam results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResultsData();
  }, []); // Empty dependency array to prevent re-renders

  return { resultsData, isLoading, error };
};
