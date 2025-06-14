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
  question_image?: string;
  explanation_image?: string;
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
    option_a_image: '',
    option_b_image: '',
    option_c_image: '',
    option_d_image: '',
    explanation: '',
    question_image: '',
    explanation_image: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    console.log('Fetching all questions...');
    setLoading(true);
    try {
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
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching questions:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        explanation_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=250&fit=crop',
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

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL questions? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      toast({
        title: "Success",
        description: "All questions deleted successfully!"
      });
      
      fetchQuestions();
    } catch (error: any) {
      console.error('Error deleting all questions:', error);
      toast({
        title: "Error",
        description: `Failed to delete questions: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionData = {
        subject: formData.subject,
        question_text: formData.question_text,
        question_type: formData.question_type,
        marks: formData.marks,
        negative_marks: formData.negative_marks,
        correct_answer: formData.correct_answer,
        explanation: formData.explanation || null,
        question_image: formData.question_image || null,
        explanation_image: formData.explanation_image || null,
        options: formData.question_type === 'MCQ' ? {
          A: {
            text: formData.option_a,
            image: formData.option_a_image || null
          },
          B: {
            text: formData.option_b,
            image: formData.option_b_image || null
          },
          C: {
            text: formData.option_c,
            image: formData.option_c_image || null
          },
          D: {
            text: formData.option_d,
            image: formData.option_d_image || null
          }
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
          description: `Failed to ${editingQuestion ? 'update' : 'create'} question: ${result.error.message}`,
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
    } catch (error: any) {
      console.error('Unexpected error saving question:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting question:', error);
        toast({
          title: "Error",
          description: `Failed to delete question: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Question deleted successfully!"
        });
        fetchQuestions();
      }
    } catch (error: any) {
      console.error('Unexpected error deleting question:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    
    // Parse options for editing
    const options = question.options || {};
    
    setFormData({
      subject: question.subject,
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks,
      negative_marks: question.negative_marks,
      correct_answer: question.correct_answer,
      option_a: options.A?.text || options.A || '',
      option_b: options.B?.text || options.B || '',
      option_c: options.C?.text || options.C || '',
      option_d: options.D?.text || options.D || '',
      option_a_image: options.A?.image || '',
      option_b_image: options.B?.image || '',
      option_c_image: options.C?.image || '',
      option_d_image: options.D?.image || '',
      explanation: question.explanation || '',
      question_image: question.question_image || '',
      explanation_image: question.explanation_image || ''
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
      option_a_image: '',
      option_b_image: '',
      option_c_image: '',
      option_d_image: '',
      explanation: '',
      question_image: '',
      explanation_image: ''
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
          onDeleteAll={handleDeleteAll}
          loading={loading}
          questions={questions}
        />
      </div>

      <QuestionFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingQuestion={editingQuestion}
        formData={formData}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => {
          setIsDialogOpen(false);
          setEditingQuestion(null);
          resetForm();
        }}
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
