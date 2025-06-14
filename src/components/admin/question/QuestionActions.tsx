
import { Button } from '@/components/ui/button';
import { Plus, TestTube, Download, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface QuestionActionsProps {
  onAddSample: () => void;
  onAddQuestion: () => void;
  onDeleteAll: () => void;
  loading: boolean;
  questions: any[];
}

const QuestionActions = ({ onAddSample, onAddQuestion, onDeleteAll, loading, questions }: QuestionActionsProps) => {
  const exportQuestions = () => {
    if (questions.length === 0) {
      alert('No questions to export');
      return;
    }

    const exportData = questions.map(q => ({
      subject: q.subject,
      question_text: q.question_text,
      question_image: q.question_image || '',
      question_type: q.question_type,
      option_a: q.options?.A?.text || q.options?.A || '',
      option_a_image: q.options?.A?.image || '',
      option_b: q.options?.B?.text || q.options?.B || '',
      option_b_image: q.options?.B?.image || '',
      option_c: q.options?.C?.text || q.options?.C || '',
      option_c_image: q.options?.C?.image || '',
      option_d: q.options?.D?.text || q.options?.D || '',
      option_d_image: q.options?.D?.image || '',
      correct_answer: q.correct_answer,
      explanation: q.explanation || '',
      explanation_image: q.explanation_image || '',
      marks: q.marks,
      negative_marks: q.negative_marks
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions");
    
    const fileName = `questions_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={onAddSample} variant="outline" disabled={loading}>
        <TestTube className="mr-2 h-4 w-4" />
        Add Sample Image Question
      </Button>
      <Button onClick={exportQuestions} variant="outline" disabled={questions.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export Questions
      </Button>
      <Button onClick={onDeleteAll} variant="destructive" disabled={loading || questions.length === 0}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete All
      </Button>
      <Button onClick={onAddQuestion}>
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    </div>
  );
};

export default QuestionActions;
