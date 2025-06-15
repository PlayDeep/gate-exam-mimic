
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TestSession } from "@/services/testService";

export const useSimpleTestDeletion = () => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const deleteTest = async (testId: string): Promise<boolean> => {
    if (!testId) {
      toast({
        title: "Error",
        description: "Invalid test ID.",
        variant: "destructive",
      });
      return false;
    }

    setIsDeleting(testId);
    console.log('Starting deletion for test:', testId);

    try {
      // Delete in order: tracking -> answers -> session
      
      // 1. Delete tracking data (non-critical)
      await supabase
        .from('test_session_tracking')
        .delete()
        .eq('session_id', testId);

      // 2. Delete user answers
      const { error: answersError } = await supabase
        .from('user_answers')
        .delete()
        .eq('session_id', testId);

      if (answersError) {
        console.error('Error deleting answers:', answersError);
        throw answersError;
      }

      // 3. Delete test session
      const { error: sessionError } = await supabase
        .from('test_sessions')
        .delete()
        .eq('id', testId);

      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        throw sessionError;
      }

      toast({
        title: "Success",
        description: "Test deleted successfully.",
      });
      
      console.log('Successfully deleted test:', testId);
      return true;

    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsDeleting(null);
    }
  };

  return {
    deleteTest,
    isDeleting
  };
};
