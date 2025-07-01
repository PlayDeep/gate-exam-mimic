
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      // Delete in specific order to avoid foreign key conflicts
      
      // 1. Delete tracking data first (non-critical, can fail silently)
      try {
        const { error: trackingError } = await supabase
          .from('test_session_tracking')
          .delete()
          .eq('session_id', testId);
        
        if (trackingError) {
          console.warn('Non-critical: Could not delete tracking data:', trackingError);
        }
      } catch (trackingDeleteError) {
        console.warn('Non-critical tracking deletion error:', trackingDeleteError);
      }

      // 2. Delete user answers (critical)
      const { error: answersError } = await supabase
        .from('user_answers')
        .delete()
        .eq('session_id', testId);

      if (answersError) {
        console.error('Error deleting answers:', answersError);
        throw new Error(`Failed to delete test answers: ${answersError.message}`);
      }

      // 3. Delete test session (critical)
      const { error: sessionError } = await supabase
        .from('test_sessions')
        .delete()
        .eq('id', testId);

      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        throw new Error(`Failed to delete test session: ${sessionError.message}`);
      }

      console.log('Successfully deleted test:', testId);
      
      toast({
        title: "Success",
        description: "Test deleted successfully.",
      });
      
      return true;

    } catch (error) {
      console.error('Error deleting test:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete test. Please try again.";
        
      toast({
        title: "Error", 
        description: errorMessage,
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
