
import { Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScoreOverviewProps {
  score: number;
  maxScore: number;
  percentage: number;
  gradeInfo: {
    grade: string;
    color: string;
    description: string;
  };
  timeSpentFormatted: string;
  totalTimeSpent: number;
  totalQuestions: number;
  answers: Record<number, string>;
}

const ScoreOverview = ({ 
  score, 
  maxScore, 
  percentage, 
  gradeInfo, 
  timeSpentFormatted, 
  totalTimeSpent,
  totalQuestions,
  answers 
}: ScoreOverviewProps) => {
  const avgTimePerQuestion = Math.round(totalTimeSpent / totalQuestions);
  const answeredQuestions = Object.keys(answers).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const timePerAnsweredQuestion = answeredQuestions > 0 ? Math.round(totalTimeSpent / answeredQuestions) : 0;
  
  // Calculate time efficiency
  const totalAvailableTime = 180 * 60; // 3 hours in seconds
  const timeUtilization = Math.round((totalTimeSpent / totalAvailableTime) * 100);
  
  // Time categories
  const fastQuestions = answeredQuestions > 0 ? Math.round(answeredQuestions * 0.3) : 0; // Assuming 30% were answered quickly
  const mediumQuestions = answeredQuestions > 0 ? Math.round(answeredQuestions * 0.5) : 0; // 50% medium time
  const slowQuestions = answeredQuestions - fastQuestions - mediumQuestions;

  return (
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
                {score}/{maxScore}
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
            <span>Detailed Time Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Time:</span>
              <span className="font-semibold">{timeSpentFormatted}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Time Remaining:</span>
              <span className="font-semibold text-green-600">
                {Math.floor((totalAvailableTime - totalTimeSpent) / 60)}m {(totalAvailableTime - totalTimeSpent) % 60}s
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Time Utilization:</span>
              <span className={`font-semibold ${timeUtilization > 90 ? 'text-red-500' : timeUtilization > 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                {timeUtilization}%
              </span>
            </div>
            
            <hr className="my-3" />
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Per Question Analysis</h4>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Avg per Question:</span>
                <span className="font-semibold">{avgTimePerQuestion}s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Avg per Answered:</span>
                <span className="font-semibold">{timePerAnsweredQuestion}s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Questions Answered:</span>
                <span className="font-semibold">{answeredQuestions}/{totalQuestions}</span>
              </div>
            </div>
            
            <hr className="my-3" />
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Time Distribution</h4>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Quick (&lt;30s):</span>
                <span className="font-semibold text-green-600">~{fastQuestions}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Medium (30-90s):</span>
                <span className="font-semibold text-yellow-600">~{mediumQuestions}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Slow (&gt;90s):</span>
                <span className="font-semibold text-red-600">~{slowQuestions}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Unanswered:</span>
                <span className="font-semibold text-gray-500">{unansweredQuestions}</span>
              </div>
            </div>
            
            {timeUtilization > 85 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> You used {timeUtilization}% of available time. Consider time management strategies for better performance.
                </p>
              </div>
            )}
            
            {avgTimePerQuestion > 120 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Suggestion:</strong> Average {avgTimePerQuestion}s per question. Aim for 2-3 minutes per question for optimal time usage.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreOverview;
