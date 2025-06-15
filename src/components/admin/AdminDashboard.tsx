import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, FileQuestion, BarChart3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import QuestionManager from './QuestionManager';
import UserManager from './UserManager';
import TestAnalytics from './TestAnalytics';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    testsCompleted: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('Fetching dashboard stats...');
      
      // Fetch users count - using regular select and counting the array
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      // Fetch questions count - using regular select and counting the array
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('id');

      // Fetch completed tests count - using regular select and counting the array
      const { data: completedTestsData, error: testsError } = await supabase
        .from('test_sessions')
        .select('id')
        .eq('status', 'completed');

      if (usersError) {
        console.error('Error fetching users:', usersError);
      }
      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
      }
      if (testsError) {
        console.error('Error fetching tests:', testsError);
      }

      const newStats = {
        totalUsers: usersData?.length || 0,
        totalQuestions: questionsData?.length || 0,
        testsCompleted: completedTestsData?.length || 0
      };

      console.log('Dashboard stats:', newStats);
      console.log('Users data:', usersData);
      console.log('Questions data:', questionsData);
      console.log('Completed tests data:', completedTestsData);
      
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      description: "Registered users",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Questions",
      value: stats.totalQuestions.toString(),
      description: "Questions in database",
      icon: FileQuestion,
      color: "text-green-600"
    },
    {
      title: "Tests Completed",
      value: stats.testsCompleted.toString(),
      description: "Completed tests",
      icon: BarChart3,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage questions, users, and monitor test performance</p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsCards.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('questions')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Question
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {stats.testsCompleted > 0 
                      ? `${stats.testsCompleted} tests completed by ${stats.totalUsers} users`
                      : 'No recent activity'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questions">
            <QuestionManager />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>

          <TabsContent value="analytics">
            <TestAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
