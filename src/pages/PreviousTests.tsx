
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
        console.log('PreviousTests: Fetching test sessions for user:', user.id);
        const sessions = await getUserTestSessions();
        console.log('PreviousTests: Fetched sessions:', sessions);
        
        // Log missing data for debugging
        sessions.forEach((session, index) => {
          const missingFields = [];
          if (!session.answered_questions) missingFields.push('answered_questions');
          if (!session.score && session.score !== 0) missingFields.push('score');
          if (!session.percentage && session.percentage !== 0) missingFields.push('percentage');
          if (!session.time_taken) missingFields.push('time_taken');
          if (!session.end_time) missingFields.push('end_time');
          
          if (missingFields.length > 0) {
            console.warn(`Session ${index + 1} (${session.id}) missing data:`, missingFields);
          }
        });
        
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
      console.log('PreviousTests: Loading test details for:', testId);
      const sessionDetails = await getTestSessionDetails(testId);
      
      if (!sessionDetails || !sessionDetails.session) {
        console.error('No session details found for:', testId);
        toast({
          title: "Error",
          description: "Could not load test details.",
          variant: "destructive",
        });
        return;
      }

      const { session, answers } = sessionDetails;
      console.log('PreviousTests: Session details:', {
        sessionId: session.id,
        subject: session.subject,
        totalQuestions: session.total_questions,
        answeredQuestions: session.answered_questions,
        score: session.score,
        percentage: session.percentage,
        timeTaken: session.time_taken,
        answersCount: answers.length
      });
      
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

      if (!questions || questions.length === 0) {
        toast({
          title: "Error",
          description: "No questions found for this test.",
          variant: "destructive",
        });
        return;
      }

      console.log('PreviousTests: Questions fetched:', questions.length);

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

      console.log('PreviousTests: Processed data for results:', {
        answersMap,
        questionsCount: questions.length,
        timeSpent: session.time_taken || 0,
        subject: session.subject,
        score: session.score,
        percentage: session.percentage
      });

      // Navigate to results with comprehensive data
      navigate('/results', {
        state: {
          sessionId: session.id,
          answers: answersMap,
          questions: questions,
          timeSpent: session.time_taken || 0,
          subject: session.subject,
          score: session.score,
          percentage: session.percentage,
          maxScore: questions.reduce((sum, q) => sum + (q.marks || 1), 0),
          answeredQuestions: session.answered_questions,
          totalQuestions: session.total_questions
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
