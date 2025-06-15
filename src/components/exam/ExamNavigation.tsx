
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";

interface ExamNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  isLoading: boolean;
  markedForReview: Set<number>;
  onMarkForReview: () => void;
  onClearResponse: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ExamNavigation = ({
  currentQuestion,
  totalQuestions,
  isLoading,
  markedForReview,
  onMarkForReview,
  onClearResponse,
  onNext,
  onPrevious
}: ExamNavigationProps) => {
  const isFirstQuestion = currentQuestion === 1;
  const isLastQuestion = currentQuestion >= totalQuestions;
  const hasQuestions = totalQuestions > 0;
  const isMarked = markedForReview.has(currentQuestion);

  return (
    <div className="bg-white border-t p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onMarkForReview}
            className={isMarked ? 'bg-purple-50 border-purple-200' : ''}
            disabled={isLoading || !hasQuestions}
            title={isMarked ? 'Remove from review' : 'Mark for review'}
          >
            <Flag className={`w-4 h-4 mr-1 ${isMarked ? 'text-purple-600' : ''}`} />
            {isMarked ? 'Unmark' : 'Mark'} for Review
          </Button>
          
          <Button
            variant="outline"
            onClick={onClearResponse}
            disabled={isLoading || !hasQuestions}
            title="Clear your answer for this question"
          >
            Clear Response
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            disabled={isFirstQuestion || isLoading || !hasQuestions}
            onClick={onPrevious}
            title={isFirstQuestion ? 'Already at first question' : 'Go to previous question'}
          >
            Previous
          </Button>
          
          <Button
            variant="outline"
            disabled={isLastQuestion || isLoading || !hasQuestions}
            onClick={onNext}
            title={isLastQuestion ? 'Already at last question' : 'Go to next question'}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamNavigation;
