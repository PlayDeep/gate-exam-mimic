
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calculator, Eye, EyeOff } from "lucide-react";

interface ExamHeaderProps {
  subject: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenCalculator: () => void;
  onSubmitExam: () => void;
}

const ExamHeader = ({
  subject,
  currentQuestion,
  totalQuestions,
  timeLeft,
  isFullscreen,
  onToggleFullscreen,
  onOpenCalculator,
  onSubmitExam
}: ExamHeaderProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white shadow-sm border-b px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">GATE {subject} Mock Test</h1>
          <Badge variant="outline">Question {currentQuestion} of {totalQuestions}</Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-red-600" />
            <span className="font-mono text-lg text-red-600">{formatTime(timeLeft)}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCalculator}
          >
            <Calculator className="w-4 h-4 mr-1" />
            Calculator
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={onSubmitExam}
          >
            Submit Test
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ExamHeader;
