
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
  console.log('=== FETCHING QUESTIONS FOR TEST ===');
  console.log('Subject:', subject);
  console.log('Limit:', limit);
  
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', subject);

  if (error) {
    console.error('Error fetching questions from database:', error);
    throw error;
  }

  console.log('Raw questions from database:', data?.length || 0);
  console.log('Questions data:', data);

  if (!data || data.length === 0) {
    console.warn('No questions found for subject:', subject);
    return [];
  }

  // Shuffle and select random questions up to the limit
  const shuffled = data.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

  console.log('Selected questions for test:', selected.length);
  console.log('Questions by type:', selected.reduce((acc, q) => {
    acc[q.question_type] = (acc[q.question_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));

  const processedQuestions = selected.map(q => ({
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

  console.log('Processed questions for return:', processedQuestions.length);
  console.log('=== END FETCHING QUESTIONS ===');
  
  return processedQuestions;
};

export const getAllSubjects = async (): Promise<string[]> => {
  console.log('=== FETCHING ALL SUBJECTS ===');
  
  const { data, error } = await supabase
    .from('questions')
    .select('subject')
    .order('subject');

  if (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }

  const uniqueSubjects = [...new Set(data.map(item => item.subject))];
  console.log('Available subjects:', uniqueSubjects);
  console.log('Total questions by subject:', data.reduce((acc, item) => {
    acc[item.subject] = (acc[item.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));
  console.log('=== END FETCHING SUBJECTS ===');
  
  return uniqueSubjects;
};
