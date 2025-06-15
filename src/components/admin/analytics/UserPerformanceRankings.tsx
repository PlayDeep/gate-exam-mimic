
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface UserPerformanceRankingsProps {
  userPerformance: UserPerformance[];
}

const UserPerformanceRankings: React.FC<UserPerformanceRankingsProps> = ({ userPerformance }) => {
  return (
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
  );
};

export default UserPerformanceRankings;
