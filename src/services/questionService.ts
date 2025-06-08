
import { supabase } from '@/integrations/supabase/client';

export interface Question {
  id: string;
  subject: string;
  question_text: string;
  question_image?: string;
  options?: { 
    [key: string]: { 
      text: string; 
      image?: string; 
    } 
  } | { id: string; text: string; image?: string }[];
  correct_answer: string;
  question_type: 'MCQ' | 'NAT';
  marks: number;
  negative_marks?: number;
  explanation?: string;
  explanation_image?: string;
}

export const getRandomQuestionsForTest = async (subject: string, limit: number = 65): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', subject);

  if (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Shuffle and select random questions up to the limit
  const shuffled = data.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

  return selected.map(q => ({
    id: q.id,
    subject: q.subject,
    question_text: q.question_text,
    question_image: q.question_image || undefined,
    options: q.options as { [key: string]: { text: string; image?: string } } | { id: string; text: string; image?: string }[] | undefined,
    correct_answer: q.correct_answer,
    question_type: q.question_type as 'MCQ' | 'NAT',
    marks: q.marks,
    negative_marks: q.negative_marks || 0,
    explanation: q.explanation || undefined,
    explanation_image: q.explanation_image || undefined
  }));
};

export const getAllSubjects = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('subject')
    .order('subject');

  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }

  const uniqueSubjects = [...new Set(data.map(item => item.subject))];
  return uniqueSubjects;
};
