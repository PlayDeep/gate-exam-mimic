
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import QuestionStats from './question/QuestionStats';
import QuestionActions from './question/QuestionActions';
import QuestionFormDialog from './question/QuestionFormDialog';
import QuestionManagerTabs from './question/QuestionManagerTabs';

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
    console.log('Fetching all questions...');
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      });
    } else {
      console.log('Fetched questions:', data?.length || 0, 'questions');
      console.log('Questions by subject:', data?.reduce((acc, q) => {
        acc[q.subject] = (acc[q.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
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
      console.error('Error adding sample question:', error);
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
      console.error('Error saving question:', result.error);
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
      console.error('Error deleting question:', error);
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

  const handleAddQuestion = () => {
    resetForm();
    setEditingQuestion(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <QuestionStats questionsCount={questions.length} />
        <QuestionActions
          onAddSample={addSampleImageQuestion}
          onAddQuestion={handleAddQuestion}
          loading={loading}
        />
      </div>

      <QuestionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingQuestion={editingQuestion}
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => setIsDialogOpen(false)}
        onFormDataChange={setFormData}
      />

      <QuestionManagerTabs
        questions={questions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default QuestionManager;
