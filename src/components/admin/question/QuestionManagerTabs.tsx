
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ExcelQuestionUpload from '../ExcelQuestionUpload';
import QuestionList from './QuestionList';

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
  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        <TabsTrigger value="excel">Excel Upload</TabsTrigger>
      </TabsList>
      
      <TabsContent value="manual">
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
            <CardDescription>Manage all test questions</CardDescription>
          </CardHeader>
          <CardContent>
            <QuestionList
              questions={questions}
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
