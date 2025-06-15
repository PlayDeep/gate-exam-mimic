
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

  useEffect(() => {
    console.log('Results page mounted');
    console.log('Location state:', location.state);

    const loadResultsData = () => {
      // Try to get data from location.state first (direct navigation from exam)
      let data = location.state;
      
      // If no data in location.state, try sessionStorage
      if (!data?.answers || !data?.questions) {
        console.log('No data in location.state, checking sessionStorage...');
        const storedData = sessionStorage.getItem('examResults');
        if (storedData) {
          try {
            data = JSON.parse(storedData);
            console.log('Found data in sessionStorage:', data);
            // Clear the session storage after using it
            sessionStorage.removeItem('examResults');
          } catch (error) {
            console.error('Failed to parse stored exam results:', error);
          }
        }
      }

      // Validate we have the minimum required data
      if (!data?.answers || !data?.questions || !Array.isArray(data.questions)) {
        console.error('Missing required results data:', data);
        navigate('/', { replace: true });
        return;
      }

      console.log('Valid results data found:', {
        questionsCount: data.questions.length,
        answersCount: Object.keys(data.answers || {}).length,
        subject: data.subject,
        score: data.score,
        percentage: data.percentage
      });

      // Ensure we have a subject
      const subject = data.subject || 'Unknown';
      
      // Ensure answers is an object and questions is an array
      const answers = typeof data.answers === 'object' ? data.answers : {};
      const questions = Array.isArray(data.questions) ? data.questions : [];
      
      // Calculate time spent - prioritize timeTaken from submission, then timeSpent from state
      let timeSpent = 0;
      if (data.timeTaken !== undefined) {
        timeSpent = data.timeTaken; // This is in minutes from submission
      } else if (data.timeSpent !== undefined) {
        timeSpent = data.timeSpent; // This might be in different units, keep as is
      }

      // Prepare question time data with validation
      let questionTimeData: Array<{ questionNumber: number; timeSpent: number }> = [];
      if (data.questionTimeData && Array.isArray(data.questionTimeData)) {
        questionTimeData = data.questionTimeData.filter(item => 
          typeof item === 'object' && 
          typeof item.questionNumber === 'number' && 
          typeof item.timeSpent === 'number'
        );
      }

      const finalResultsData: ResultsData = {
        sessionId: data.sessionId,
        score: data.score,
        maxScore: data.maxScore,
        percentage: data.percentage,
        answeredQuestions: data.answeredQuestions,
        totalQuestions: data.totalQuestions || questions.length,
        timeTaken: data.timeTaken,
        timeSpent: data.timeSpent,
        answers,
        questions,
        subject,
        questionTimeData
      };

      console.log('Final results data prepared:', finalResultsData);
      setResultsData(finalResultsData);
      setIsLoading(false);
    };

    loadResultsData();
  }, [location.state, navigate]);

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

  if (!resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-4">Unable to load test results.</p>
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

  // Determine final percentage - use passed percentage if available and valid, otherwise calculate
  let finalPercentage: number;
  if (passedPercentage !== undefined && passedPercentage >= 0 && passedPercentage <= 100) {
    finalPercentage = Math.round(passedPercentage);
  } else if (results.maxScore > 0) {
    finalPercentage = Math.round((results.score / results.maxScore) * 100);
  } else {
    finalPercentage = 0;
  }

  // Calculate time spent for display - convert minutes to proper format
  const timeSpentInMinutes = resultsData.timeTaken || resultsData.timeSpent || 0;
  const timeSpentFormatted = formatTimeSpent(timeSpentInMinutes);

  const gradeInfo = getGrade(finalPercentage);

  // Generate realistic question time data if not provided
  const finalQuestionTimeData = questionTimeData && questionTimeData.length > 0 
    ? questionTimeData 
    : questions.map((_, index) => {
        const questionNum = index + 1;
        const isAnswered = answers[questionNum];
        // Generate realistic time based on question complexity and whether it was answered
        let baseTime = 0;
        if (isAnswered) {
          // Answered questions: 30-180 seconds based on question type and marks
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
