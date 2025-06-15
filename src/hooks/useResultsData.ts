
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
    
    let isMounted = true;
    
    const loadResultsData = () => {
      try {
        let data = location.state;
        
        // Try sessionStorage as fallback
        if (!data || !data.answers || !data.questions) {
          console.log('useResultsData: Trying sessionStorage fallback');
          
          const storedData = sessionStorage.getItem('examResults');
          if (storedData) {
            data = JSON.parse(storedData);
            sessionStorage.removeItem('examResults');
            console.log('useResultsData: Loaded from sessionStorage');
          }
        }

        // Validate data
        if (!data) {
          throw new Error('No exam results data available');
        }

        if (!data.answers || typeof data.answers !== 'object') {
          throw new Error('Invalid answers data');
        }

        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('Invalid questions data');
        }

        // Validate questions structure
        const hasValidQuestions = data.questions.every((q, index) => {
          if (!q || typeof q !== 'object') return false;
          if (q.correct_answer === undefined) return false;
          if (!q.question_text || typeof q.question_text !== 'string') return false;
          return true;
        });

        if (!hasValidQuestions) {
          throw new Error('Questions data is incomplete');
        }

        // Process question time data
        let questionTimeData: Array<{ questionNumber: number; timeSpent: number }> = [];
        if (data.questionTimeData && Array.isArray(data.questionTimeData)) {
          questionTimeData = data.questionTimeData
            .filter(item => item && typeof item.questionNumber === 'number' && typeof item.timeSpent === 'number')
            .map(item => ({
              questionNumber: Math.max(1, Math.floor(item.questionNumber)),
              timeSpent: Math.max(0, Math.floor(item.timeSpent))
            }))
            .filter(item => item.questionNumber <= data.questions.length);
        }

        // Create final results data
        const finalResultsData: ResultsData = {
          sessionId: data.sessionId,
          score: typeof data.score === 'number' ? data.score : undefined,
          maxScore: typeof data.maxScore === 'number' ? data.maxScore : undefined,
          percentage: typeof data.percentage === 'number' ? data.percentage : undefined,
          answeredQuestions: typeof data.answeredQuestions === 'number' ? data.answeredQuestions : Object.keys(data.answers).length,
          totalQuestions: typeof data.totalQuestions === 'number' ? data.totalQuestions : data.questions.length,
          timeTaken: typeof data.timeTaken === 'number' ? data.timeTaken : undefined,
          timeSpent: typeof data.timeSpent === 'number' ? data.timeSpent : undefined,
          answers: data.answers,
          questions: data.questions,
          subject: typeof data.subject === 'string' ? data.subject.trim() : 'Unknown',
          questionTimeData
        };

        console.log('useResultsData: Results processed successfully');
        
        if (isMounted) {
          setResultsData(finalResultsData);
          setError(null);
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('useResultsData: Error loading results:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load results';
        setError(errorMessage);
        
        // Redirect after delay
        setTimeout(() => {
          if (isMounted) {
            navigate('/', { replace: true });
          }
        }, 3000);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadResultsData();

    return () => {
      isMounted = false;
    };
  }, [location.state, navigate]);

  return { resultsData, isLoading, error };
};
