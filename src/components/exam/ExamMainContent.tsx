
import QuestionContent from "./QuestionContent";
import ExamNavigation from "./ExamNavigation";
import { Question } from "@/services/questionService";

interface ExamMainContentProps {
  currentQuestionData: Question;
  currentQuestion: number;
  answers: Record<number, string>;
  totalQuestions: number;
  isLoading: boolean;
  markedForReview: Set<number>;
  onAnswerChange: (questionId: number, answer: string) => void;
  onMarkForReview: () => void;
  onClearResponse: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ExamMainContent = ({
  currentQuestionData,
  currentQuestion,
  answers,
  totalQuestions,
  isLoading,
  markedForReview,
  onAnswerChange,
  onMarkForReview,
  onClearResponse,
  onNext,
  onPrevious
}: ExamMainContentProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <QuestionContent
        question={currentQuestionData}
        currentQuestion={currentQuestion}
        answer={answers[currentQuestion] || ''}
        onAnswerChange={onAnswerChange}
      />

      <ExamNavigation
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        isLoading={isLoading}
        markedForReview={markedForReview}
        onMarkForReview={onMarkForReview}
        onClearResponse={onClearResponse}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  );
};

export default ExamMainContent;
