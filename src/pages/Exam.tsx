
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calculator, 
  Flag, 
  CheckCircle, 
  Circle, 
  SkipForward,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { QuestionPanel } from "@/components/QuestionPanel";
import { mockQuestions } from "@/data/mockQuestions";

const Exam = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const questions = mockQuestions[subject as keyof typeof mockQuestions] || mockQuestions.CS;
  const totalQuestions = questions.length;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleMarkForReview = (questionId: number) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = () => {
    navigate('/results', { 
      state: { 
        answers, 
        questions, 
        timeSpent: (180 * 60) - timeLeft,
        subject
      } 
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const openCalculator = () => {
    window.open('https://www.tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html#nogo', '_blank');
  };

  const getQuestionStatus = (questionId: number) => {
    const isAnswered = answers[questionId];
    const isMarked = markedForReview.has(questionId);
    
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'not-answered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500';
      case 'marked': return 'bg-purple-500';
      case 'answered-marked': return 'bg-blue-500';
      default: return 'bg-red-500';
    }
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const notAnsweredCount = totalQuestions - answeredCount;

  const currentQuestionData = questions[currentQuestion - 1];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">GATE {subject} Mock Test</h1>
            <Badge variant="outline">Question {currentQuestion} of {totalQuestions}</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-mono text-lg text-red-600">{formatTime(timeLeft)}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={openCalculator}
            >
              <Calculator className="w-4 h-4 mr-1" />
              Calculator
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleSubmitExam}
            >
              Submit Test
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Card className="h-full">
              <CardContent className="p-6 h-full">
                {currentQuestionData && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-4">
                          <Badge variant={currentQuestionData.type === 'MCQ' ? 'default' : 'secondary'}>
                            {currentQuestionData.type}
                          </Badge>
                          <Badge variant="outline">
                            {currentQuestionData.marks} Mark{currentQuestionData.marks > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="outline">
                            {currentQuestionData.subject}
                          </Badge>
                        </div>
                        
                        <h2 className="text-lg font-semibold mb-4">
                          Question {currentQuestion}
                        </h2>
                        
                        <div className="prose prose-lg max-w-none mb-6">
                          <p>{currentQuestionData.question}</p>
                        </div>

                        {/* Options for MCQ */}
                        {currentQuestionData.type === 'MCQ' && (
                          <div className="space-y-3">
                            {currentQuestionData.options?.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleAnswerChange(currentQuestion, option.id)}
                              >
                                <input
                                  type="radio"
                                  name={`question-${currentQuestion}`}
                                  value={option.id}
                                  checked={answers[currentQuestion] === option.id}
                                  onChange={() => handleAnswerChange(currentQuestion, option.id)}
                                  className="w-4 h-4"
                                />
                                <label className="flex-1 cursor-pointer">
                                  <span className="font-medium mr-2">({option.id})</span>
                                  {option.text}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Input for NAT */}
                        {currentQuestionData.type === 'NAT' && (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                              Enter your numerical answer:
                            </label>
                            <input
                              type="number"
                              step="any"
                              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={answers[currentQuestion] || ''}
                              onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                              placeholder="Enter numerical value"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation Controls */}
          <div className="bg-white border-t p-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleMarkForReview(currentQuestion)}
                  className={markedForReview.has(currentQuestion) ? 'bg-purple-50' : ''}
                >
                  <Flag className="w-4 h-4 mr-1" />
                  {markedForReview.has(currentQuestion) ? 'Unmark' : 'Mark'} for Review
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setAnswers(prev => {
                      const newAnswers = { ...prev };
                      delete newAnswers[currentQuestion];
                      return newAnswers;
                    });
                  }}
                >
                  Clear Response
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={currentQuestion === 1}
                  onClick={() => setCurrentQuestion(prev => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  disabled={currentQuestion === totalQuestions}
                  onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Question Navigation */}
        <div className="w-80 bg-white border-l">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-4">Question Navigation</h3>
            
            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{answeredCount}/{totalQuestions}</span>
              </div>
              <Progress value={(answeredCount / totalQuestions) * 100} />
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Marked ({markedCount})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Both</span>
              </div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((questionNum) => {
                const status = getQuestionStatus(questionNum);
                const isCurrent = questionNum === currentQuestion;
                
                return (
                  <button
                    key={questionNum}
                    onClick={() => setCurrentQuestion(questionNum)}
                    className={`
                      w-10 h-10 rounded text-white text-sm font-medium
                      ${isCurrent ? 'ring-2 ring-gray-400' : ''}
                      ${getStatusColor(status)}
                      hover:opacity-80 transition-all
                    `}
                  >
                    {questionNum}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exam;
