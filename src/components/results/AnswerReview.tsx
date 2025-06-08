
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface AnswerReviewProps {
  questions: any[];
  answers: Record<number, string>;
}

const AnswerReview = ({ questions, answers }: AnswerReviewProps) => {
  const [showReviewMode, setShowReviewMode] = useState(false);

  const parseOptionsForDisplay = (options: any): Array<{id: string, text: string}> => {
    if (!options) return [];
    
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]) {
      return options as Array<{id: string, text: string}>;
    }
    
    if (Array.isArray(options)) {
      return options.map((option, index) => ({
        id: String.fromCharCode(65 + index),
        text: String(option)
      }));
    }
    
    if (typeof options === 'object') {
      return Object.entries(options).map(([key, value]) => ({
        id: key,
        text: String(value)
      }));
    }
    
    return [];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Answer Review</span>
          <Button
            variant={showReviewMode ? "default" : "outline"}
            onClick={() => setShowReviewMode(!showReviewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {showReviewMode ? 'Exit Review Mode' : 'Review Answers'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      {showReviewMode && (
        <CardContent>
          <div className="space-y-4">
            {questions.map((question: any, index: number) => {
              const questionNum = index + 1;
              const userAnswer = answers[questionNum];
              
              const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
              const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
              const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
              const isAnswered = !!userAnswer;
              
              return (
                <div key={questionNum} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : isAnswered ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Q{questionNum}</Badge>
                        <Badge variant={question.question_type === 'MCQ' ? 'default' : 'secondary'}>
                          {question.question_type}
                        </Badge>
                        <Badge variant="outline">{question.marks} marks</Badge>
                        <Badge variant="outline">{question.subject}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{question.question_text}</p>
                      
                      {question.options && question.question_type === 'MCQ' && (
                        <div className="mt-3 space-y-2">
                          {parseOptionsForDisplay(question.options).map((option: any, optIndex: number) => (
                            <div 
                              key={optIndex} 
                              className={`p-2 rounded text-sm ${
                                option.id === normalizedCorrectAnswer 
                                  ? 'bg-green-100 border border-green-300' 
                                  : option.id === userAnswer && option.id !== normalizedCorrectAnswer
                                  ? 'bg-red-100 border border-red-300'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <span className="font-medium mr-2">({option.id})</span>
                              {option.text}
                              {option.id === normalizedCorrectAnswer && (
                                <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                              )}
                              {option.id === userAnswer && option.id !== normalizedCorrectAnswer && (
                                <span className="ml-2 text-red-600 font-medium">✗ Your Answer</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="font-medium text-blue-800 mb-1">Explanation:</div>
                          <div className="text-sm text-blue-700">{question.explanation}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isAnswered ? (
                        isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-500" />
                        )
                      ) : (
                        <AlertCircle className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Your Answer: </span>
                      <span className={isAnswered ? (isCorrect ? 'text-green-600' : 'text-red-600') : 'text-yellow-600'}>
                        {userAnswer || 'Not Answered'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Correct Answer: </span>
                      <span className="text-green-600">{normalizedCorrectAnswer}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Score: </span>
                      <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {isAnswered ? (
                          isCorrect ? `+${question.marks}` : (
                            question.question_type === 'MCQ' ? 
                              `-(${question.negative_marks || (question.marks === 1 ? '0.33' : '0.67')})` : 
                              '0'
                          )
                        ) : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AnswerReview;
