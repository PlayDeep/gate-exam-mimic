
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getRandomQuestionsForTest } from "@/services/questionService";
import { createTestSession, checkIfTestSubmitted } from "@/services/testService";

interface UseExamInitializationProps {
  subject: string | undefined;
  user: any;
  loading: boolean;
  sessionId: string;
  setSessionId: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setQuestions: (value: any[]) => void;
}

export const useExamInitialization = ({
  subject,
  user,
  loading,
  sessionId,
  setSessionId,
  isLoading,
  setIsLoading,
  setQuestions
}: UseExamInitializationProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to take the test.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, loading, navigate, toast]);

  // Check if test is already submitted when session ID is available
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (sessionId) {
        const isSubmitted = await checkIfTestSubmitted(sessionId);
        if (isSubmitted) {
          toast({
            title: "Test Already Submitted",
            description: "This test has already been submitted. You cannot make changes.",
            variant: "destructive",
          });
          navigate('/previous-tests');
        }
      }
    };

    checkSubmissionStatus();
  }, [sessionId, toast, navigate]);

  // Load questions and create test session
  useEffect(() => {
    const initializeTest = async () => {
      if (!subject || !user) return;
      
      try {
        setIsLoading(true);
        
        // Get random questions for this subject
        const fetchedQuestions = await getRandomQuestionsForTest(subject.toUpperCase(), 65);
        
        if (fetchedQuestions.length === 0) {
          toast({
            title: "No Questions Available",
            description: "No questions found for this subject. Please contact administrator.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setQuestions(fetchedQuestions);
        console.log('Loaded questions:', fetchedQuestions.map(q => ({ id: q.id, correct_answer: q.correct_answer, question_type: q.question_type })));
        
        // Create test session
        const newSessionId = await createTestSession(subject.toUpperCase(), fetchedQuestions.length);
        setSessionId(newSessionId);
        
      } catch (error) {
        console.error('Error initializing test:', error);
        toast({
          title: "Error",
          description: "Failed to load test questions. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTest();
  }, [subject, user, navigate, toast, setIsLoading, setQuestions, setSessionId]);

  return {
    // No return values needed, this hook only handles initialization effects
  };
};
