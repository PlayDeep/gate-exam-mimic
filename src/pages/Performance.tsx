
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Target, Award, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTestSessions, TestSession } from "@/services/testService";
import { useToast } from "@/hooks/use-toast";

interface SubjectPerformance {
  subject: string;
  averageScore: number;
  testsCount: number;
  totalQuestions: number;
  correctAnswers: number;
}

const Performance = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your performance.",
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
        setTests(sessions.filter(test => test.status === 'completed'));
      } catch (error) {
        console.error('Error fetching test sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load performance data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestSessions();
  }, [user, toast]);

  // Calculate performance metrics
  const averageScore = tests.length > 0 ? 
    tests.reduce((sum, test) => sum + (test.percentage || 0), 0) / tests.length : 0;

  const totalTimeSpent = tests.reduce((sum, test) => sum + (test.time_taken || 0), 0);
  
  const improvementRate = tests.length >= 2 ? 
    ((tests[0].percentage || 0) - (tests[tests.length - 1].percentage || 0)) : 0;

  // Prepare score trend data
  const scoreData = tests.slice(-10).map((test, index) => ({
    test: `Test ${index + 1}`,
    score: Math.round(test.percentage || 0),
    date: test.start_time
  })).reverse();

  // Calculate subject-wise performance
  const subjectPerformanceMap: Record<string, SubjectPerformance> = {};
  
  tests.forEach(test => {
    if (!subjectPerformanceMap[test.subject]) {
      subjectPerformanceMap[test.subject] = {
        subject: test.subject,
        averageScore: 0,
        testsCount: 0,
        totalQuestions: 0,
        correctAnswers: 0
      };
    }
    
    const perf = subjectPerformanceMap[test.subject];
    perf.testsCount++;
    perf.totalQuestions += test.total_questions;
    perf.correctAnswers += Math.round((test.percentage || 0) / 100 * test.total_questions);
    perf.averageScore = (perf.correctAnswers / perf.totalQuestions) * 100;
  });

  const subjectPerformance = Object.values(subjectPerformanceMap);

  // Prepare time distribution data
  const timeDistribution = subjectPerformance.map((subject, index) => ({
    name: subject.subject,
    value: subject.testsCount,
    color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'][index % 5]
  }));

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading performance data...</p>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                  <p className="text-sm text-gray-500">Detailed insights into your GATE preparation</p>
                </div>
              </div>
              <Button onClick={() => navigate('/')} variant="outline">
                Back to Home
              </Button>
            </div>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Performance Data</h3>
            <p className="mt-1 text-sm text-gray-500">
              You need to complete at least one test to see your performance analytics.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/')}>
                Take Your First Test
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
                <p className="text-sm text-gray-500">Detailed insights into your GATE preparation</p>
              </div>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
              <p className="text-xs text-muted-foreground">
                {improvementRate > 0 ? '+' : ''}{Math.round(improvementRate)}% from first test
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tests.length}</div>
              <p className="text-xs text-muted-foreground">
                Mock tests attempted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
              <p className="text-xs text-muted-foreground">
                Total practice time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {improvementRate > 0 ? '+' : ''}{Math.round(improvementRate)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Score improvement
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Score Progression</CardTitle>
              <CardDescription>Your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              {scoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="test" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  Complete more tests to see progression
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Distribution</CardTitle>
              <CardDescription>Tests taken across subjects</CardDescription>
            </CardHeader>
            <CardContent>
              {timeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={timeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {timeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subject Performance */}
        {subjectPerformance.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <CardDescription>Detailed breakdown by subject areas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="averageScore" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Detailed Subject Analysis */}
        {subjectPerformance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Subject Analysis</CardTitle>
              <CardDescription>Strengths and areas for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {subjectPerformance.map((subject) => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <Badge 
                        className={`${
                          subject.averageScore >= 90 ? 'bg-green-500' :
                          subject.averageScore >= 80 ? 'bg-blue-500' :
                          subject.averageScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        } text-white`}
                      >
                        {Math.round(subject.averageScore)}%
                      </Badge>
                    </div>
                    <Progress value={subject.averageScore} className="h-2" />
                    <div className="text-sm text-gray-500">
                      {subject.correctAnswers}/{subject.totalQuestions} questions correct across {subject.testsCount} test{subject.testsCount > 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Personalized suggestions to improve your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.length > 0 && (
                <>
                  {subjectPerformance
                    .filter(subject => subject.averageScore < 75)
                    .slice(0, 2)
                    .map((subject) => (
                      <div key={subject.subject} className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Focus on {subject.subject}</h4>
                          <p className="text-sm text-gray-600">
                            Your {subject.subject} score ({Math.round(subject.averageScore)}%) has room for improvement. 
                            Consider spending more time practicing this subject.
                          </p>
                        </div>
                      </div>
                    ))}
                  
                  {subjectPerformance
                    .filter(subject => subject.averageScore >= 85)
                    .slice(0, 1)
                    .map((subject) => (
                      <div key={subject.subject} className="flex items-start space-x-3">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium">Strong {subject.subject} Performance</h4>
                          <p className="text-sm text-gray-600">
                            Excellent performance in {subject.subject} ({Math.round(subject.averageScore)}%). 
                            Keep practicing to maintain this strength.
                          </p>
                        </div>
                      </div>
                    ))}
                </>
              )}
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Time Management</h4>
                  <p className="text-sm text-gray-600">
                    {averageScore < 70 
                      ? "Consider practicing time-bound tests to improve speed while maintaining accuracy."
                      : "Great job on time management! Continue practicing to maintain your pace."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
