
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TestAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalTests: 0,
    totalUsers: 0,
    avgScore: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Fetch basic analytics
    const { data: sessions } = await supabase
      .from('test_sessions')
      .select('*');

    const { data: users } = await supabase
      .from('profiles')
      .select('id');

    if (sessions && users) {
      const completedSessions = sessions.filter(s => s.status === 'completed');
      const avgScore = completedSessions.length > 0 
        ? completedSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSessions.length
        : 0;

      setAnalytics({
        totalTests: sessions.length,
        totalUsers: users.length,
        avgScore: Math.round(avgScore * 10) / 10,
        completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0
      });
    }
  };

  const subjectData = [
    { subject: 'CS', tests: 0, avgScore: 0 },
    { subject: 'ME', tests: 0, avgScore: 0 },
    { subject: 'EE', tests: 0, avgScore: 0 },
    { subject: 'CE', tests: 0, avgScore: 0 },
    { subject: 'ECE', tests: 0, avgScore: 0 },
    { subject: 'CH', tests: 0, avgScore: 0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Test Analytics</h2>
        <p className="text-gray-600">Performance insights and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTests}</div>
            <p className="text-xs text-muted-foreground">Tests taken</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgScore}%</div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">Tests completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tests by Subject</CardTitle>
            <CardDescription>Number of tests taken per subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tests" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Distribution of tests across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subject, tests }) => `${subject}: ${tests}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="tests"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestAnalytics;
