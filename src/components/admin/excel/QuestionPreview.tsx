
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ExcelQuestion {
  question_text: string;
  question_type: 'MCQ' | 'NAT';
  correct_answer: string;
  marks: number;
}

interface QuestionPreviewProps {
  preview: ExcelQuestion[];
  subject: string;
  uploading: boolean;
  onUpload: () => void;
}

const QuestionPreview = ({ preview, subject, uploading, onUpload }: QuestionPreviewProps) => {
  if (preview.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Preview ({preview.length} questions)</h4>
        <Button 
          onClick={onUpload} 
          disabled={uploading || !subject}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Questions'}
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Question</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Correct Answer</th>
              <th className="p-2 text-left">Marks</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((q, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{q.question_text.slice(0, 50)}...</td>
                <td className="p-2">{q.question_type}</td>
                <td className="p-2">{q.correct_answer}</td>
                <td className="p-2">{q.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuestionPreview;
