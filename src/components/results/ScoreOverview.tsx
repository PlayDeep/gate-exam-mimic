
import { Trophy, Clock, TrendingUp, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";

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
  
  // Enhanced time analytics
  const hasRealTimeData = questionTimeData && questionTimeData.length > 0 && questionTimeData.some(q => q.timeSpent > 0);
  const questionsWithTimeData = questionTimeData.filter(q => q.timeSpent > 0);
  const totalTimeFromQuestions = questionsWithTimeData.reduce((sum, q) => sum + q.timeSpent, 0);
  
  console.log('ScoreOverview - Enhanced analytics:', {
    hasRealTimeData,
    questionsWithTimeData: questionsWithTimeData.length,
    totalTimeFromQuestions,
    questionTimeData: questionTimeData.length
  });
  
  // Time calculations
  const avgTimePerQuestion = questionsWithTimeData.length > 0 
    ? Math.round(totalTimeFromQuestions / questionsWithTimeData.length) 
    : 0;
    
  const answeredQuestionsWithTime = questionsWithTimeData.filter(q => answers[q.questionNumber]);
  const avgTimePerAnswered = answeredQuestionsWithTime.length > 0
    ? Math.round(answeredQuestionsWithTime.reduce((sum, q) => sum + q.timeSpent, 0) / answeredQuestionsWithTime.length)
    : 0;
  
  // Time efficiency metrics
  const totalAvailableTime = 180 * 60; // 3 hours in seconds
  const actualTimeUsed = totalTimeFromQuestions || (totalTimeSpent * 60);
  const timeUtilization = actualTimeUsed > 0 ? Math.round((actualTimeUsed / totalAvailableTime) * 100) : 0;
  const timeRemainingSeconds = Math.max(0, totalAvailableTime - actualTimeUsed);
  
  // Performance per minute
  const performanceRate = actualTimeUsed > 0 ? (score / (actualTimeUsed / 60)).toFixed(2) : '0';
  
  // Time distribution analysis
  const timeCategories = {
    fast: questionsWithTimeData.filter(q => q.timeSpent < 60).length,
    normal: questionsWithTimeData.filter(q => q.timeSpent >= 60 && q.timeSpent <= 180).length,
    slow: questionsWithTimeData.filter(q => q.timeSpent > 180).length
  };
  
  // Chart data for time per question
  const chartData = hasRealTimeData
    ? questionTimeData.slice(0, 20).map(item => ({
        question: `Q${item.questionNumber}`,
        timeSpent: item.timeSpent,
        answered: answers[item.questionNumber] ? 1 : 0
      }))
    : Array.from({ length: Math.min(totalQuestions, 20) }, (_, index) => ({
        question: `Q${index + 1}`,
        timeSpent: answers[index + 1] ? Math.floor(Math.random() * 150) + 30 : 0,
        answered: answers[index + 1] ? 1 : 0
      }));

  // Time progression chart data
  const progressionData = hasRealTimeData
    ? questionTimeData.slice(0, 10).map((item, index) => ({
        order: index + 1,
        time: item.timeSpent,
        cumulative: questionTimeData.slice(0, index + 1).reduce((sum, q) => sum + q.timeSpent, 0)
      }))
    : [];

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const chartConfig = {
    timeSpent: {
      label: "Time Spent",
      color: "hsl(217, 91%, 60%)",
    },
    cumulative: {
      label: "Cumulative Time",
      color: "hsl(142, 76%, 36%)",
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
            <div className="text-center">
              <div className="text-4xl font-bold mb-2 text-blue-600">
                {performanceRate}
              </div>
              <div className="text-lg text-gray-600">Points/Min</div>
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

      {/* Enhanced Time Analysis Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span>Enhanced Time Analytics {hasRealTimeData ? '(Real Data)' : '(Simulated)'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Time Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(actualTimeUsed)}
                </div>
                <div className="text-sm text-gray-600">Total Time Used</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatTime(avgTimePerQuestion)}
                </div>
                <div className="text-sm text-gray-600">Avg per Question</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatTime(avgTimePerAnswered)}
                </div>
                <div className="text-sm text-gray-600">Avg per Answered</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {timeUtilization}%
                </div>
                <div className="text-sm text-gray-600">Time Efficiency</div>
              </div>
            </div>

            {/* Time Distribution Chart */}
            <div className="w-full">
              <h4 className="font-medium text-gray-800 mb-4">Time per Question Analysis</h4>
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
                        formatter={(value: number, name: string) => {
                          if (name === 'timeSpent') return [`${value}s`, "Time Spent"];
                          return [`${value ? 'Answered' : 'Not Answered'}`, "Status"];
                        }}
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

            {/* Time Progression Analysis */}
            {hasRealTimeData && progressionData.length > 0 && (
              <div className="w-full">
                <h4 className="font-medium text-gray-800 mb-4">Time Progression (First 10 Questions)</h4>
                <div className="w-full h-64">
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressionData}>
                        <XAxis dataKey="order" />
                        <YAxis />
                        <ChartTooltip 
                          content={<ChartTooltipContent />}
                          formatter={(value: number, name: string) => [
                            `${Math.round(value / 60)}m ${value % 60}s`, 
                            name === 'time' ? 'Question Time' : 'Cumulative Time'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="time" 
                          stroke="var(--color-timeSpent)" 
                          strokeWidth={2}
                          name="time"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="cumulative" 
                          stroke="var(--color-cumulative)" 
                          strokeWidth={2}
                          name="cumulative"
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            )}

            {/* Enhanced Time Distribution and Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Time Distribution Pattern</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="font-semibold text-green-600 text-xl">{timeCategories.fast}</div>
                    <div className="text-xs text-gray-600">Quick (&lt;1m)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600 text-xl">{timeCategories.normal}</div>
                    <div className="text-xs text-gray-600">Normal (1-3m)</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-red-600 text-xl">{timeCategories.slow}</div>
                    <div className="text-xs text-gray-600">Slow (&gt;3m)</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions Attempted:</span>
                    <span className="font-semibold">{answeredQuestions}/{totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Remaining:</span>
                    <span className={`font-semibold ${timeRemainingSeconds > 3600 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {formatTimeRemaining(timeRemainingSeconds)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Coverage:</span>
                    <span className="font-semibold">
                      {Math.round((questionsWithTimeData.length / totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Performance Insights */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Performance Insights</h4>
              
              {/* Efficiency insights */}
              {parseFloat(performanceRate) > 0.5 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <TrendingUp className="inline w-4 h-4 mr-1" />
                    <strong>Excellent pace:</strong> {performanceRate} points per minute shows efficient problem-solving.
                  </p>
                </div>
              )}
              
              {timeCategories.slow > timeCategories.fast && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Target className="inline w-4 h-4 mr-1" />
                    <strong>Time management tip:</strong> Consider spending less time on difficult questions initially.
                  </p>
                </div>
              )}
              
              {timeUtilization < 50 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <Clock className="inline w-4 h-4 mr-1" />
                    <strong>Time opportunity:</strong> You have {formatTimeRemaining(timeRemainingSeconds)} remaining for review.
                  </p>
                </div>
              )}

              {hasRealTimeData ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Real-time tracking:</strong> Analysis based on actual time spent on {questionsWithTimeData.length} questions.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Estimated data:</strong> Time analysis is simulated. Enable detailed tracking for better insights.
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreOverview;
