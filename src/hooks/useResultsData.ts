
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
        
        // Try location.state first, then sessionStorage as fallback
        if (!data || !data.answers || !data.questions) {
          console.log('useResultsData: Invalid location.state, checking sessionStorage...');
          
          try {
            const storedData = sessionStorage.getItem('examResults');
            if (storedData) {
              data = JSON.parse(storedData);
              sessionStorage.removeItem('examResults');
              console.log('useResultsData: Successfully loaded data from sessionStorage');
            }
          } catch (parseError) {
            console.error('useResultsData: Failed to parse stored exam results:', parseError);
            throw new Error('Failed to load stored results - corrupted data');
          }
        }

        // Final validation
        if (!data) {
          throw new Error('No exam results data available from any source');
        }

        if (!data.answers || typeof data.answers !== 'object') {
          throw new Error('Invalid or missing answers data');
        }

        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          throw new Error('Invalid or missing questions data');
        }

        // Validate question structure
        const hasValidQuestions = data.questions.every((q, index) => {
          if (!q || typeof q !== 'object') {
            console.error(`Question ${index + 1} is not a valid object:`, q);
            return false;
          }
          if (q.correct_answer === undefined) {
            console.error(`Question ${index + 1} missing correct_answer:`, q);
            return false;
          }
          return true;
        });

        if (!hasValidQuestions) {
          throw new Error('Questions data is incomplete or invalid');
        }

        // Validate questionTimeData if present
        let questionTimeData: Array<{ questionNumber: number; timeSpent: number }> = [];
        if (data.questionTimeData && Array.isArray(data.questionTimeData)) {
          questionTimeData = data.questionTimeData.filter(item => 
            typeof item === 'object' && 
            item !== null &&
            typeof item.questionNumber === 'number' && 
            typeof item.timeSpent === 'number' &&
            item.questionNumber > 0 &&
            item.timeSpent >= 0
          );
          console.log('useResultsData: Validated question time data:', questionTimeData.length, 'entries');
        }

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
          subject: typeof data.subject === 'string' && data.subject.trim() ? data.subject : 'Unknown',
          questionTimeData
        };

        console.log('useResultsData: Final results data prepared successfully');
        console.log('useResultsData: Data summary:', {
          hasScore: finalResultsData.score !== undefined,
          hasPercentage: finalResultsData.percentage !== undefined,
          answersCount: Object.keys(finalResultsData.answers).length,
          questionsCount: finalResultsData.questions.length,
          hasTimeData: finalResultsData.questionTimeData && finalResultsData.questionTimeData.length > 0,
          subject: finalResultsData.subject
        });
        
        setResultsData(finalResultsData);
        setError(null);
      } catch (error) {
        console.error('useResultsData: Error loading results data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load exam results';
        setError(errorMessage);
        
        // Redirect to home after showing error
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    loadResultsData();
  }, [location.state, navigate]);

  return { resultsData, isLoading, error };
};
