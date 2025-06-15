
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Award, Clock } from "lucide-react";
import { TestSession } from "@/services/testService";

interface TestSummaryCardsProps {
  tests: TestSession[];
}

const TestSummaryCards = ({ tests }: TestSummaryCardsProps) => {
  const averageScore = tests.length > 0 ? Math.round(tests.reduce((sum, test) => sum + (test.percentage || 0), 0) / tests.length) : 0;
  const totalTests = tests.length;
  const bestScore = tests.length > 0 ? Math.max(...tests.map(test => test.percentage || 0)) : 0;
  
  // Calculate average time taken
  const completedTests = tests.filter(test => test.time_taken);
  const averageTime = completedTests.length > 0 
    ? Math.round(completedTests.reduce((sum, test) => sum + (test.time_taken || 0), 0) / completedTests.length)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTests}</div>
          <p className="text-xs text-muted-foreground">
            Completed mock tests
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore}%</div>
          <p className="text-xs text-muted-foreground">
            Overall performance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Score</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(bestScore)}%</div>
          <p className="text-xs text-muted-foreground">
            Highest achievement
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageTime}m</div>
          <p className="text-xs text-muted-foreground">
            Time per test
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestSummaryCards;
