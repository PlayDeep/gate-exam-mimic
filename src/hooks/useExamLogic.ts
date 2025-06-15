
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getRandomQuestionsForTest } from "@/services/questionService";
import { createTestSession, updateTestSession, saveUserAnswer } from "@/services/testService";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";

interface UseExamLogicProps {
  subject: string | undefined;
  timeLeft: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  currentQuestion: number;
  setCurrentQuestion: (value: number) => void;
  answers: Record<number, string>;
  setAnswers: (value: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => void;
  markedForReview: Set<number>;
  setMarkedForReview: (value: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  questions: any[];
  setQuestions: (value: any[]) => void;
  sessionId: string;
  setSessionId: (value: string) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  totalQuestions: number;
}

export const useExamLogic = ({
  subject,
  timeLeft,
  setTimeLeft,
  currentQuestion,
  setCurrentQuestion,
  answers,
  setAnswers,
  markedForReview,
  setMarkedForReview,
  isFullscreen,
  setIsFullscreen,
  questions,
  setQuestions,
  sessionId,
  setSessionId,
  isLoading,
  setIsLoading,
  totalQuestions
}: UseExamLogicProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { startTimer, stopTimer, getTimeSpent, getAllTimeData } = useQuestionTimer();

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

  // Start timer for first question when exam loads and handle question changes
  useEffect(() => {
    if (!isLoading && totalQuestions > 0) {
      console.log('Starting timer for question:', currentQuestion);
      startTimer(currentQuestion);
    }
  }, [currentQuestion, isLoading, totalQuestions, startTimer]);

  // Timer effect
  useEffect(() => {
    if (isLoading) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, setTimeLeft]);

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsFullscreen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const handleAnswerChange = async (questionId: number, answer: string) => {
    console.log('=== ANSWER CHANGE START ===');
    console.log('Question ID:', questionId);
    console.log('User Answer:', answer);
    console.log('Answer Type:', typeof answer);
    
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Save answer to database with actual time spent
    if (sessionId && questions[questionId - 1]) {
      const question = questions[questionId - 1];
      console.log('Question Data:', {
        id: question.id,
        correct_answer: question.correct_answer,
        correct_answer_type: typeof question.correct_answer,
        question_type: question.question_type,
        marks: question.marks,
        negative_marks: question.negative_marks
      });
      
      // Normalize both answers for comparison - convert to strings and trim
      const normalizedUserAnswer = String(answer).trim();
      const normalizedCorrectAnswer = String(question.correct_answer).trim();
      
      console.log('Normalized User Answer:', normalizedUserAnswer);
      console.log('Normalized Correct Answer:', normalizedCorrectAnswer);
      
      const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      console.log('Is Correct:', isCorrect);
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks;
      } else if (question.question_type === 'MCQ') {
        // Apply negative marking for MCQ
        marksAwarded = -(question.negative_marks || 0);
      }
      // NAT questions don't have negative marking
      
      console.log('Marks Awarded:', marksAwarded);
      
      // Get actual time spent on this question
      const timeSpent = getTimeSpent(questionId);
      console.log('Time Spent on Question:', timeSpent, 'seconds');
      console.log('=== ANSWER CHANGE END ===');
      
      try {
        await saveUserAnswer(
          sessionId,
          question.id,
          answer,
          isCorrect,
          marksAwarded,
          timeSpent
        );
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  const handleMarkForReview = (questionId: number) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = async () => {
    if (!sessionId) return;
    
    // Stop current timer
    stopTimer();
    
    try {
      const timeSpentMinutes = Math.floor((180 * 60 - timeLeft) / 60);
      const answeredCount = Object.keys(answers).length;
      
      // Calculate score with detailed logging
      let totalScore = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unansweredCount = 0;
      
      console.log('=== FINAL SCORE CALCULATION START ===');
      console.log('Total answers provided:', Object.keys(answers).length);
      console.log('Total questions:', questions.length);
      console.log('Answers object:', answers);
      
      // Process each question
      questions.forEach((question, index) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        console.log(`\n--- Question ${questionNum} ---`);
        console.log('Question ID:', question.id);
        console.log('Question Type:', question.question_type);
        console.log('User Answer:', userAnswer);
        console.log('Correct Answer:', question.correct_answer);
        console.log('Marks:', question.marks);
        console.log('Negative Marks:', question.negative_marks);
        
        if (!userAnswer || userAnswer === '') {
          unansweredCount++;
          console.log('Status: UNANSWERED');
          return;
        }
        
        // Normalize both answers for comparison
        const normalizedUserAnswer = String(userAnswer).trim();
        const normalizedCorrectAnswer = String(question.correct_answer).trim();
        
        console.log('Normalized User Answer:', normalizedUserAnswer);
        console.log('Normalized Correct Answer:', normalizedCorrectAnswer);
        
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        console.log('Is Correct:', isCorrect);
        
        if (isCorrect) {
          correctAnswers++;
          totalScore += question.marks;
          console.log(`Status: CORRECT - Added ${question.marks} marks. Running total: ${totalScore}`);
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
            const penalty = question.negative_marks || 0;
            totalScore -= penalty;
            console.log(`Status: WRONG (MCQ) - Deducted ${penalty} marks. Running total: ${totalScore}`);
          } else {
            console.log(`Status: WRONG (NAT) - No penalty. Running total: ${totalScore}`);
          }
        }
      });
      
      const percentage = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
      
      console.log('\n=== FINAL RESULTS ===');
      console.log('Total Score:', totalScore);
      console.log('Correct Answers:', correctAnswers);
      console.log('Wrong Answers:', wrongAnswers);
      console.log('Unanswered:', unansweredCount);
      console.log('Total Questions:', totalQuestions);
      console.log('Percentage:', percentage);
      console.log('Answered Count:', answeredCount);
      console.log('=== FINAL SCORE CALCULATION END ===');
      
      // Update test session
      await updateTestSession(sessionId, {
        end_time: new Date().toISOString(),
        answered_questions: answeredCount,
        score: totalScore,
        percentage: percentage,
        status: 'completed',
        time_taken: timeSpentMinutes
      });
      
      // Get all time data for results
      const questionTimeData = getAllTimeData();
      console.log('All time data being passed to results:', questionTimeData);
      
      navigate('/results', { 
        state: { 
          sessionId,
          answers, 
          questions, 
          timeSpent: timeSpentMinutes,
          subject,
          score: totalScore,
          percentage: percentage,
          questionTimeData: questionTimeData
        } 
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const openCalculator = () => {
    window.open('https://www.tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html#nogo', '_blank');
  };

  const handleNext = () => {
    console.log('Next clicked. Current question:', currentQuestion, 'Total questions:', totalQuestions);
    if (!isLoading && totalQuestions > 0 && currentQuestion < totalQuestions) {
      const nextQuestion = currentQuestion + 1;
      console.log('Moving to question:', nextQuestion);
      
      setCurrentQuestion(nextQuestion);
    } else {
      console.log('Cannot move to next question. Loading:', isLoading, 'Total:', totalQuestions, 'Current:', currentQuestion);
    }
  };

  const handlePrevious = () => {
    console.log('Previous clicked. Current question:', currentQuestion);
    if (!isLoading && currentQuestion > 1) {
      const prevQuestion = currentQuestion - 1;
      console.log('Moving to question:', prevQuestion);
      
      setCurrentQuestion(prevQuestion);
    } else {
      console.log('Cannot move to previous question. Loading:', isLoading, 'Current:', currentQuestion);
    }
  };

  const navigateToQuestion = (questionNum: number) => {
    console.log('Question grid clicked:', questionNum);
    setCurrentQuestion(questionNum);
  };

  return {
    handleAnswerChange,
    handleMarkForReview,
    handleSubmitExam,
    toggleFullscreen,
    openCalculator,
    handleNext,
    handlePrevious,
    navigateToQuestion,
    getTimeSpent
  };
};
