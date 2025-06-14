
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AnswerReviewProps {
  questions: any[];
  answers: Record<number, string>;
}

const AnswerReview = ({ questions, answers }: AnswerReviewProps) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionIndex)) {
        newSet.delete(questionIndex);
      } else {
        newSet.add(questionIndex);
      }
      return newSet;
    });
  };

  const parseOptions = (options: any): Array<{id: string, text: string, image?: string}> => {
    if (!options) return [];
    
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]) {
      return options as Array<{id: string, text: string, image?: string}>;
    }
    
    if (Array.isArray(options)) {
      return options.map((option, index) => ({
        id: String.fromCharCode(65 + index),
        text: String(option),
        image: undefined
      }));
    }
    
    if (typeof options === 'object') {
      return Object.entries(options).map(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'text' in value) {
          const optionValue = value as { text: unknown; image?: string };
          return {
            id: key,
            text: String(optionValue.text || ''),
            image: optionValue.image || undefined
          };
        }
        return {
          id: key,
          text: String(value),
          image: undefined
        };
      });
    }
    
    return [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Answer Review</CardTitle>
        <CardDescription>
          Review all questions with your answers and explanations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const questionNum = index + 1;
            const userAnswer = answers[questionNum];
            const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
            const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
            const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
            const isExpanded = expandedQuestions.has(questionNum);
            
            return (
              <Card key={question.id || index} className="border-l-4 border-l-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Q{questionNum}.</span>
                      <Badge variant={question.question_type === 'MCQ' ? 'default' : 'secondary'}>
                        {question.question_type}
                      </Badge>
                      <Badge variant="outline">
                        {question.marks} Mark{question.marks > 1 ? 's' : ''}
                      </Badge>
                      <Badge 
                        variant={
                          !userAnswer ? 'secondary' : 
                          isCorrect ? 'default' : 'destructive'
                        }
                        className={
                          !userAnswer ? 'bg-gray-100 text-gray-600' :
                          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }
                      >
                        {!userAnswer ? 'Not Answered' : isCorrect ? 'Correct' : 'Wrong'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestion(questionNum)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{question.question_text}</p>
                    {question.question_image && (
                      <div className="mt-2">
                        <img 
                          src={question.question_image} 
                          alt="Question diagram"
                          className="max-w-md h-auto rounded border shadow-sm"
                          onError={(e) => {
                            console.error('Failed to load question image:', question.question_image);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    {question.question_type === 'MCQ' && (
                      <div className="space-y-2 mb-4">
                        <p className="font-medium text-sm">Options:</p>
                        {parseOptions(question.options).map(option => (
                          <div
                            key={option.id}
                            className={`p-2 rounded border text-sm ${
                              option.id === normalizedCorrectAnswer ? 'bg-green-50 border-green-200' :
                              option.id === userAnswer ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              <span className="font-medium">({option.id})</span>
                              <div className="flex-1">
                                <span>{option.text}</span>
                                {option.image && (
                                  <div className="mt-1">
                                    <img 
                                      src={option.image} 
                                      alt={`Option ${option.id}`}
                                      className="max-w-xs h-auto rounded border shadow-sm"
                                      onError={(e) => {
                                        console.error('Failed to load option image:', option.image);
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              {option.id === normalizedCorrectAnswer && (
                                <Badge variant="default" className="text-xs">Correct</Badge>
                              )}
                              {option.id === userAnswer && option.id !== normalizedCorrectAnswer && (
                                <Badge variant="destructive" className="text-xs">Your Answer</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Your Answer:</span> {userAnswer || 'Not answered'}</p>
                        <p><span className="font-medium">Correct Answer:</span> {normalizedCorrectAnswer}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Marks:</span> {question.marks}</p>
                        {question.question_type === 'MCQ' && (
                          <p><span className="font-medium">Negative Marks:</span> {question.negative_marks || 0}</p>
                        )}
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="font-medium text-sm text-blue-800 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-700">{question.explanation}</p>
                        {question.explanation_image && (
                          <div className="mt-2">
                            <img 
                              src={question.explanation_image} 
                              alt="Explanation diagram"
                              className="max-w-md h-auto rounded border shadow-sm"
                              onError={(e) => {
                                console.error('Failed to load explanation image:', question.explanation_image);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnswerReview;
