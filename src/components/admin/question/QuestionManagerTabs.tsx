
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExcelQuestionUpload from '../ExcelQuestionUpload';
import QuestionList from './QuestionList';
import QuestionFilters from './QuestionFilters';

interface Question {
  id: string;
  subject: string;
  question_text: string;
  options?: any;
  correct_answer: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  explanation?: string;
}

interface QuestionManagerTabsProps {
  questions: Question[];
  onEdit: (question: Question) => void;
  onDelete: (id: string) => void;
}

const QuestionManagerTabs = ({ questions, onEdit, onDelete }: QuestionManagerTabsProps) => {
  const [filters, setFilters] = useState({
    subject: '',
    questionType: '',
    marks: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      subject: '',
      questionType: '',
      marks: ''
    });
  };

  const filteredQuestions = questions.filter(question => {
    if (filters.subject && question.subject !== filters.subject) return false;
    if (filters.questionType && question.question_type !== filters.questionType) return false;
    if (filters.marks && question.marks.toString() !== filters.marks) return false;
    return true;
  });

  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="excel">Excel Upload</TabsTrigger>
      </TabsList>
      
      <TabsContent value="manual">
        <Card>
          <CardHeader>
            <CardTitle>Questions ({filteredQuestions.length} of {questions.length})</CardTitle>
            <CardDescription>Manage all test questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <QuestionFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
            <QuestionList
              questions={filteredQuestions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="excel">
        <ExcelQuestionUpload />
      </TabsContent>
    </Tabs>
  );
};

export default QuestionManagerTabs;
