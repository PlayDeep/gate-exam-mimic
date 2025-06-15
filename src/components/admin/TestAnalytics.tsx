
import React from 'react';
import AnalyticsOverview from './analytics/AnalyticsOverview';
import UserPerformanceRankings from './analytics/UserPerformanceRankings';
import SubjectAnalyticsTable from './analytics/SubjectAnalyticsTable';
import RecentActivity from './analytics/RecentActivity';
import AnalyticsCharts from './analytics/AnalyticsCharts';
import { useAnalyticsData } from './analytics/useAnalyticsData';

const TestAnalytics: React.FC = () => {
  const {
    analytics,
    userPerformance,
    subjectAnalytics,
    recentActivity,
    loading
  } = useAnalyticsData();

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
      <AnalyticsOverview analytics={analytics} />

      {/* Charts */}
      <AnalyticsCharts subjectAnalytics={subjectAnalytics} />

      {/* User Performance Rankings */}
      <UserPerformanceRankings userPerformance={userPerformance} />

      {/* Subject Analytics Table */}
      <SubjectAnalyticsTable subjectAnalytics={subjectAnalytics} />

      {/* Recent Activity */}
      <RecentActivity recentActivity={recentActivity} />
    </div>
  );
};

export default TestAnalytics;
