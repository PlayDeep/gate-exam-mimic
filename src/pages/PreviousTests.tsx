import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Calendar, Clock, Award, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTestSessions, TestSession, getTestSessionDetails } from "@/services/testService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PreviousTests = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your test history.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    const fetchTestSessions = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const sessions = await getUserTestSessions();
        setTests(sessions);
      } catch (error) {
        console.error('Error fetching test sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load test history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestSessions();
  }, [user, toast]);

  const handleViewDetails = async (testId: string) => {
    try {
      const sessionDetails = await getTestSessionDetails(testId);
      
      if (!sessionDetails || !sessionDetails.session) {
        toast({
          title: "Error",
          description: "Could not load test details.",
          variant: "destructive",
        });
        return;
      }

      const { session, answers } = sessionDetails;
      
      // Get questions for this test based on the subject
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', session.subject)
        .limit(session.total_questions);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Could not load test questions.",
          variant: "destructive",
        });
        return;
      }

      // Convert answers to the format expected by Results page
      const answersMap: Record<number, string> = {};
      answers.forEach((answer: any, index: number) => {
        if (answer.user_answer) {
          answersMap[index + 1] = answer.user_answer;
        }
      });

      // Navigate to results with the proper data structure
      navigate('/results', {
        state: {
          answers: answersMap,
          questions: questions || [],
          timeSpent: session.time_taken || 0,
          subject: session.subject,
          score: session.score,
          percentage: session.percentage
        }
      });
    } catch (error) {
      console.error('Error loading test details:', error);
      toast({
        title: "Error",
        description: "Failed to load test details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const { error } = await supabase
        .from('test_sessions')
        .delete()
        .eq('id', testId);

      if (error) throw error;

      setTests(prev => prev.filter(test => test.id !== testId));
      toast({
        title: "Success",
        description: "Test deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test.",
        variant: "destructive",
      });
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test history...</p>
        </div>
      </div>
    );
  }

  const averageScore = tests.length > 0 ? Math.round(tests.reduce((sum, test) => sum + (test.percentage || 0), 0) / tests.length) : 0;
  const totalTests = tests.length;
  const bestScore = tests.length > 0 ? Math.max(...tests.map(test => test.percentage || 0)) : 0;

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
              <div className="text-2xl font-bold">{Math.round(bestScore)}%</div>
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
