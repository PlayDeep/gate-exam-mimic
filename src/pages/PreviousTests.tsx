
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserTestSessions, TestSession, getTestSessionDetails } from "@/services/testService";
import { useToast } from "@/hooks/use-toast";
import { useSimpleTestDeletion } from "@/hooks/useSimpleTestDeletion";
import { supabase } from "@/integrations/supabase/client";
import PreviousTestsHeader from "@/components/previous-tests/PreviousTestsHeader";
import TestSummaryCards from "@/components/previous-tests/TestSummaryCards";
import TestHistoryTable from "@/components/previous-tests/TestHistoryTable";

const PreviousTests = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteTest, isDeleting } = useSimpleTestDeletion();

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
      const sessionDetails = await getTestSessionDetails(testId);
      
      if (!sessionDetails || !sessionDetails.session) {
        toast({
          title: "Error",
          description: "Could not load test details.",
          variant: "destructive",
        });
        return;
      }

      const { session, answers } = sessionDetails;
      
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('subject', session.subject)
        .limit(session.total_questions);

      if (error || !questions || questions.length === 0) {
        toast({
          title: "Error",
          description: "Could not load test questions.",
          variant: "destructive",
        });
        return;
      }

      const questionIdToIndex: Record<string, number> = {};
      questions.forEach((question, index) => {
        questionIdToIndex[question.id] = index + 1;
      });

      const answersMap: Record<number, string> = {};
      answers.forEach((answer: any) => {
        if (answer.user_answer && answer.question_id) {
          const questionIndex = questionIdToIndex[answer.question_id];
          if (questionIndex) {
            answersMap[questionIndex] = answer.user_answer;
          }
        }
      });

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
    const success = await deleteTest(testId);
    if (success) {
      setTests(prev => prev.filter(test => test.id !== testId));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PreviousTestsHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TestSummaryCards tests={tests} />
        <TestHistoryTable 
          tests={tests}
          onViewDetails={handleViewDetails}
          onDeleteTest={handleDeleteTest}
        />
      </div>
    </div>
  );
};

export default PreviousTests;
