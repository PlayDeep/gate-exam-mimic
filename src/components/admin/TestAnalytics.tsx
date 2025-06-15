
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface UserPerformance {
  user_id: string;
  email: string;
  full_name: string;
  total_attempts: number;
  best_score: number;
  avg_score: number;
  total_time_spent: number;
  avg_time_per_test: number;
  completion_rate: number;
}

interface SubjectAnalytics {
  subject: string;
  total_tests: number;
  avg_score: number;
  total_users: number;
  completion_rate: number;
}

const TestAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState({
    totalTests: 0,
    totalUsers: 0,
    avgScore: 0,
    completionRate: 0,
    totalTimeSpent: 0,
    avgTestDuration: 0
  });

  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [subjectAnalytics, setSubjectAnalytics] = useState<SubjectAnalytics[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComprehensiveAnalytics();
  }, []);

  const fetchComprehensiveAnalytics = async () => {
    setLoading(true);
    try {
      console.log('Fetching comprehensive analytics...');
      
      // Fetch basic analytics
      const { data: sessions } = await supabase
        .from('test_sessions')
        .select('*');

      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      console.log('Sessions data:', sessions?.length || 0);
      console.log('Users data:', users?.length || 0);

      // Calculate basic metrics
      if (sessions && users) {
        const completedSessions = sessions.filter(s => s.status === 'completed');
        const avgScore = completedSessions.length > 0 
          ? completedSessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSessions.length
          : 0;

        const totalTimeSpent = completedSessions.reduce((sum, s) => sum + (s.time_taken || 0), 0);
        const avgTestDuration = completedSessions.length > 0 ? totalTimeSpent / completedSessions.length : 0;

        const newAnalytics = {
          totalTests: sessions.length,
          totalUsers: users.length,
          avgScore: Math.round(avgScore * 10) / 10,
          completionRate: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
          totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
          avgTestDuration: Math.round(avgTestDuration / 60) // Convert to minutes
        };

        console.log('Calculated analytics:', newAnalytics);
        setAnalytics(newAnalytics);
      }

      // Fetch user performance data
      await fetchUserPerformance();
      
      // Fetch subject analytics
      await fetchSubjectAnalytics();
      
      // Fetch recent activity
      await fetchRecentActivity();

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPerformance = async () => {
    console.log('Fetching user performance...');
    
    const { data, error } = await supabase
      .from('test_sessions')
      .select(`
        user_id,
        percentage,
        time_taken,
        status,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching user performance:', error);
      return;
    }

    console.log('User performance data:', data?.length || 0, 'sessions');

    // Group by user and calculate metrics
    const userStats: { [key: string]: any } = {};
    
    data?.forEach(session => {
      const userId = session.user_id;
      if (!userStats[userId]) {
        userStats[userId] = {
          user_id: userId,
          email: session.profiles?.email || 'Unknown',
          full_name: session.profiles?.full_name || 'Unknown User',
          scores: [],
          times: [],
          total_attempts: 0
        };
      }
      
      userStats[userId].total_attempts += 1;
      userStats[userId].scores.push(session.percentage || 0);
      userStats[userId].times.push(session.time_taken || 0);
    });

    // Calculate final metrics and sort by best score
    const performanceData = Object.values(userStats).map((user: any) => ({
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      total_attempts: user.total_attempts,
      best_score: Math.max(...user.scores),
      avg_score: Math.round((user.scores.reduce((a: number, b: number) => a + b, 0) / user.scores.length) * 10) / 10,
      total_time_spent: Math.round(user.times.reduce((a: number, b: number) => a + b, 0) / 60), // minutes
      avg_time_per_test: Math.round((user.times.reduce((a: number, b: number) => a + b, 0) / user.times.length) / 60), // minutes
      completion_rate: 100 // All selected sessions are completed
    })).sort((a, b) => b.best_score - a.best_score);

    console.log('Processed user performance:', performanceData.length, 'users');
    setUserPerformance(performanceData);
  };

  const fetchSubjectAnalytics = async () => {
    console.log('Fetching subject analytics...');
    
    const { data, error } = await supabase
      .from('test_sessions')
      .select('subject, percentage, status, user_id');

    if (error) {
      console.error('Error fetching subject analytics:', error);
      return;
    }

    console.log('Subject analytics data:', data?.length || 0, 'sessions');

    // Group by subject
    const subjectStats: { [key: string]: any } = {};
    
    data?.forEach(session => {
      const subject = session.subject;
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          subject,
          sessions: [],
          users: new Set()
        };
      }
      
      subjectStats[subject].sessions.push(session);
      subjectStats[subject].users.add(session.user_id);
    });

    const subjectData = Object.values(subjectStats).map((subject: any) => {
      const completedSessions = subject.sessions.filter((s: any) => s.status === 'completed');
      const avgScore = completedSessions.length > 0
        ? completedSessions.reduce((sum: number, s: any) => sum + (s.percentage || 0), 0) / completedSessions.length
        : 0;

      return {
        subject: subject.subject,
        total_tests: subject.sessions.length,
        avg_score: Math.round(avgScore * 10) / 10,
        total_users: subject.users.size,
        completion_rate: subject.sessions.length > 0 
          ? Math.round((completedSessions.length / subject.sessions.length) * 100) 
          : 0
      };
    });

    console.log('Processed subject analytics:', subjectData.length, 'subjects');
    setSubjectAnalytics(subjectData);
  };

  const fetchRecentActivity = async () => {
    console.log('Fetching recent activity...');
    
    const { data, error } = await supabase
      .from('test_sessions')
      .select(`
        id,
        subject,
        percentage,
        status,
        start_time,
        time_taken,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .order('start_time', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching recent activity:', error);
      return;
    }

    console.log('Recent activity data:', data?.length || 0, 'activities');
    setRecentActivity(data || []);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Comprehensive Test Analytics</h2>
        <p className="text-gray-600">Performance insights, rankings, and detailed statistics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTests}</div>
            <p className="text-xs text-muted-foreground">Tests attempted</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTimeSpent}m</div>
            <p className="text-xs text-muted-foreground">Minutes spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgTestDuration}m</div>
            <p className="text-xs text-muted-foreground">Per test</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average scores and completion rates by subject</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_score" fill="#8884d8" name="Avg Score %" />
                <Bar dataKey="completion_rate" fill="#82ca9d" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Distribution</CardTitle>
            <CardDescription>Test attempts across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectAnalytics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ subject, total_tests }) => `${subject}: ${total_tests}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_tests"
                >
                  {subjectAnalytics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Performance Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>User Performance Rankings</CardTitle>
          <CardDescription>Top performers based on best scores and overall performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Best Score</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Total Time</TableHead>
                  <TableHead>Avg Time/Test</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userPerformance.slice(0, 10).map((user, index) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">#{index + 1}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                    <TableCell>{user.total_attempts}</TableCell>
                    <TableCell className="font-semibold text-green-600">{user.best_score}%</TableCell>
                    <TableCell>{user.avg_score}%</TableCell>
                    <TableCell>{user.total_time_spent}m</TableCell>
                    <TableCell>{user.avg_time_per_test}m</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {userPerformance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No user performance data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Analytics</CardTitle>
          <CardDescription>Detailed performance metrics by subject</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Total Tests</TableHead>
                <TableHead>Unique Users</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Completion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectAnalytics.map((subject) => (
                <TableRow key={subject.subject}>
                  <TableCell className="font-medium">{subject.subject}</TableCell>
                  <TableCell>{subject.total_tests}</TableCell>
                  <TableCell>{subject.total_users}</TableCell>
                  <TableCell>{subject.avg_score}%</TableCell>
                  <TableCell>{subject.completion_rate}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {subjectAnalytics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No subject data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Activity</CardTitle>
          <CardDescription>Latest test attempts and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.profiles?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{activity.subject}</TableCell>
                  <TableCell>
                    {activity.status === 'completed' ? `${activity.percentage}%` : '-'}
                  </TableCell>
                  <TableCell>
                    {activity.time_taken ? `${Math.round(activity.time_taken / 60)}m` : '-'}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activity.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(activity.start_time).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {recentActivity.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAnalytics;
