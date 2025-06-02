
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Calendar, Clock, Award, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for previous tests
const mockPreviousTests = [
  {
    id: 1,
    subject: "CS",
    subjectName: "Computer Science & IT",
    date: "2024-05-28",
    score: 85,
    totalQuestions: 65,
    correctAnswers: 55,
    timeSpent: "2h 45m",
    status: "Completed"
  },
  {
    id: 2,
    subject: "ME",
    subjectName: "Mechanical Engineering",
    date: "2024-05-25",
    score: 78,
    totalQuestions: 65,
    correctAnswers: 51,
    timeSpent: "2h 58m",
    status: "Completed"
  },
  {
    id: 3,
    subject: "EE",
    subjectName: "Electrical Engineering",
    date: "2024-05-22",
    score: 92,
    totalQuestions: 65,
    correctAnswers: 60,
    timeSpent: "2h 35m",
    status: "Completed"
  },
  {
    id: 4,
    subject: "CS",
    subjectName: "Computer Science & IT",
    date: "2024-05-20",
    score: 67,
    totalQuestions: 65,
    correctAnswers: 44,
    timeSpent: "3h 0m",
    status: "Completed"
  }
];

const PreviousTests = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState(mockPreviousTests);

  const handleViewDetails = (testId: number) => {
    navigate(`/test-details/${testId}`);
  };

  const handleDeleteTest = (testId: number) => {
    setTests(prev => prev.filter(test => test.id !== testId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const averageScore = tests.length > 0 ? Math.round(tests.reduce((sum, test) => sum + test.score, 0) / tests.length) : 0;
  const totalTests = tests.length;
  const bestScore = tests.length > 0 ? Math.max(...tests.map(test => test.score)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Previous Tests</h1>
                <p className="text-sm text-gray-500">Review your test history and performance</p>
              </div>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="text-2xl font-bold">{bestScore}%</div>
              <p className="text-xs text-muted-foreground">
                Highest achievement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tests Table */}
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
                    <TableHead>Correct Answers</TableHead>
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
                          <div className="text-sm text-gray-500">{test.subjectName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(test.date).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getScoreColor(test.score)} text-white`}>
                          {test.score}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {test.correctAnswers}/{test.totalQuestions}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{test.timeSpent}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{test.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(test.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTest(test.id)}
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
      </div>
    </div>
  );
};

export default PreviousTests;
