
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Calendar, Clock, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TestSession } from "@/services/testService";

interface TestHistoryTableProps {
  tests: TestSession[];
  onViewDetails: (testId: string) => void;
  onDeleteTest: (testId: string) => void;
}

const TestHistoryTable = ({ tests, onViewDetails, onDeleteTest }: TestHistoryTableProps) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test History</CardTitle>
        <CardDescription>
          Complete history of your GATE mock tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't taken any mock tests yet.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/')}>
                Take Your First Test
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Questions Answered</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{test.subject}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(test.start_time).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getScoreColor(test.percentage || 0)} text-white`}>
                      {Math.round(test.percentage || 0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {test.answered_questions || 0}/{test.total_questions}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{test.time_taken ? formatDuration(test.time_taken) : 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={test.status === 'completed' ? 'border-green-500 text-green-700' : ''}>
                      {test.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(test.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteTest(test.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TestHistoryTable;
