import { useState } from 'react';
import type { Question, FormData } from '@/types/question';

const initialFormData: FormData = {
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
};

export const useQuestionForm = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const resetForm = () => {
    console.log('useQuestionForm: Resetting form');
    setFormData(initialFormData);
  };

  const handleAddQuestion = () => {
    console.log('useQuestionForm: Adding new question');
    resetForm();
    setEditingQuestion(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (question: Question) => {
    console.log('useQuestionForm: Editing question:', question.id);
    setEditingQuestion(question);
    
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

  const handleCancel = () => {
    console.log('useQuestionForm: Canceling form');
    setIsDialogOpen(false);
    setEditingQuestion(null);
    resetForm();
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingQuestion,
    formData,
    setFormData,
    resetForm,
    handleAddQuestion,
    handleEdit,
    handleCancel
  };
};
