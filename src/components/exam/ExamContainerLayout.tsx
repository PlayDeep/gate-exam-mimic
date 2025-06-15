
import ExamHeader from "./ExamHeader";
import ExamSidebar from "./ExamSidebar";
import ExamMainContent from "./ExamMainContent";
import { Question } from "@/services/questionService";

interface ExamContainerLayoutProps {
  subject: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onSubmitExam: () => void;
  submissionInProgress: boolean;
  currentQuestionData: Question;
  answers: Record<number, string>;
  isLoading: boolean;
  markedForReview: Set<number>;
  onAnswerChange: (questionId: number, answer: string) => void;
  onMarkForReview: () => void;
  onClearResponse: () => void;
  onNext: () => void;
  onPrevious: () => void;
  answeredCount: number;
  markedCount: number;
  onNavigateToQuestion: (questionNum: number) => void;
}

const ExamContainerLayout = ({
  subject,
  currentQuestion,
  totalQuestions,
  timeLeft,
  isFullscreen,
  onToggleFullscreen,
  onSubmitExam,
  submissionInProgress,
  currentQuestionData,
  answers,
  isLoading,
  markedForReview,
  onAnswerChange,
  onMarkForReview,
  onClearResponse,
  onNext,
  onPrevious,
  answeredCount,
  markedCount,
  onNavigateToQuestion
}: ExamContainerLayoutProps) => {
  
  return (
    <div className="min-h-screen bg-gray-100">
      <ExamHeader
        subject={subject || ''}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onSubmitExam={onSubmitExam}
        isSubmitting={submissionInProgress}
      />

      <div className="flex h-[calc(100vh-73px)]">
        <ExamMainContent
          currentQuestionData={currentQuestionData}
          currentQuestion={currentQuestion}
          answers={answers}
          totalQuestions={totalQuestions}
          isLoading={isLoading}
          markedForReview={markedForReview}
          onAnswerChange={onAnswerChange}
          onMarkForReview={onMarkForReview}
          onClearResponse={onClearResponse}
          onNext={onNext}
          onPrevious={onPrevious}
        />

        <ExamSidebar
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          markedCount={markedCount}
          currentQuestion={currentQuestion}
          answers={answers}
          markedForReview={markedForReview}
          onNavigateToQuestion={onNavigateToQuestion}
        />
      </div>
    </div>
  );
};

export default ExamContainerLayout;
