
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SubjectAnalytics {
  subject: string;
  total_tests: number;
  avg_score: number;
  total_users: number;
  completion_rate: number;
}

interface AnalyticsChartsProps {
  subjectAnalytics: SubjectAnalytics[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ subjectAnalytics }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
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
  );
};

export default AnalyticsCharts;
