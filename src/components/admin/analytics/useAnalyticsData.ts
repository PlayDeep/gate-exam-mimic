
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

interface AnalyticsData {
  totalTests: number;
  totalUsers: number;
  avgScore: number;
  completionRate: number;
  totalTimeSpent: number;
  avgTestDuration: number;
}

export const useAnalyticsData = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
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

  useEffect(() => {
    fetchComprehensiveAnalytics();
  }, []);

  return {
    analytics,
    userPerformance,
    subjectAnalytics,
    recentActivity,
    loading,
    refetch: fetchComprehensiveAnalytics
  };
};
