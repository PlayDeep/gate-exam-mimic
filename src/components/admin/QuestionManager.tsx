
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Plus, TestTube } from 'lucide-react';
import ExcelQuestionUpload from './ExcelQuestionUpload';
import QuestionForm from './question/QuestionForm';
import QuestionList from './question/QuestionList';

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

const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    question_text: '',
    question_type: 'MCQ',
    marks: 1,
    negative_marks: 0,
    correct_answer: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    explanation: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      });
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  const addSampleImageQuestion = async () => {
    setLoading(true);
    try {
      const sampleQuestion = {
        subject: 'CS',
        question_text: 'Look at the following network diagram and identify the topology:',
        question_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop',
        question_type: 'MCQ',
        marks: 2,
        negative_marks: 0.5,
        correct_answer: 'B',
        explanation: 'This is a star topology where all nodes connect to a central hub.',
        explanation_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        options: {
          A: { 
            text: 'Bus Topology',
            image: null
          },
          B: { 
            text: 'Star Topology',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=150&fit=crop'
          },
          C: { 
            text: 'Ring Topology',
            image: null
          },
          D: { 
            text: 'Mesh Topology',
            image: null
          }
        }
      };

      const { error } = await supabase
        .from('questions')
        .insert([sampleQuestion]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sample image-based question added successfully!"
      });
      
      fetchQuestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to add sample question: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const questionData = {
      subject: formData.subject,
      question_text: formData.question_text,
      question_type: formData.question_type,
      marks: formData.marks,
      negative_marks: formData.negative_marks,
      correct_answer: formData.correct_answer,
      explanation: formData.explanation,
      options: formData.question_type === 'MCQ' ? {
        A: formData.option_a,
        B: formData.option_b,
        C: formData.option_c,
        D: formData.option_d
      } : null
    };

    let result;
    if (editingQuestion) {
      result = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', editingQuestion.id);
    } else {
      result = await supabase
        .from('questions')
        .insert([questionData]);
    }

    if (result.error) {
      toast({
        title: "Error",
        description: `Failed to ${editingQuestion ? 'update' : 'create'} question`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`
      });
      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Question deleted successfully!"
      });
      fetchQuestions();
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      subject: question.subject,
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks,
      negative_marks: question.negative_marks,
      correct_answer: question.correct_answer,
      option_a: question.options?.A || '',
      option_b: question.options?.B || '',
      option_c: question.options?.C || '',
      option_d: question.options?.D || '',
      explanation: question.explanation || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      question_text: '',
      question_type: 'MCQ',
      marks: 1,
      negative_marks: 0,
      correct_answer: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      explanation: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Question Manager</h2>
          <p className="text-gray-600">Add and manage test questions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={addSampleImageQuestion} variant="outline" disabled={loading}>
            <TestTube className="mr-2 h-4 w-4" />
            Add Sample Image Question
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingQuestion(null); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Edit Question' : 'Add New Question'}
                </DialogTitle>
              </DialogHeader>
              
              <QuestionForm
                formData={formData}
                editingQuestion={editingQuestion}
                loading={loading}
                onSubmit={handleSubmit}
                onCancel={() => setIsDialogOpen(false)}
                onFormDataChange={setFormData}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="excel">
          <ExcelQuestionUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionManager;
