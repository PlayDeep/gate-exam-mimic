
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
    console.log('useResultsData: Loading results data from location.state:', location.state);
    
    const loadResultsData = () => {
      try {
        let data = location.state;
        
        // Enhanced validation for location.state
        if (!data?.answers || !data?.questions) {
          console.log('useResultsData: No valid data in location.state, checking sessionStorage...');
          const storedData = sessionStorage.getItem('examResults');
          if (storedData) {
            try {
              data = JSON.parse(storedData);
              sessionStorage.removeItem('examResults');
              console.log('useResultsData: Successfully loaded data from sessionStorage');
            } catch (parseError) {
              console.error('useResultsData: Failed to parse stored exam results:', parseError);
              setError('Failed to load stored results - corrupted data');
              setIsLoading(false);
              return;
            }
          }
        }

        // Enhanced data validation
        if (!data) {
          console.error('useResultsData: No data available from any source');
          setError('No exam results data available');
          setIsLoading(false);
          return;
        }

        if (!data.answers || typeof data.answers !== 'object') {
          console.error('useResultsData: Invalid answers data:', data.answers);
          setError('Invalid answers data format');
          setIsLoading(false);
          return;
        }

        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
          console.error('useResultsData: Invalid questions data:', data.questions);
          setError('Invalid or missing questions data');
          setIsLoading(false);
          return;
        }

        const answers = data.answers;
        const questions = data.questions;
        
        // Validate question structure
        const hasValidQuestions = questions.every(q => 
          q && 
          typeof q === 'object' && 
          (q.correct_answer !== undefined)
        );

        if (!hasValidQuestions) {
          console.error('useResultsData: Questions missing required fields');
          setError('Questions data is incomplete');
          setIsLoading(false);
          return;
        }

        const timeSpent = data.timeTaken || data.timeSpent || 0;
        let questionTimeData: Array<{ questionNumber: number; timeSpent: number }> = [];
        
        // Enhanced validation for questionTimeData
        if (data.questionTimeData && Array.isArray(data.questionTimeData)) {
          questionTimeData = data.questionTimeData.filter(item => 
            typeof item === 'object' && 
            item !== null &&
            typeof item.questionNumber === 'number' && 
            typeof item.timeSpent === 'number' &&
            item.questionNumber > 0 &&
            item.timeSpent >= 0
          );
          console.log('useResultsData: Filtered question time data:', questionTimeData.length, 'valid entries');
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
        console.log('useResultsData: Data summary:', {
          hasScore: finalResultsData.score !== undefined,
          hasPercentage: finalResultsData.percentage !== undefined,
          answersCount: Object.keys(finalResultsData.answers).length,
          questionsCount: finalResultsData.questions.length,
          hasTimeData: finalResultsData.questionTimeData && finalResultsData.questionTimeData.length > 0
        });
        
        setResultsData(finalResultsData);
        setError(null);
      } catch (error) {
        console.error('useResultsData: Error loading results data:', error);
        setError('Failed to load exam results - unexpected error');
      } finally {
        setIsLoading(false);
      }
    };

    loadResultsData();
  }, [location.state]);

  return { resultsData, isLoading, error };
};
