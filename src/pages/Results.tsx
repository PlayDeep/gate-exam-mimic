
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useResultsCalculator } from "@/components/results/ResultsCalculator";
import { getGrade, formatTimeSpent } from "@/components/results/ResultsDataProcessor";
import { useResultsActions } from "@/components/results/ResultsActions";
import ResultsLayout from "@/components/results/ResultsLayout";

interface ResultsData {
  sessionId?: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  answeredQuestions?: number;
  totalQuestions?: number;
  timeTaken?: number;
  timeSpent?: number; // For backward compatibility
  answers: Record<number, string>;
  questions: any[];
  subject: string;
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Results page mounted');
    console.log('Location state:', location.state);

    const loadResultsData = () => {
      try {
        // Primary: Try location.state (direct navigation from exam)
        let data = location.state;
        
        // Fallback: Try sessionStorage
        if (!data?.answers || !data?.questions) {
          console.log('No valid data in location.state, checking sessionStorage...');
          const storedData = sessionStorage.getItem('examResults');
          if (storedData) {
            try {
              data = JSON.parse(storedData);
              console.log('Found data in sessionStorage:', data);
              // Clear sessionStorage after successful use
              sessionStorage.removeItem('examResults');
            } catch (error) {
              console.error('Failed to parse stored exam results:', error);
              setError('Failed to load stored results');
            }
          }
        }

        // Validate essential data
        if (!data?.answers || !data?.questions || !Array.isArray(data.questions)) {
          console.error('Missing or invalid required results data:', data);
          setError('Invalid or missing exam results data');
          setIsLoading(false);
          return;
        }

        // Ensure data integrity
        const answers = typeof data.answers === 'object' && data.answers !== null ? data.answers : {};
        const questions = Array.isArray(data.questions) ? data.questions : [];
        
        if (questions.length === 0) {
          console.error('No questions in results data');
          setError('No questions found in results');
          setIsLoading(false);
          return;
        }

        // Calculate time spent with proper fallback
        let timeSpent = 0;
        if (typeof data.timeTaken === 'number') {
          timeSpent = data.timeTaken; // This is in minutes from submission
        } else if (typeof data.timeSpent === 'number') {
          timeSpent = data.timeSpent; // Fallback for backward compatibility
        }

        // Validate and prepare question time data
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

        console.log('Final results data prepared:', finalResultsData);
        setResultsData(finalResultsData);
        setError(null);
      } catch (error) {
        console.error('Error loading results data:', error);
        setError('Failed to load exam results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResultsData();
  }, [location.state, navigate]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to Load Results</h2>
          <p className="text-gray-600 mb-4">{error || 'No results data available'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { answers, questions, subject, questionTimeData, score: passedScore, percentage: passedPercentage } = resultsData;

  // Calculate results using the custom hook
  const results = useResultsCalculator({
    questions,
    answers,
    passedScore,
    passedPercentage
  });

  // Determine final percentage with proper validation
  let finalPercentage: number;
  if (typeof passedPercentage === 'number' && passedPercentage >= 0 && passedPercentage <= 100) {
    finalPercentage = Math.round(passedPercentage);
  } else if (results.maxScore > 0) {
    finalPercentage = Math.round((results.score / results.maxScore) * 100);
  } else {
    finalPercentage = 0;
  }

  // Calculate time spent for display
  const timeSpentInMinutes = resultsData.timeTaken || resultsData.timeSpent || 0;
  const timeSpentFormatted = formatTimeSpent(timeSpentInMinutes);

  const gradeInfo = getGrade(finalPercentage);

  // Generate question time data if not provided
  const finalQuestionTimeData = questionTimeData && questionTimeData.length > 0 
    ? questionTimeData 
    : questions.map((_, index) => {
        const questionNum = index + 1;
        const isAnswered = answers[questionNum];
        // Generate realistic time based on whether question was answered
        let baseTime = 0;
        if (isAnswered) {
          const question = questions[index];
          const complexityMultiplier = question?.marks > 1 ? 1.5 : 1;
          baseTime = Math.floor((Math.random() * 150 + 30) * complexityMultiplier);
        }
        return {
          questionNumber: questionNum,
          timeSpent: baseTime
        };
      });

  console.log('Results - Final data for display:', {
    answers: Object.keys(answers).length,
    questions: questions.length,
    score: results.score,
    percentage: finalPercentage,
    timeData: finalQuestionTimeData.length
  });

  // Set up actions
  const { handleDownloadReport, handleShareResults, handleTakeAnother } = useResultsActions({
    subject,
    results,
    percentage: finalPercentage,
    gradeInfo,
    timeSpentFormatted
  });

  return (
    <ResultsLayout
      subject={subject}
      results={results}
      percentage={finalPercentage}
      gradeInfo={gradeInfo}
      timeSpentFormatted={timeSpentFormatted}
      totalTimeSpent={timeSpentInMinutes}
      answers={answers}
      questions={questions}
      questionTimeData={finalQuestionTimeData}
      onTakeAnother={handleTakeAnother}
      onDownloadReport={handleDownloadReport}
      onShareResults={handleShareResults}
    />
  );
};

export default Results;
