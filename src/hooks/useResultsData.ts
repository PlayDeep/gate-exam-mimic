
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
    
    let redirectTimeout: NodeJS.Timeout | null = null;
    
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

        // Validate question structure with enhanced checks
        const hasValidQuestions = data.questions.every((q, index) => {
          if (!q || typeof q !== 'object') {
            console.error(`Question ${index + 1} is not a valid object:`, q);
            return false;
          }
          if (q.correct_answer === undefined) {
            console.error(`Question ${index + 1} missing correct_answer:`, q);
            return false;
          }
          if (!q.question_text || typeof q.question_text !== 'string') {
            console.error(`Question ${index + 1} missing or invalid question_text:`, q);
            return false;
          }
          return true;
        });

        if (!hasValidQuestions) {
          throw new Error('Questions data is incomplete or invalid');
        }

        // Enhanced validation and cleanup for questionTimeData
        let questionTimeData: Array<{ questionNumber: number; timeSpent: number }> = [];
        if (data.questionTimeData && Array.isArray(data.questionTimeData)) {
          questionTimeData = data.questionTimeData
            .filter(item => {
              // More robust validation
              if (!item || typeof item !== 'object') return false;
              if (typeof item.questionNumber !== 'number' || typeof item.timeSpent !== 'number') return false;
              if (item.questionNumber <= 0 || item.timeSpent < 0) return false;
              if (!isFinite(item.questionNumber) || !isFinite(item.timeSpent)) return false;
              if (isNaN(item.questionNumber) || isNaN(item.timeSpent)) return false;
              return true;
            })
            .map(item => ({
              questionNumber: Math.floor(Math.abs(item.questionNumber)), // Ensure positive integer
              timeSpent: Math.max(0, Math.floor(item.timeSpent)) // Ensure non-negative integer
            }))
            .filter(item => item.questionNumber > 0); // Final filter for valid question numbers
          
          console.log('useResultsData: Validated question time data:', questionTimeData.length, 'entries');
        }

        // Enhanced data validation with defaults
        const finalResultsData: ResultsData = {
          sessionId: typeof data.sessionId === 'string' ? data.sessionId : undefined,
          score: typeof data.score === 'number' && isFinite(data.score) ? data.score : undefined,
          maxScore: typeof data.maxScore === 'number' && isFinite(data.maxScore) ? data.maxScore : undefined,
          percentage: typeof data.percentage === 'number' && isFinite(data.percentage) && data.percentage >= 0 && data.percentage <= 100 ? data.percentage : undefined,
          answeredQuestions: typeof data.answeredQuestions === 'number' && isFinite(data.answeredQuestions) ? data.answeredQuestions : Object.keys(data.answers).length,
          totalQuestions: typeof data.totalQuestions === 'number' && isFinite(data.totalQuestions) ? data.totalQuestions : data.questions.length,
          timeTaken: typeof data.timeTaken === 'number' && isFinite(data.timeTaken) ? data.timeTaken : undefined,
          timeSpent: typeof data.timeSpent === 'number' && isFinite(data.timeSpent) ? data.timeSpent : undefined,
          answers: data.answers,
          questions: data.questions,
          subject: typeof data.subject === 'string' && data.subject.trim() ? data.subject.trim() : 'Unknown',
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
        
        // Redirect to home after showing error with proper cleanup
        redirectTimeout = setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    loadResultsData();

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [location.state, navigate]);

  return { resultsData, isLoading, error };
};
