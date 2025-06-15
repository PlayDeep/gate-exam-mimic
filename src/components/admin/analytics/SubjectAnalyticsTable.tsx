
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SubjectAnalytics {
  subject: string;
  total_tests: number;
  avg_score: number;
  total_users: number;
  completion_rate: number;
}

interface SubjectAnalyticsTableProps {
  subjectAnalytics: SubjectAnalytics[];
}

const SubjectAnalyticsTable: React.FC<SubjectAnalyticsTableProps> = ({ subjectAnalytics }) => {
  return (
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
  );
};

export default SubjectAnalyticsTable;
