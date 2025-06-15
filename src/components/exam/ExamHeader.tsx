
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calculator, Eye, EyeOff, Keyboard } from "lucide-react";
import ExamCalculatorModal from "./ExamCalculatorModal";
import AutoSaveIndicator from "./AutoSaveIndicator";

interface ExamHeaderProps {
  subject: string;
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onSubmitExam: () => void;
  isSubmitting?: boolean;
}

const ExamHeader = ({
  subject,
  currentQuestion,
  totalQuestions,
  timeLeft,
  isFullscreen,
  onToggleFullscreen,
  onSubmitExam,
  isSubmitting = false
}: ExamHeaderProps) => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return "text-red-600 bg-red-50"; // 5 minutes
    if (timeLeft <= 600) return "text-orange-600 bg-orange-50"; // 10 minutes
    if (timeLeft <= 1800) return "text-yellow-600 bg-yellow-50"; // 30 minutes
    return "text-red-600 bg-red-50";
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">GATE {subject} Mock Test</h1>
            <Badge variant="outline">Question {currentQuestion} of {totalQuestions}</Badge>
            <AutoSaveIndicator status="saved" lastSaved={new Date()} />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getTimeColor()}`}>
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCalculatorOpen(true)}
              title="Open Calculator (Ctrl+Alt+C)"
            >
              <Calculator className="w-4 h-4 mr-1" />
              Calculator
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Keyboard Shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              title="Toggle Fullscreen (F11)"
            >
              {isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
            
            <Button
              variant="destructive"
              onClick={onSubmitExam}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Test'}
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts Panel */}
        {showShortcuts && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold mb-2">Keyboard Shortcuts:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><kbd className="bg-white px-2 py-1 rounded border">←</kbd> Previous Question</div>
              <div><kbd className="bg-white px-2 py-1 rounded border">→</kbd> Next Question</div>
              <div><kbd className="bg-white px-2 py-1 rounded border">Ctrl+M</kbd> Mark for Review</div>
              <div><kbd className="bg-white px-2 py-1 rounded border">Del</kbd> Clear Answer</div>
            </div>
          </div>
        )}
      </header>

      <ExamCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </>
  );
};

export default ExamHeader;
