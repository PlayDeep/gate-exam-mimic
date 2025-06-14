import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

interface FormData {
  subject: string;
  question_text: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_image: string;
  option_b_image: string;
  option_c_image: string;
  option_d_image: string;
  explanation: string;
  question_image: string;
  explanation_image: string;
}

export const useQuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async () => {
    console.log('useQuestionManager: Fetching all questions...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useQuestionManager: Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch questions",
          variant: "destructive"
        });
        setQuestions([]);
      } else {
        console.log('useQuestionManager: Fetched questions:', data?.length || 0, 'questions');
        setQuestions(data || []);
      }
    } catch (error) {
      console.error('useQuestionManager: Unexpected error fetching questions:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setQuestions([]);
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
      console.error('useQuestionManager: Error adding sample question:', error);
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
      // First, delete all user answers to avoid foreign key constraint violation
      console.log('useQuestionManager: Deleting all user answers first...');
      const { error: answersError } = await supabase
        .from('user_answers')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all by using a condition that matches everything

      if (answersError) {
        console.error('useQuestionManager: Error deleting user answers:', answersError);
        throw answersError;
      }

      // Then delete all questions
      console.log('useQuestionManager: Deleting all questions...');
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all by using a condition that matches everything

      if (questionsError) {
        console.error('useQuestionManager: Error deleting questions:', questionsError);
        throw questionsError;
      }

      toast({
        title: "Success",
        description: "All questions and related data deleted successfully!"
      });
      
      fetchQuestions();
    } catch (error: any) {
      console.error('useQuestionManager: Error deleting all questions:', error);
      toast({
        title: "Error",
        description: `Failed to delete questions: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData, editingQuestion: Question | null) => {
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
        console.error('useQuestionManager: Error saving question:', result.error);
        toast({
          title: "Error",
          description: `Failed to ${editingQuestion ? 'update' : 'create'} question: ${result.error.message}`,
          variant: "destructive"
        });
        return false;
      } else {
        toast({
          title: "Success",
          description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`
        });
        fetchQuestions();
        return true;
      }
    } catch (error: any) {
      console.error('useQuestionManager: Unexpected error saving question:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
      return false;
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
        console.error('useQuestionManager: Error deleting question:', error);
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
      console.error('useQuestionManager: Unexpected error deleting question:', error);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    console.log('useQuestionManager: Component mounted, fetching questions');
    fetchQuestions();
  }, []);

  return {
    questions,
    loading,
    fetchQuestions,
    addSampleImageQuestion,
    handleDeleteAll,
    handleSubmit,
    handleDelete
  };
};
