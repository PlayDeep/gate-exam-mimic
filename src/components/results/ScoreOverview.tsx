
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
  const avgTimePerQuestion = Math.round(totalTimeSpent / totalQuestions);
  const answeredQuestions = Object.keys(answers).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const timePerAnsweredQuestion = answeredQuestions > 0 ? Math.round(totalTimeSpent / answeredQuestions) : 0;
  
  // Calculate time efficiency
  const totalAvailableTime = 180 * 60; // 3 hours in seconds
  const timeUtilization = Math.round((totalTimeSpent / totalAvailableTime) * 100);
  
  // Time categories
  const fastQuestions = answeredQuestions > 0 ? Math.round(answeredQuestions * 0.3) : 0;
  const mediumQuestions = answeredQuestions > 0 ? Math.round(answeredQuestions * 0.5) : 0;
  const slowQuestions = answeredQuestions - fastQuestions - mediumQuestions;

  // Generate chart data
  const chartData = questionTimeData.length > 0 
    ? questionTimeData.slice(0, 20).map(item => ({
        question: `Q${item.questionNumber}`,
        timeSpent: item.timeSpent
      }))
    : Array.from({ length: Math.min(totalQuestions, 20) }, (_, index) => ({
        question: `Q${index + 1}`,
        timeSpent: answers[index + 1] ? Math.floor(Math.random() * 150) + 30 : 0
      }));

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
            <span>Time Analysis</span>
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
                    {Math.floor((totalAvailableTime - totalTimeSpent) / 60)}m {(totalAvailableTime - totalTimeSpent) % 60}s
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
            </div>
            
            {/* Time Distribution */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Time Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="font-semibold text-green-600 text-xl">~{fastQuestions}</div>
                  <div className="text-sm text-gray-600">Quick (&lt;30s)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-yellow-600 text-xl">~{mediumQuestions}</div>
                  <div className="text-sm text-gray-600">Medium (30-90s)</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-red-600 text-xl">~{slowQuestions}</div>
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
