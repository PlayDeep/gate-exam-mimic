
import { CheckCircle, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface QuestionAnalysisProps {
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalQuestions: number;
}

const QuestionAnalysis = ({ correctAnswers, wrongAnswers, unanswered, totalQuestions }: QuestionAnalysisProps) => {
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
          <div className="text-gray-600">Correct</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
          <div className="text-gray-600">Incorrect</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-yellow-600">{unanswered}</div>
          <div className="text-gray-600">Unanswered</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
          <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
          <div className="text-gray-600">Accuracy</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionAnalysis;
