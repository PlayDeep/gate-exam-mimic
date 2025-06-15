
import { Button } from "@/components/ui/button";
import ResultsHeader from "./ResultsHeader";
import ScoreOverview from "./ScoreOverview";
import QuestionAnalysis from "./QuestionAnalysis";
import SubjectAnalysis from "./SubjectAnalysis";
import AnswerReview from "./AnswerReview";
import { ResultsData } from "./ResultsCalculator";
import { GradeInfo } from "./ResultsDataProcessor";

interface ResultsLayoutProps {
  subject: string;
  results: ResultsData;
  percentage: number;
  gradeInfo: GradeInfo;
  timeSpentFormatted: string;
  totalTimeSpent: number;
  answers: Record<number, string>;
  questions: any[];
  questionTimeData: Array<{ questionNumber: number; timeSpent: number }>;
  onTakeAnother: () => void;
  onDownloadReport: () => void;
  onShareResults: () => void;
}

const ResultsLayout = ({
  subject,
  results,
  percentage,
  gradeInfo,
  timeSpentFormatted,
  totalTimeSpent,
  answers,
  questions,
  questionTimeData,
  onTakeAnother,
  onDownloadReport,
  onShareResults
}: ResultsLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ResultsHeader
        subject={subject}
        onTakeAnother={onTakeAnother}
        onDownloadReport={onDownloadReport}
        onShareResults={onShareResults}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScoreOverview
          score={results.score}
          maxScore={results.maxScore}
          percentage={percentage}
          gradeInfo={gradeInfo}
          timeSpentFormatted={timeSpentFormatted}
          totalTimeSpent={totalTimeSpent}
          totalQuestions={results.totalQuestions}
          answers={answers}
          questionTimeData={questionTimeData}
        />

        <QuestionAnalysis
          correctAnswers={results.correctAnswers}
          wrongAnswers={results.wrongAnswers}
          unanswered={results.unanswered}
          totalQuestions={results.totalQuestions}
        />

        <SubjectAnalysis subjectWiseAnalysis={results.subjectWiseAnalysis} />

        <AnswerReview questions={questions} answers={answers} />

        <div className="text-center mt-8">
          <Button size="lg" onClick={onTakeAnother} className="mr-4">
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsLayout;
