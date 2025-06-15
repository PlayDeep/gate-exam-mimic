
import { Progress } from "@/components/ui/progress";

interface ExamSidebarProps {
  totalQuestions: number;
  answeredCount: number;
  markedCount: number;
  currentQuestion: number;
  answers: Record<number, string>;
  markedForReview: Set<number>;
  onNavigateToQuestion: (questionNum: number) => void;
}

const ExamSidebar = ({
  totalQuestions,
  answeredCount,
  markedCount,
  currentQuestion,
  answers,
  markedForReview,
  onNavigateToQuestion
}: ExamSidebarProps) => {
  const notAnsweredCount = totalQuestions - answeredCount;

  const getQuestionStatus = (questionId: number) => {
    const isAnswered = answers[questionId];
    const isMarked = markedForReview.has(questionId);
    
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'not-answered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500';
      case 'marked': return 'bg-purple-500';
      case 'answered-marked': return 'bg-blue-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="w-80 bg-white border-l">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-4">Question Navigation</h3>
        
        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{answeredCount}/{totalQuestions}</span>
          </div>
          <Progress value={totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0} />
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Not Answered ({notAnsweredCount})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span>Marked ({markedCount})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Both</span>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((questionNum) => {
            const status = getQuestionStatus(questionNum);
            const isCurrent = questionNum === currentQuestion;
            
            return (
              <button
                key={questionNum}
                onClick={() => onNavigateToQuestion(questionNum)}
                className={`
                  w-10 h-10 rounded text-white text-sm font-medium
                  ${isCurrent ? 'ring-2 ring-gray-400' : ''}
                  ${getStatusColor(status)}
                  hover:opacity-80 transition-all
                `}
              >
                {questionNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExamSidebar;
