
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Image } from "lucide-react";

interface Question {
  id: string;
  subject: string;
  question_text: string;
  question_image?: string;
  options?: any;
  correct_answer: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  explanation?: string;
  explanation_image?: string;
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

  // Helper function to safely parse options
  const parseOptions = (options: any): Array<{id: string, text: string, image?: string}> => {
    if (!options) return [];
    
    try {
      // Handle object format (A: {text: "...", image: "..."})
      if (typeof options === 'object' && !Array.isArray(options)) {
        return Object.entries(options).map(([key, value]) => {
          if (typeof value === 'object' && value !== null && 'text' in value) {
            return {
              id: key,
              text: String((value as any).text || ''),
              image: (value as any).image || undefined
            };
          }
          // Handle old format (just text)
          return {
            id: key,
            text: String(value || ''),
            image: undefined
          };
        });
      }
      
      // Handle array format
      if (Array.isArray(options)) {
        return options.map((option, index) => ({
          id: String.fromCharCode(65 + index), // A, B, C, D
          text: typeof option === 'object' ? String(option.text || '') : String(option),
          image: typeof option === 'object' ? option.image : undefined
        }));
      }
    } catch (error) {
      console.error('Error parsing options:', error);
    }
    
    return [];
  };

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const parsedOptions = parseOptions(question.options);
        
        return (
          <div key={question.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {question.subject}
                  </span>
                  <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {question.question_type}
                  </span>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {question.marks} marks
                  </span>
                  {question.negative_marks > 0 && (
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                      -{question.negative_marks} marks
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-900 font-medium mb-2">{question.question_text}</p>
                  {question.question_image && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Image className="h-4 w-4" />
                      <span>Question has image</span>
                    </div>
                  )}
                </div>
                
                {question.options && parsedOptions.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Options:</div>
                    <div className="space-y-1">
                      {parsedOptions.map(option => (
                        <div key={option.id} className="flex items-center gap-2">
                          <span className="font-medium text-gray-600">{option.id})</span>
                          <span className="text-gray-800">{option.text}</span>
                          {option.image && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Image className="h-3 w-3" />
                              <span>img</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-600">
                    Correct Answer: {question.correct_answer}
                  </p>
                  {question.explanation && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>Has explanation</span>
                      {question.explanation_image && (
                        <Image className="h-3 w-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => onEdit(question)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onDelete(question.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuestionList;
