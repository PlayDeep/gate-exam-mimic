
import { useLocation, useNavigate } from "react-router-dom";
import { useResultsCalculator } from "@/components/results/ResultsCalculator";
import { getGrade, formatTimeSpent, generateQuestionTimeData } from "@/components/results/ResultsDataProcessor";
import { useResultsActions } from "@/components/results/ResultsActions";
import ResultsLayout from "@/components/results/ResultsLayout";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { answers, questions, timeSpent, subject, score: passedScore, percentage: passedPercentage } = location.state || {};

  if (!answers || !questions) {
    navigate('/');
    return null;
  }

  // Calculate results using the custom hook
  const results = useResultsCalculator({
    questions,
    answers,
    passedScore,
    passedPercentage
  });

  // Process data
  const percentage = passedScore !== undefined && passedPercentage !== undefined 
    ? passedPercentage 
    : Math.round((results.score / results.maxScore) * 100);
  
  const gradeInfo = getGrade(percentage);
  const timeSpentFormatted = formatTimeSpent(timeSpent);
  const questionTimeData = generateQuestionTimeData(questions, answers);

  // Set up actions
  const { handleDownloadReport, handleShareResults, handleTakeAnother } = useResultsActions({
    subject,
    results,
    percentage,
    gradeInfo,
    timeSpentFormatted
  });

  return (
    <ResultsLayout
      subject={subject}
      results={results}
      percentage={percentage}
      gradeInfo={gradeInfo}
      timeSpentFormatted={timeSpentFormatted}
      totalTimeSpent={timeSpent}
      answers={answers}
      questions={questions}
      questionTimeData={questionTimeData}
      onTakeAnother={handleTakeAnother}
      onDownloadReport={handleDownloadReport}
      onShareResults={handleShareResults}
    />
  );
};

export default Results;
