
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

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

interface QuestionListProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionList = ({ questions, onEdit, onDelete }: QuestionListProps) => {
  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No questions added yet. Click "Add Question" to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <div key={question.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {question.subject}
                </span>
                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {question.question_type}
                </span>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                  {question.marks} marks
                </span>
              </div>
              <p className="text-gray-900 mb-2">{question.question_text}</p>
              {question.options && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>A) {question.options.A}</div>
                  <div>B) {question.options.B}</div>
                  <div>C) {question.options.C}</div>
                  <div>D) {question.options.D}</div>
                </div>
              )}
              <p className="text-sm font-medium text-green-600 mt-2">
                Correct Answer: {question.correct_answer}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(question)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(question.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestionList;
