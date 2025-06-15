
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Question } from "@/services/questionService";

interface QuestionContentProps {
  question: Question;
  currentQuestion: number;
  answer: string;
  onAnswerChange: (questionId: number, answer: string) => void;
}

const QuestionContent = ({
  question,
  currentQuestion,
  answer,
  onAnswerChange
}: QuestionContentProps) => {
  // Helper function to parse options correctly
  const parseOptions = (options: any): Array<{id: string, text: string, image?: string}> => {
    if (!options) return [];
    
    console.log('Parsing options:', options, 'Type:', typeof options);
    
    // If it's already an array of objects with id and text
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]) {
      console.log('Options are already in correct format');
      return options as Array<{id: string, text: string, image?: string}>;
    }
    
    // If it's an array of strings, convert to objects
    if (Array.isArray(options)) {
      console.log('Converting string array to options format');
      const converted = options.map((option, index) => ({
        id: String.fromCharCode(65 + index), // A, B, C, D
        text: String(option),
        image: undefined
      }));
      console.log('Converted options:', converted);
      return converted;
    }
    
    // If it's an object, convert to array (new format with image support)
    if (typeof options === 'object') {
      console.log('Converting object to options format');
      const converted = Object.entries(options).map(([key, value]) => {
        // Handle new format with text and image
        if (typeof value === 'object' && value !== null && 'text' in value) {
          const optionValue = value as { text: unknown; image?: string };
          return {
            id: key,
            text: String(optionValue.text || ''),
            image: optionValue.image || undefined
          };
        }
        // Handle old format (just text)
        return {
          id: key,
          text: String(value),
          image: undefined
        };
      });
      console.log('Converted options:', converted);
      return converted;
    }
    
    console.log('Could not parse options, returning empty array');
    return [];
  };

  // Helper function to check if image URL is valid and not a placeholder
  const isValidImageUrl = (url: string | undefined): boolean => {
    if (!url) return false;
    // Filter out common placeholder URLs
    const placeholderPatterns = [
      'example.com',
      'placeholder',
      'lorem',
      'dummy',
      'test.jpg',
      'sample.png'
    ];
    
    const lowerUrl = url.toLowerCase();
    return !placeholderPatterns.some(pattern => lowerUrl.includes(pattern));
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <Card className="h-full">
        <CardContent className="p-6 h-full">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant={question.question_type === 'MCQ' ? 'default' : 'secondary'}>
                    {question.question_type}
                  </Badge>
                  <Badge variant="outline">
                    {question.marks} Mark{question.marks > 1 ? 's' : ''}
                  </Badge>
                  <Badge variant="outline">
                    {question.subject}
                  </Badge>
                </div>
                
                <h2 className="text-lg font-semibold mb-4">
                  Question {currentQuestion}
                </h2>
                
                <div className="prose prose-lg max-w-none mb-6">
                  <p>{question.question_text}</p>
                  {question.question_image && isValidImageUrl(question.question_image) && (
                    <div className="mt-4">
                      <img 
                        src={question.question_image} 
                        alt="Question diagram"
                        className="max-w-full h-auto rounded-lg border shadow-sm"
                        onError={(e) => {
                          console.error('Failed to load question image:', question.question_image);
                          e.currentTarget.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Successfully loaded question image:', question.question_image);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Options for MCQ */}
                {question.question_type === 'MCQ' && question.options && (
                  <div className="space-y-3">
                    {parseOptions(question.options).map(option => (
                      <div
                        key={option.id}
                        className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => onAnswerChange(currentQuestion, option.id)}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion}`}
                          value={option.id}
                          checked={answer === option.id}
                          onChange={() => onAnswerChange(currentQuestion, option.id)}
                          className="w-4 h-4 mt-1 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <label className="cursor-pointer block">
                            <span className="font-medium mr-2">({option.id})</span>
                            <span>{option.text}</span>
                          </label>
                          {option.image && isValidImageUrl(option.image) && (
                            <div className="mt-2">
                              <img 
                                src={option.image} 
                                alt={`Option ${option.id}`}
                                className="max-w-xs h-auto rounded border shadow-sm"
                                onError={(e) => {
                                  console.error('Failed to load option image:', option.image);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Successfully loaded option image:', option.image);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input for NAT */}
                {question.question_type === 'NAT' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter your numerical answer:
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={answer || ''}
                      onChange={(e) => onAnswerChange(currentQuestion, e.target.value)}
                      placeholder="Enter numerical value"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionContent;
