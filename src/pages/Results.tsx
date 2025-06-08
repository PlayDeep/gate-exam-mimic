
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Download,
  Share2,
  RotateCcw,
  Eye
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showReviewMode, setShowReviewMode] = useState(false);
  
  const { answers, questions, timeSpent, subject, score: passedScore, percentage: passedPercentage } = location.state || {};

  if (!answers || !questions) {
    navigate('/');
    return null;
  }

  // Use passed score if available, otherwise calculate
  const usePassedScore = passedScore !== undefined && passedPercentage !== undefined;

  // Calculate results
  const calculateResults = () => {
    if (usePassedScore) {
      // Use the score calculated from the exam page
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unanswered = 0;
      const subjectWiseAnalysis: Record<string, any> = {};

      questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        // Normalize answers for comparison
        const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
        const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        // Initialize subject analysis
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            score: 0
          };
        }
        
        subjectWiseAnalysis[question.subject].total++;

        if (!userAnswer) {
          unanswered++;
          subjectWiseAnalysis[question.subject].unanswered++;
        } else if (isCorrect) {
          correctAnswers++;
          subjectWiseAnalysis[question.subject].correct++;
          subjectWiseAnalysis[question.subject].score += question.marks;
        } else {
          wrongAnswers++;
          subjectWiseAnalysis[question.subject].wrong++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (question.marks === 1 ? 1/3 : 2/3);
            subjectWiseAnalysis[question.subject].score -= negativeMarks;
          }
        }
      });

      return {
        score: passedScore,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions: questions.length,
        maxScore: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        subjectWiseAnalysis
      };
    } else {
      // Fallback calculation (original logic)
      let score = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unanswered = 0;
      const subjectWiseAnalysis: Record<string, any> = {};

      questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        // Normalize answers for comparison
        const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
        const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        // Initialize subject analysis
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            score: 0
          };
        }
        
        subjectWiseAnalysis[question.subject].total++;

        if (!userAnswer) {
          unanswered++;
          subjectWiseAnalysis[question.subject].unanswered++;
        } else if (isCorrect) {
          correctAnswers++;
          score += question.marks;
          subjectWiseAnalysis[question.subject].correct++;
          subjectWiseAnalysis[question.subject].score += question.marks;
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (question.marks === 1 ? 1/3 : 2/3);
            score -= negativeMarks;
            subjectWiseAnalysis[question.subject].score -= negativeMarks;
          }
          subjectWiseAnalysis[question.subject].wrong++;
        }
      });

      return {
        score: Math.round(score * 100) / 100,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions: questions.length,
        maxScore: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        subjectWiseAnalysis
      };
    }
  };

  const results = calculateResults();
  const percentage = usePassedScore ? passedPercentage : Math.round((results.score / results.maxScore) * 100);
  
  const getGrade = (percentage: number) => {
    if (percentage >= 85) return { grade: 'A+', color: 'text-green-600', description: 'Excellent' };
    if (percentage >= 75) return { grade: 'A', color: 'text-green-500', description: 'Very Good' };
    if (percentage >= 65) return { grade: 'B+', color: 'text-blue-500', description: 'Good' };
    if (percentage >= 55) return { grade: 'B', color: 'text-blue-400', description: 'Above Average' };
    if (percentage >= 45) return { grade: 'C', color: 'text-yellow-500', description: 'Average' };
    return { grade: 'F', color: 'text-red-500', description: 'Below Average' };
  };

  const gradeInfo = getGrade(percentage);
  const timeSpentFormatted = `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;

  const handleDownloadReport = () => {
    const reportData = {
      subject,
      score: results.score,
      maxScore: results.maxScore,
      percentage,
      grade: gradeInfo.grade,
      correctAnswers: results.correctAnswers,
      wrongAnswers: results.wrongAnswers,
      unanswered: results.unanswered,
      timeSpent: timeSpentFormatted,
      date: new Date().toLocaleDateString(),
      subjectWiseAnalysis: results.subjectWiseAnalysis
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GATE_${subject}_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your test report has been downloaded successfully.",
    });
  };

  const handleShareResults = async () => {
    const shareText = `🎓 GATE ${subject} Mock Test Results\n\n📊 Score: ${results.score}/${results.maxScore} (${percentage}%)\n🏆 Grade: ${gradeInfo.grade}\n✅ Correct: ${results.correctAnswers}\n❌ Wrong: ${results.wrongAnswers}\n⏱️ Time: ${timeSpentFormatted}\n\nTake your GATE preparation to the next level!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GATE Test Results',
          text: shareText,
        });
        toast({
          title: "Results Shared",
          description: "Your test results have been shared successfully.",
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Results Copied",
          description: "Your test results have been copied to clipboard.",
        });
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Results Copied",
        description: "Your test results have been copied to clipboard.",
      });
    }
  };

  const handleReviewAnswers = () => {
    setShowReviewMode(!showReviewMode);
  };

  // Helper function to parse options for display
  const parseOptionsForDisplay = (options: any): Array<{id: string, text: string}> => {
    if (!options) return [];
    
    // If it's already an array of objects with id and text
    if (Array.isArray(options) && options.length > 0 && typeof options[0] === 'object' && 'id' in options[0]) {
      return options as Array<{id: string, text: string}>;
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
      return Object.entries(options).map(([key, value]) => ({
        id: key,
        text: String(value)
      }));
    }
    
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
                <p className="text-sm text-gray-500">GATE {subject} Mock Test</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/')}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Take Another Test
              </Button>
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" onClick={handleShareResults}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <span>Overall Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {results.score}/{results.maxScore}
                  </div>
                  <div className="text-lg text-gray-600">Total Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${gradeInfo.color}`}>
                    {percentage}%
                  </div>
                  <div className="text-lg text-gray-600">Percentage</div>
                </div>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${gradeInfo.color}`}>
                    {gradeInfo.grade}
                  </div>
                  <div className="text-lg text-gray-600">{gradeInfo.description}</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Progress</span>
                  <span>{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-blue-500" />
                <span>Time Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Spent:</span>
                  <span className="font-semibold">{timeSpentFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-semibold">
                    {Math.floor((180 * 60 - timeSpent) / 60)}m {(180 * 60 - timeSpent) % 60}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Question:</span>
                  <span className="font-semibold">
                    {Math.round(timeSpent / results.totalQuestions)}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
              <div className="text-gray-600">Correct</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-red-600">{results.wrongAnswers}</div>
              <div className="text-gray-600">Incorrect</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-yellow-600">{results.unanswered}</div>
              <div className="text-gray-600">Unanswered</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((results.correctAnswers / results.totalQuestions) * 100)}%
              </div>
              <div className="text-gray-600">Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.subjectWiseAnalysis).map(([subject, data]: [string, any]) => (
                <div key={subject} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">{subject}</h4>
                    <Badge variant="outline">
                      {data.correct}/{data.total} correct
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{data.correct}</div>
                      <div className="text-xs text-gray-500">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{data.wrong}</div>
                      <div className="text-xs text-gray-500">Wrong</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{data.unanswered}</div>
                      <div className="text-xs text-gray-500">Unanswered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(data.score * 100) / 100}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(data.correct / data.total) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Answers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Answer Review</span>
              <Button
                variant={showReviewMode ? "default" : "outline"}
                onClick={handleReviewAnswers}
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
                  
                  // Normalize answers for comparison
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

        {/* Action Buttons */}
        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate('/')} className="mr-4">
            Take Another Test
          </Button>
          <Button variant="outline" size="lg" onClick={handleReviewAnswers}>
            {showReviewMode ? 'Exit Review Mode' : 'Review Answers'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
