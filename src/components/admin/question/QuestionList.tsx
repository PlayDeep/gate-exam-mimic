
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

  // Helper function to parse options correctly
  const parseOptions = (options: any): Array<{id: string, text: string}> => {
    if (!options) return [];
    
    // If it's already an array of objects with id and text
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]) {
      return options.map(option => ({
        id: option.id,
        text: typeof option.text === 'object' && option.text !== null ? 
          (option.text.text || String(option.text)) : 
          String(option.text)
      }));
    }
    
    // If it's an array of strings, convert to objects
    if (Array.isArray(options)) {
      return options.map((option, index) => ({
        id: String.fromCharCode(65 + index), // A, B, C, D
        text: String(option)
      }));
    }
    
    // If it's an object, convert to array
    if (typeof options === 'object') {
      return Object.entries(options).map(([key, value]) => {
        // Handle new format with text and image
        if (typeof value === 'object' && value !== null && 'text' in value) {
          const optionValue = value as { text: unknown; image?: string };
          return {
            id: key,
            text: String(optionValue.text || '')
          };
        }
        // Handle old format (just text)
        return {
          id: key,
          text: String(value)
        };
      });
    }
    
    return [];
  };

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
                  {parseOptions(question.options).map(option => (
                    <div key={option.id}>
                      {option.id}) {option.text}
                    </div>
                  ))}
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
