
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Question, FormData } from '@/types/question';

export const fetchQuestions = async (): Promise<Question[]> => {
  console.log('questionManagerService: Fetching all questions...');
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('questionManagerService: Error fetching questions:', error);
    toast({
      title: "Error",
      description: "Failed to fetch questions",
      variant: "destructive"
    });
    return [];
  }

  console.log('questionManagerService: Fetched questions:', data?.length || 0, 'questions');
  return data || [];
};

export const addSampleImageQuestion = async (): Promise<void> => {
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
};

export const deleteAllQuestions = async (): Promise<void> => {
  // First, delete all user answers to avoid foreign key constraint violation
  console.log('questionManagerService: Deleting all user answers first...');
  const { error: answersError } = await supabase
    .from('user_answers')
    .delete()
    .neq('id', ''); // This will match all records since id is never empty

  if (answersError) {
    console.error('questionManagerService: Error deleting user answers:', answersError);
    throw answersError;
  }

  // Then delete all questions
  console.log('questionManagerService: Deleting all questions...');
  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .neq('id', ''); // This will match all records since id is never empty

  if (questionsError) {
    console.error('questionManagerService: Error deleting questions:', questionsError);
    throw questionsError;
  }

  toast({
    title: "Success",
    description: "All questions and related data deleted successfully!"
  });
};

export const submitQuestion = async (formData: FormData, editingQuestion: Question | null): Promise<boolean> => {
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
    console.error('questionManagerService: Error saving question:', result.error);
    toast({
      title: "Error",
      description: `Failed to ${editingQuestion ? 'update' : 'create'} question: ${result.error.message}`,
      variant: "destructive"
    });
    return false;
  }

  toast({
    title: "Success",
    description: `Question ${editingQuestion ? 'updated' : 'created'} successfully!`
  });
  return true;
};

export const deleteQuestion = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('questionManagerService: Error deleting question:', error);
    toast({
      title: "Error",
      description: `Failed to delete question: ${error.message}`,
      variant: "destructive"
    });
    throw error;
  }

  toast({
    title: "Success",
    description: "Question deleted successfully!"
  });
};
