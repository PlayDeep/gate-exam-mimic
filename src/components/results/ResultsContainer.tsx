
import { useResultsCalculator } from "./ResultsCalculator";
import { getGrade, formatTimeSpent } from "./ResultsDataProcessor";
import { useResultsActions } from "./ResultsActions";
import ResultsLayout from "./ResultsLayout";

interface ResultsContainerProps {
  resultsData: {
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
  };
}

const ResultsContainer = ({ resultsData }: ResultsContainerProps) => {
  const { answers, questions, subject, questionTimeData, score: passedScore, percentage: passedPercentage } = resultsData;

  // Calculate results using the custom hook
  const results = useResultsCalculator({
    questions,
    answers,
    passedScore,
    passedPercentage
  });

  // Determine final percentage
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

  console.log('ResultsContainer: Final data for display:', {
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

export default ResultsContainer;
