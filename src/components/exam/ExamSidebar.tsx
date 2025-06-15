
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Flag, AlertCircle, Target } from "lucide-react";

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
  const completionPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

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
      case 'answered': return 'bg-green-500 hover:bg-green-600';
      case 'marked': return 'bg-purple-500 hover:bg-purple-600';
      case 'answered-marked': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-red-500 hover:bg-red-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <CheckCircle className="w-3 h-3" />;
      case 'marked': return <Flag className="w-3 h-3" />;
      case 'answered-marked': return <Target className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="w-80 bg-white border-l flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-4 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Question Navigation
        </h3>
        
        {/* Enhanced Progress */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-semibold">{answeredCount}/{totalQuestions}</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="text-xs text-gray-600 text-center">
            {completionPercentage.toFixed(1)}% Complete
          </div>
        </div>

        {/* Enhanced Status Legend */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded flex items-center justify-center">
                <CheckCircle className="w-2 h-2 text-white" />
              </div>
              <span>Answered</span>
            </div>
            <Badge variant="outline" className="text-xs">{answeredCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded flex items-center justify-center">
                <AlertCircle className="w-2 h-2 text-white" />
              </div>
              <span>Not Answered</span>
            </div>
            <Badge variant="outline" className="text-xs">{notAnsweredCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded flex items-center justify-center">
                <Flag className="w-2 h-2 text-white" />
              </div>
              <span>Marked for Review</span>
            </div>
            <Badge variant="outline" className="text-xs">{markedCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded flex items-center justify-center">
                <Target className="w-2 h-2 text-white" />
              </div>
              <span>Answered & Marked</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1)
                .filter(q => answers[q] && markedForReview.has(q)).length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((questionNum) => {
            const status = getQuestionStatus(questionNum);
            const isCurrent = questionNum === currentQuestion;
            
            return (
              <button
                key={questionNum}
                onClick={() => onNavigateToQuestion(questionNum)}
                className={`
                  w-10 h-10 rounded text-white text-sm font-medium relative
                  ${isCurrent ? 'ring-2 ring-gray-400 ring-offset-1' : ''}
                  ${getStatusColor(status)}
                  transition-all duration-200 
                  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
                title={`Question ${questionNum} - ${status.replace('-', ' and ')}`}
              >
                <span className="relative z-10">{questionNum}</span>
                <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-1">
                  {getStatusIcon(status)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Current Question:</span>
            <span className="font-semibold">{currentQuestion}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span className="font-semibold">{totalQuestions - currentQuestion}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSidebar;
