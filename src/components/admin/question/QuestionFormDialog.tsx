
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QuestionForm from './QuestionForm';

interface Question {
  id: string;
  subject: string;
  question_text: string;
  options?: any;
  correct_answer: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  explanation?: string;
}

interface FormData {
  subject: string;
  question_text: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  explanation: string;
}

interface QuestionFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingQuestion: Question | null;
  formData: FormData;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onFormDataChange: (data: FormData) => void;
}

const QuestionFormDialog = ({
  isOpen,
  onOpenChange,
  editingQuestion,
  formData,
  loading,
  onSubmit,
  onCancel,
  onFormDataChange
}: QuestionFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQuestion ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>
        
        <QuestionForm
          formData={formData}
          editingQuestion={editingQuestion}
          loading={loading}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onFormDataChange={onFormDataChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormDialog;
