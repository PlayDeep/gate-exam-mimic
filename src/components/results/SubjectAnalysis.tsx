
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SubjectAnalysisProps {
  subjectWiseAnalysis: Record<string, any>;
}

const SubjectAnalysis = ({ subjectWiseAnalysis }: SubjectAnalysisProps) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Subject-wise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(subjectWiseAnalysis).map(([subject, data]: [string, any]) => (
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
  );
};

export default SubjectAnalysis;
