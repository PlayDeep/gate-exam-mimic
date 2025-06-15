
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getRandomQuestionsForTest } from '@/services/questionService';
import { createTestSession } from '@/services/testService';
import { Question } from '@/services/questionService';

export const useExamInitialization = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      console.log('useExamInitialization: User not authenticated, redirecting to home');
      toast({
        title: "Authentication Required",
        description: "Please log in to take the test.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);

  // Initialize exam - only run once
  useEffect(() => {
    const initializeExam = async () => {
      if (!subject || !user || sessionId || isInitialized || !loading === false) {
        return;
      }
      
      try {
        console.log('useExamInitialization: Starting exam initialization');
        setIsLoading(true);
        setIsInitialized(true);
        
        const fetchedQuestions = await getRandomQuestionsForTest(subject.toUpperCase(), 65);
        
        if (fetchedQuestions.length === 0) {
          console.error('useExamInitialization: No questions found for subject:', subject);
          toast({
            title: "No Questions Available",
            description: "No questions found for this subject.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        console.log('useExamInitialization: Questions loaded successfully:', fetchedQuestions.length);
        setQuestions(fetchedQuestions);
        
        const newSessionId = await createTestSession(subject.toUpperCase(), fetchedQuestions.length);
        console.log('useExamInitialization: Session created successfully:', newSessionId);
        setSessionId(newSessionId);
        
        console.log('useExamInitialization: Exam initialization complete');
        
      } catch (error) {
        console.error('useExamInitialization: Error during initialization:', error);
        toast({
          title: "Initialization Error",
          description: error instanceof Error ? error.message : "Failed to load test questions.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
  }, [subject, user, loading]); // Controlled dependencies

  return {
    questions,
    sessionId,
    isLoading,
    subject
  };
};
