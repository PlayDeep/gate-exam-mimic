
import { useState, useEffect, useRef } from 'react';
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
  const initializationAttemptedRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authentication check - separate effect
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('useExamInitialization: User not authenticated, redirecting to home');
        toast({
          title: "Authentication Required",
          description: "Please log in to take the test.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
      
      if (!subject) {
        console.log('useExamInitialization: No subject provided, redirecting to home');
        toast({
          title: "Invalid Request",
          description: "No subject specified for the test.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    }
  }, [user, loading, subject, navigate, toast]);

  // Initialize exam - only run once when conditions are met
  useEffect(() => {
    const initializeExam = async () => {
      // Check if we should initialize
      if (loading || !user || !subject || initializationAttemptedRef.current) {
        return;
      }
      
      // Prevent multiple initialization attempts
      initializationAttemptedRef.current = true;
      
      try {
        console.log('useExamInitialization: Starting exam initialization for subject:', subject);
        setIsLoading(true);
        setError(null);
        
        const fetchedQuestions = await getRandomQuestionsForTest(subject.toUpperCase(), 65);
        
        if (!Array.isArray(fetchedQuestions) || fetchedQuestions.length === 0) {
          throw new Error(`No questions found for subject: ${subject}`);
        }
        
        // Validate question structure
        const invalidQuestions = fetchedQuestions.filter(q => 
          !q || typeof q !== 'object' || !q.id || !q.question_text || q.correct_answer === undefined
        );
        
        if (invalidQuestions.length > 0) {
          console.error('useExamInitialization: Found invalid questions:', invalidQuestions.length);
          throw new Error('Some questions have invalid data structure');
        }
        
        console.log('useExamInitialization: Questions loaded successfully:', fetchedQuestions.length);
        setQuestions(fetchedQuestions);
        
        const newSessionId = await createTestSession(subject.toUpperCase(), fetchedQuestions.length);
        
        if (!newSessionId || typeof newSessionId !== 'string') {
          throw new Error('Failed to create valid test session');
        }
        
        console.log('useExamInitialization: Session created successfully:', newSessionId);
        setSessionId(newSessionId);
        
        console.log('useExamInitialization: Exam initialization complete');
        
      } catch (error) {
        console.error('useExamInitialization: Error during initialization:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize exam';
        setError(errorMessage);
        
        // Reset flag to allow retry
        initializationAttemptedRef.current = false;
        
        toast({
          title: "Initialization Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Clear any existing timeout
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        
        // Delay navigation to allow user to see the error
        navigationTimeoutRef.current = setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
  }, [subject, user, loading, navigate, toast]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  return {
    questions,
    sessionId,
    isLoading,
    subject,
    error
  };
};
