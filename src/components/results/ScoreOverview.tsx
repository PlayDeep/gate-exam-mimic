
import { Trophy, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

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
  questionTimeData?: Array<{ questionNumber: number; timeSpent: number }>;
}

const ScoreOverview = ({ 
  score, 
  maxScore, 
  percentage, 
  gradeInfo, 
  timeSpentFormatted, 
  totalTimeSpent,
  totalQuestions,
  answers,
  questionTimeData = []
}: ScoreOverviewProps) => {
  const answeredQuestions = Object.keys(answers).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  
  // Convert totalTimeSpent from minutes to seconds for calculations
  const totalTimeSpentInSeconds = totalTimeSpent * 60;
  
  // Calculate time metrics in seconds
  const avgTimePerQuestion = totalQuestions > 0 ? Math.round(totalTimeSpentInSeconds / totalQuestions) : 0;
  const timePerAnsweredQuestion = answeredQuestions > 0 ? Math.round(totalTimeSpentInSeconds / answeredQuestions) : 0;
  
  // Calculate time efficiency (3 hours = 10800 seconds)
  const totalAvailableTime = 180 * 60; // 3 hours in seconds
  const timeUtilization = totalTimeSpentInSeconds > 0 ? Math.round((totalTimeSpentInSeconds / totalAvailableTime) * 100) : 0;
  const timeRemainingSeconds = Math.max(0, totalAvailableTime - totalTimeSpentInSeconds);
  
  // Format time remaining
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };
  
  // Check if we have real time data
  const hasRealTimeData = questionTimeData && questionTimeData.length > 0 && questionTimeData.some(q => q.timeSpent > 0);
  
  console.log('ScoreOverview - Question time data:', questionTimeData);
  console.log('ScoreOverview - Has real time data:', hasRealTimeData);
  
  // Use real time data if available, otherwise generate fallback
  const chartData = hasRealTimeData
    ? questionTimeData.slice(0, 20).map(item => ({
        question: `Q${item.questionNumber}`,
        timeSpent: item.timeSpent
      }))
    : Array.from({ length: Math.min(totalQuestions, 20) }, (_, index) => ({
        question: `Q${index + 1}`,
        timeSpent: answers[index + 1] ? Math.floor(Math.random() * 150) + 30 : 0
      }));

  // Calculate time distribution from real data
  const answeredQuestionsWithTime = hasRealTimeData 
    ? questionTimeData.filter(q => answers[q.questionNumber] && q.timeSpent > 0)
    : [];
    
  const fastQuestions = answeredQuestionsWithTime.filter(q => q.timeSpent < 30).length;
  const mediumQuestions = answeredQuestionsWithTime.filter(q => q.timeSpent >= 30 && q.timeSpent <= 90).length;
  const slowQuestions = answeredQuestionsWithTime.filter(q => q.timeSpent > 90).length;

  // If no real time data, use fallback calculations
  const fallbackFast = hasRealTimeData ? fastQuestions : Math.floor(answeredQuestions * 0.3);
  const fallbackMedium = hasRealTimeData ? mediumQuestions : Math.floor(answeredQuestions * 0.5);
  const fallbackSlow = hasRealTimeData ? slowQuestions : Math.floor(answeredQuestions * 0.2);

  const chartConfig = {
    timeSpent: {
      label: "Time Spent",
      color: "hsl(217, 91%, 60%)",
    },
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Overall Performance Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Overall Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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

      {/* Time Analysis Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span>Time Analysis {hasRealTimeData ? '(Real Data)' : '(Simulated Data)'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Time Chart */}
            <div className="w-full">
              <h4 className="font-medium text-gray-800 mb-4">Time per Question (First 20 Questions)</h4>
              <div className="w-full h-64">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={chartData} 
                      margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                    >
                      <XAxis 
                        dataKey="question" 
                        tick={{ fontSize: 11 }}
                        angle={-45}
                        textAnchor="end"
                        height={50}
                        interval={0}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        width={40}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => [`${value}s`, "Time Spent"]}
                        labelFormatter={(label) => `Question ${label.replace('Q', '')}`}
                      />
                      <Bar 
                        dataKey="timeSpent" 
                        fill="var(--color-timeSpent)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Time Summary</h4>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-semibold">{timeSpentFormatted}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-semibold text-green-600">
                    {formatTimeRemaining(timeRemainingSeconds)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Utilization:</span>
                  <span className={`font-semibold ${timeUtilization > 90 ? 'text-red-500' : timeUtilization > 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {timeUtilization}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Question Analysis</h4>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Question:</span>
                  <span className="font-semibold">{Math.floor(avgTimePerQuestion / 60)}m {avgTimePerQuestion % 60}s</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg per Answered:</span>
                  <span className="font-semibold">{Math.floor(timePerAnsweredQuestion / 60)}m {timePerAnsweredQuestion % 60}s</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-semibold">{answeredQuestions}/{totalQuestions}</span>
                </div>
              </div>
            </div>
            
            {/* Time Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Time Distribution {hasRealTimeData ? '(Real Data)' : '(Estimated)'}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="font-semibold text-green-600 text-xl">{fallbackFast}</div>
                  <div className="text-sm text-gray-600">Quick (&lt;30s)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600 text-xl">{fallbackMedium}</div>
                  <div className="text-sm text-gray-600">Medium (30-90s)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600 text-xl">{fallbackSlow}</div>
                  <div className="text-sm text-gray-600">Slow (&gt;90s)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-500 text-xl">{unansweredQuestions}</div>
                  <div className="text-sm text-gray-600">Unanswered</div>
                </div>
              </div>
            </div>
            
            {/* Performance Tips */}
            {timeUtilization > 85 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Tip:</strong> You used {timeUtilization}% of available time. Consider time management strategies for better performance.
                </p>
              </div>
            )}
            
            {avgTimePerQuestion > 120 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Suggestion:</strong> Average {Math.floor(avgTimePerQuestion / 60)}m {avgTimePerQuestion % 60}s per question. Aim for 2-3 minutes per question for optimal time usage.
                </p>
              </div>
            )}

            {hasRealTimeData ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Note:</strong> Time analysis is based on actual time spent on each question, including revisits.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Time analysis is based on estimated data as real time tracking data was not available.
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
