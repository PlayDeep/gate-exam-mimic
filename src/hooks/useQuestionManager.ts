
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import type { Question, FormData } from '@/types/question';
import * as questionService from '@/services/questionManagerService';

export const useQuestionManager = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = async () => {
    console.log('useQuestionManager: Fetching all questions...');
    setLoading(true);
    try {
      const data = await questionService.fetchQuestions();
      setQuestions(data);
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
      await questionService.addSampleImageQuestion();
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
      await questionService.deleteAllQuestions();
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
      const success = await questionService.submitQuestion(formData, editingQuestion);
      if (success) {
        fetchQuestions();
      }
      return success;
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
      await questionService.deleteQuestion(id);
      fetchQuestions();
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
