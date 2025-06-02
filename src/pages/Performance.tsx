
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, TrendingUp, Target, Award, Calendar, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Mock performance data
const scoreData = [
  { test: "Test 1", score: 67 },
  { test: "Test 2", score: 78 },
  { test: "Test 3", score: 85 },
  { test: "Test 4", score: 92 },
];

const subjectPerformance = [
  { subject: "Mathematics", score: 85, total: 20 },
  { subject: "Physics", score: 78, total: 15 },
  { subject: "Programming", score: 92, total: 20 },
  { subject: "Algorithms", score: 88, total: 10 },
];

const timeDistribution = [
  { name: "Mathematics", value: 30, color: "#8884d8" },
  { name: "Physics", value: 25, color: "#82ca9d" },
  { name: "Programming", value: 35, color: "#ffc658" },
  { name: "Algorithms", value: 10, color: "#ff7300" },
];

const Performance = () => {
  const navigate = useNavigate();

  const averageScore = 80.5;
  const totalTests = 4;
  const totalTimeSpent = "11h 18m";
  const improvementRate = 25;

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
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                +{improvementRate}% from first test
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTests}</div>
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
              <div className="text-2xl font-bold">{totalTimeSpent}</div>
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
              <div className="text-2xl font-bold">+{improvementRate}%</div>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={scoreData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Time Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Time Distribution</CardTitle>
              <CardDescription>How you spend time across subjects</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Subject Performance */}
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
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Subject Analysis */}
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
                        subject.score >= 90 ? 'bg-green-500' :
                        subject.score >= 80 ? 'bg-blue-500' :
                        subject.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      } text-white`}
                    >
                      {subject.score}%
                    </Badge>
                  </div>
                  <Progress value={subject.score} className="h-2" />
                  <div className="text-sm text-gray-500">
                    {Math.round((subject.score / 100) * subject.total)}/{subject.total} questions correct
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Personalized suggestions to improve your performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Focus on Physics</h4>
                  <p className="text-sm text-gray-600">Your Physics score (78%) has room for improvement. Consider spending more time on thermodynamics and electromagnetism.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Strong Programming Skills</h4>
                  <p className="text-sm text-gray-600">Excellent performance in Programming (92%). Keep practicing data structures and algorithms to maintain this strength.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Time Management</h4>
                  <p className="text-sm text-gray-600">Consider practicing time-bound tests to improve speed while maintaining accuracy.</p>
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
