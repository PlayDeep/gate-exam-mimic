
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTestSessions, TestSession, getTestSessionDetails, deleteTestSession } from "@/services/testService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePreviousTests = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view your test history.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, loading, navigate, toast]);

  useEffect(() => {
    const fetchTestSessions = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const sessions = await getUserTestSessions();
        setTests(sessions);
      } catch (error) {
        console.error('Error fetching test sessions:', error);
        toast({
          title: "Error",
          description: "Failed to load test history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestSessions();
  }, [user, toast]);

  const handleViewDetails = async (testId: string) => {
    try {
      console.log('Loading test details for:', testId);
      const sessionDetails = await getTestSessionDetails(testId);
      console.log('Session details:', sessionDetails);
      
      if (!sessionDetails || !sessionDetails.session) {
        console.error('No session details found');
        toast({
          title: "Error",
          description: "Could not load test details.",
          variant: "destructive",
        });
        return;
      }

      const { session, answers } = sessionDetails;
      console.log('Session:', session);
      console.log('Answers:', answers);
      
      // Get questions for this test based on the subject
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', session.subject)
        .limit(session.total_questions);

      if (error) {
        console.error('Error fetching questions:', error);
        toast({
          title: "Error",
          description: "Could not load test questions.",
          variant: "destructive",
        });
        return;
      }

      console.log('Questions fetched:', questions);

      if (!questions || questions.length === 0) {
        toast({
          title: "Error",
          description: "No questions found for this test.",
          variant: "destructive",
        });
        return;
      }

      // Create a map of question IDs to question indices for proper mapping
      const questionIdToIndex: Record<string, number> = {};
      questions.forEach((question, index) => {
        questionIdToIndex[question.id] = index + 1;
      });

      // Convert answers to the format expected by Results page
      const answersMap: Record<number, string> = {};
      answers.forEach((answer: any) => {
        if (answer.user_answer && answer.question_id) {
          const questionIndex = questionIdToIndex[answer.question_id];
          if (questionIndex) {
            answersMap[questionIndex] = answer.user_answer;
          }
        }
      });

      console.log('Answers map:', answersMap);
      console.log('Questions for results:', questions);

      // Navigate to results with the proper data structure
      navigate('/results', {
        state: {
          answers: answersMap,
          questions: questions,
          timeSpent: session.time_taken || 0,
          subject: session.subject,
          score: session.score,
          percentage: session.percentage
        }
      });
    } catch (error) {
      console.error('Error loading test details:', error);
      toast({
        title: "Error",
        description: "Failed to load test details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      console.log('Deleting test session:', testId);
      
      // Use the service function to properly delete the test session
      await deleteTestSession(testId);

      // Update local state only after successful deletion
      setTests(prev => prev.filter(test => test.id !== testId));
      
      toast({
        title: "Success",
        description: "Test deleted successfully.",
      });
      
      console.log('Test session deleted successfully');
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test.",
        variant: "destructive",
      });
    }
  };

  return {
    tests,
    isLoading,
    handleViewDetails,
    handleDeleteTest
  };
};
