
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ActivityItem {
  id: string;
  subject: string;
  percentage: number;
  status: string;
  start_time: string;
  time_taken: number;
  profiles?: {
    full_name: string;
  };
}

interface RecentActivityProps {
  recentActivity: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivity }) => {
  return (
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
  );
};

export default RecentActivity;
