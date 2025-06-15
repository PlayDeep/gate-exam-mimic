
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
  return (
    <div className="bg-white border-t p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onMarkForReview}
            className={markedForReview.has(currentQuestion) ? 'bg-purple-50' : ''}
            disabled={isLoading}
          >
            <Flag className="w-4 h-4 mr-1" />
            {markedForReview.has(currentQuestion) ? 'Unmark' : 'Mark'} for Review
          </Button>
          
          <Button
            variant="outline"
            onClick={onClearResponse}
            disabled={isLoading}
          >
            Clear Response
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            disabled={currentQuestion === 1 || isLoading}
            onClick={onPrevious}
          >
            Previous
          </Button>
          
          <Button
            variant="outline"
            disabled={currentQuestion >= totalQuestions || totalQuestions === 0 || isLoading}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamNavigation;
