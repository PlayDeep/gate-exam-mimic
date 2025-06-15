
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const deleteQuestion = async (id: string): Promise<void> => {
  console.log('questionDeletionService: Starting deletion process for question:', id);
  
  try {
    // First, check if there are any user answers for this question
    console.log('questionDeletionService: Checking for user answers for question:', id);
    const { data: userAnswers, error: checkError } = await supabase
      .from('user_answers')
      .select('id')
      .eq('question_id', id);

    if (checkError) {
      console.error('questionDeletionService: Error checking user answers:', checkError);
      throw checkError;
    }

    console.log('questionDeletionService: Found', userAnswers?.length || 0, 'user answers for question:', id);

    // Delete all user answers for this specific question if any exist
    if (userAnswers && userAnswers.length > 0) {
      console.log('questionDeletionService: Deleting', userAnswers.length, 'user answers for question:', id);
      const { error: answersError } = await supabase
        .from('user_answers')
        .delete()
        .eq('question_id', id);

      if (answersError) {
        console.error('questionDeletionService: Error deleting user answers for question:', answersError);
        toast({
          title: "Error",
          description: `Failed to delete related user answers: ${answersError.message}`,
          variant: "destructive"
        });
        throw answersError;
      }
      console.log('questionDeletionService: Successfully deleted user answers for question:', id);
    }

    // Now delete the question
    console.log('questionDeletionService: Deleting question:', id);
    const { error: questionError } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (questionError) {
      console.error('questionDeletionService: Error deleting question:', questionError);
      
      // Handle specific foreign key constraint errors
      if (questionError.code === '23503') {
        toast({
          title: "Error",
          description: "Cannot delete question: it has associated test answers. Please delete all test data first or contact support.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to delete question: ${questionError.message}`,
          variant: "destructive"
        });
      }
      throw questionError;
    }

    console.log('questionDeletionService: Successfully deleted question:', id);
    toast({
      title: "Success",
      description: "Question deleted successfully!"
    });
  } catch (error: any) {
    console.error('questionDeletionService: Unexpected error in deleteQuestion:', error);
    
    // Only show toast if we haven't already shown one
    if (!error.code || error.code !== '23503') {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the question. Please try again.",
        variant: "destructive"
      });
    }
    throw error;
  }
};

export const deleteAllQuestions = async (): Promise<void> => {
  // First, delete all user answers to avoid foreign key constraint violation
  console.log('questionDeletionService: Deleting all user answers first...');
  const { error: answersError } = await supabase
    .from('user_answers')
    .delete()
    .gt('answered_at', '1900-01-01'); // This will match all records since answered_at has a default of now()

  if (answersError) {
    console.error('questionDeletionService: Error deleting user answers:', answersError);
    throw answersError;
  }

  // Then delete all questions
  console.log('questionDeletionService: Deleting all questions...');
  const { error: questionsError } = await supabase
    .from('questions')
    .delete()
    .gt('created_at', '1900-01-01'); // This will match all records since created_at has a default of now()

  if (questionsError) {
    console.error('questionDeletionService: Error deleting questions:', questionsError);
    throw questionsError;
  }

  toast({
    title: "Success",
    description: "All questions and related data deleted successfully!"
  });
};
