
import { Badge } from '@/components/ui/badge';

interface QuestionStatsProps {
  questionsCount: number;
}

const QuestionStats = ({ questionsCount }: QuestionStatsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Question Manager</h2>
        <p className="text-gray-600">Add and manage test questions</p>
      </div>
      <Badge variant="outline" className="text-sm">
        Total Questions: {questionsCount}
      </Badge>
    </div>
  );
};

export default QuestionStats;
