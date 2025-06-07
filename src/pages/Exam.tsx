
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Calculator, 
  Flag, 
  Eye,
  EyeOff
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getRandomQuestionsForTest, Question } from "@/services/questionService";
import { createTestSession, updateTestSession, saveUserAnswer } from "@/services/testService";
import { useAuth } from "@/contexts/AuthContext";

const Exam = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours in seconds
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const totalQuestions = questions.length > 0 ? Math.min(questions.length, 65) : 0;

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to take the test.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, loading, navigate, toast]);

  // Load questions and create test session
  useEffect(() => {
    const initializeTest = async () => {
      if (!subject || !user) return;
      
      try {
        setIsLoading(true);
        
        // Get random questions for this subject
        const fetchedQuestions = await getRandomQuestionsForTest(subject.toUpperCase(), 65);
        
        if (fetchedQuestions.length === 0) {
          toast({
            title: "No Questions Available",
            description: "No questions found for this subject. Please contact administrator.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setQuestions(fetchedQuestions);
        
        // Create test session
        const newSessionId = await createTestSession(subject.toUpperCase(), fetchedQuestions.length);
        setSessionId(newSessionId);
        
      } catch (error) {
        console.error('Error initializing test:', error);
        toast({
          title: "Error",
          description: "Failed to load test questions. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTest();
  }, [subject, user, navigate, toast]);

  // Timer effect
  useEffect(() => {
    if (isLoading) return;
    
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
  }, [isLoading]);

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

  const handleAnswerChange = async (questionId: number, answer: string) => {
    console.log('Answer changed for question:', questionId, 'Answer:', answer);
    console.log('Current question data:', questions[questionId - 1]);
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Save answer to database
    if (sessionId && questions[questionId - 1]) {
      const question = questions[questionId - 1];
      console.log('Question correct answer:', question.correct_answer);
      console.log('User answer:', answer);
      const isCorrect = answer === question.correct_answer;
      console.log('Is correct:', isCorrect);
      const marksAwarded = isCorrect ? question.marks : -(question.negative_marks || 0);
      console.log('Marks awarded:', marksAwarded);
      
      try {
        await saveUserAnswer(
          sessionId,
          question.id,
          answer,
          isCorrect,
          marksAwarded,
          30 // Default time spent, you can track this more accurately
        );
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
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

  const handleSubmitExam = async () => {
    if (!sessionId) return;
    
    try {
      const timeSpentMinutes = Math.floor((180 * 60 - timeLeft) / 60);
      const answeredCount = Object.keys(answers).length;
      
      // Calculate score with detailed logging
      let totalScore = 0;
      let correctAnswers = 0;
      
      console.log('Starting score calculation...');
      console.log('Total answers:', answers);
      console.log('Total questions:', questions.length);
      
      Object.entries(answers).forEach(([questionIndex, answer]) => {
        const question = questions[parseInt(questionIndex) - 1];
        console.log(`Question ${questionIndex}:`, {
          question: question?.question_text?.substring(0, 50) + '...',
          userAnswer: answer,
          correctAnswer: question?.correct_answer,
          marks: question?.marks,
          negativeMarks: question?.negative_marks
        });
        
        if (question && answer === question.correct_answer) {
          totalScore += question.marks;
          correctAnswers++;
          console.log(`✅ Correct! Added ${question.marks} marks. Total: ${totalScore}`);
        } else if (question && answer && answer !== question.correct_answer) {
          const penalty = question.negative_marks || 0;
          totalScore -= penalty;
          console.log(`❌ Wrong! Deducted ${penalty} marks. Total: ${totalScore}`);
        } else {
          console.log(`⏭️ Not answered`);
        }
      });
      
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      console.log('Final calculation:', {
        totalScore,
        correctAnswers,
        totalQuestions,
        percentage,
        answeredCount
      });
      
      // Update test session
      await updateTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredCount,
        score: totalScore,
        percentage: percentage,
        status: 'completed',
        time_taken: timeSpentMinutes
      });
      
      navigate('/results', { 
        state: { 
          sessionId,
          answers, 
          questions, 
          timeSpent: timeSpentMinutes,
          subject,
          score: totalScore,
          percentage: percentage
        } 
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleNext = () => {
    console.log('Next clicked. Current question:', currentQuestion, 'Total questions:', totalQuestions);
    if (!isLoading && totalQuestions > 0 && currentQuestion < totalQuestions) {
      const nextQuestion = currentQuestion + 1;
      console.log('Moving to question:', nextQuestion);
      setCurrentQuestion(nextQuestion);
    } else {
      console.log('Cannot move to next question. Loading:', isLoading, 'Total:', totalQuestions, 'Current:', currentQuestion);
    }
  };

  const handlePrevious = () => {
    console.log('Previous clicked. Current question:', currentQuestion);
    if (!isLoading && currentQuestion > 1) {
      const prevQuestion = currentQuestion - 1;
      console.log('Moving to question:', prevQuestion);
      setCurrentQuestion(prevQuestion);
    } else {
      console.log('Cannot move to previous question. Loading:', isLoading, 'Current:', currentQuestion);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-4">No questions found for this subject.</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const notAnsweredCount = totalQuestions - answeredCount;
  const currentQuestionData = questions[currentQuestion - 1];

  console.log('Render - Current question:', currentQuestion, 'Total questions:', totalQuestions, 'Questions length:', questions.length);

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
                          <Badge variant={currentQuestionData.question_type === 'MCQ' ? 'default' : 'secondary'}>
                            {currentQuestionData.question_type}
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
                          <p>{currentQuestionData.question_text}</p>
                        </div>

                        {/* Options for MCQ */}
                        {currentQuestionData.question_type === 'MCQ' && currentQuestionData.options && (
                          <div className="space-y-3">
                            {(() => {
                              // Handle different option formats
                              let optionsToRender: Array<{id: string, text: string}> = [];
                              
                              if (Array.isArray(currentQuestionData.options)) {
                                // If it's already an array of objects with id and text
                                if (currentQuestionData.options.length > 0 && typeof currentQuestionData.options[0] === 'object' && 'id' in currentQuestionData.options[0]) {
                                  optionsToRender = currentQuestionData.options as Array<{id: string, text: string}>;
                                } else {
                                  // If it's an array of strings, convert to objects
                                  optionsToRender = (currentQuestionData.options as string[]).map((option, index) => ({
                                    id: String.fromCharCode(65 + index), // A, B, C, D
                                    text: option
                                  }));
                                }
                              } else if (typeof currentQuestionData.options === 'object') {
                                // If it's an object, convert to array
                                optionsToRender = Object.entries(currentQuestionData.options).map(([key, value]) => ({
                                  id: key,
                                  text: String(value)
                                }));
                              }

                              return optionsToRender.map(option => (
                                <div
                                  key={option.id}
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
                              ));
                            })()}
                          </div>
                        )}

                        {/* Input for NAT */}
                        {currentQuestionData.question_type === 'NAT' && (
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
                  disabled={currentQuestion === 1 || isLoading}
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
                
                <Button
                  variant="outline"
                  disabled={currentQuestion >= totalQuestions || totalQuestions === 0 || isLoading}
                  onClick={handleNext}
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
              <Progress value={totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0} />
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
                    onClick={() => {
                      console.log('Question grid clicked:', questionNum);
                      setCurrentQuestion(questionNum);
                    }}
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
