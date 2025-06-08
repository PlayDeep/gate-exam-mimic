
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
}

const ScoreOverview = ({ score, maxScore, percentage, gradeInfo, timeSpentFormatted }: ScoreOverviewProps) => {
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
                {Math.floor((180 * 60 - parseInt(timeSpentFormatted.split('m')[0]) * 60) / 60)}m {(180 * 60 - parseInt(timeSpentFormatted.split('m')[0]) * 60) % 60}s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg per Question:</span>
              <span className="font-semibold">
                {Math.round((parseInt(timeSpentFormatted.split('m')[0]) * 60) / 65)}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreOverview;
