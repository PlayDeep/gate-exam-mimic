
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Question, FormData } from '@/types/question';

export const fetchQuestions = async (): Promise<Question[]> => {
  console.log('questionCrudService: Fetching all questions...');
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('questionCrudService: Error fetching questions:', error);
    toast({
      title: "Error",
      description: "Failed to fetch questions",
      variant: "destructive"
    });
    return [];
  }

  console.log('questionCrudService: Fetched questions:', data?.length || 0, 'questions');
  return data || [];
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
    console.error('questionCrudService: Error saving question:', result.error);
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
