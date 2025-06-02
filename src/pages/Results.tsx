
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
  RotateCcw
} from "lucide-react";
import { useState } from "react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  
  const { answers, questions, timeSpent, subject } = location.state || {};

  if (!answers || !questions) {
    navigate('/');
    return null;
  }

  // Calculate results
  const calculateResults = () => {
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unanswered = 0;
    const subjectWiseAnalysis: Record<string, any> = {};

    questions.forEach((question: any, index: number) => {
      const questionNum = index + 1;
      const userAnswer = answers[questionNum];
      const isCorrect = userAnswer === question.correctAnswer;
      
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
        if (question.type === 'MCQ') {
          const negativeMarks = question.marks === 1 ? -1/3 : -2/3;
          score += negativeMarks;
          subjectWiseAnalysis[question.subject].score += negativeMarks;
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
  };

  const results = calculateResults();
  const percentage = Math.round((results.score / results.maxScore) * 100);
  
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
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
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

        {/* Detailed Analysis Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Question-by-Question Analysis</span>
              <Button
                variant="outline"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
              >
                {showDetailedAnalysis ? 'Hide Details' : 'Show Details'}
              </Button>
            </CardTitle>
          </CardHeader>
          
          {showDetailedAnalysis && (
            <CardContent>
              <div className="space-y-4">
                {questions.map((question: any, index: number) => {
                  const questionNum = index + 1;
                  const userAnswer = answers[questionNum];
                  const isCorrect = userAnswer === question.correctAnswer;
                  const isAnswered = !!userAnswer;
                  
                  return (
                    <div key={questionNum} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">Q{questionNum}</Badge>
                            <Badge variant={question.type === 'MCQ' ? 'default' : 'secondary'}>
                              {question.type}
                            </Badge>
                            <Badge variant="outline">{question.marks} marks</Badge>
                            <Badge variant="outline">{question.subject}</Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{question.question}</p>
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
                          <span className="text-green-600">{question.correctAnswer}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Score: </span>
                          <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {isAnswered ? (isCorrect ? `+${question.marks}` : (question.type === 'MCQ' ? (question.marks === 1 ? '-0.33' : '-0.67') : '0')) : '0'}
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
          <Button variant="outline" size="lg">
            Review Answers
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
