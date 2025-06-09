
import { Button } from '@/components/ui/button';
import { Plus, TestTube } from 'lucide-react';

interface QuestionActionsProps {
  onAddSample: () => void;
  onAddQuestion: () => void;
  loading: boolean;
}

const QuestionActions = ({ onAddSample, onAddQuestion, loading }: QuestionActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Button onClick={onAddSample} variant="outline" disabled={loading}>
        <TestTube className="mr-2 h-4 w-4" />
        Add Sample Image Question
      </Button>
      <Button onClick={onAddQuestion}>
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
};

export default QuestionActions;
