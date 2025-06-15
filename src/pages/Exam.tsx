
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRandomQuestionsForTest } from "@/services/questionService";
import { createTestSession } from "@/services/testService";
import { useSimpleExamState } from "@/hooks/useSimpleExamState";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";
import { useSimpleExamSubmission } from "@/hooks/useSimpleExamSubmission";
import { saveUserAnswer } from "@/services/testService";
import ExamHeader from "@/components/exam/ExamHeader";
import ExamNavigation from "@/components/exam/ExamNavigation";
import ExamSidebar from "@/components/exam/ExamSidebar";
import QuestionContent from "@/components/exam/QuestionContent";
import { Button } from "@/components/ui/button";

const Exam = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const {
    timeLeft,
    setTimeLeft,
    currentQuestion,
    answers,
    markedForReview,
    isFullscreen,
    setIsFullscreen,
    questions,
    setQuestions,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    totalQuestions,
    clearAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    toggleMarkForReview,
    updateAnswer
  } = useSimpleExamState();

  const { 
    startTimer, 
    stopTimer, 
    getTimeSpent, 
    getAllTimeData 
  } = useQuestionTimer();

  const { submitExam, isSubmitting } = useSimpleExamSubmission({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    questionTimeData: getAllTimeData()
  });

  const { formattedTime } = useExamTimer({
    timeLeft,
    setTimeLeft,
    isLoading: isLoading || questions.length === 0,
    sessionId,
    onTimeUp: submitExam
  });

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to home');
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
      // Prevent reinitialization
      if (!subject || !user || sessionId || isLoading === false) {
        console.log('Skipping initialization:', { subject, user: !!user, sessionId, isLoading });
        return;
      }
      
      try {
        console.log('=== INITIALIZING EXAM ===');
        console.log('Subject:', subject);
        setIsLoading(true);
        
        const fetchedQuestions = await getRandomQuestionsForTest(subject.toUpperCase(), 65);
        
        if (fetchedQuestions.length === 0) {
          console.error('No questions found for subject:', subject);
          toast({
            title: "No Questions Available",
            description: "No questions found for this subject.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        console.log('Questions loaded successfully:', fetchedQuestions.length);
        setQuestions(fetchedQuestions);
        
        const newSessionId = await createTestSession(subject.toUpperCase(), fetchedQuestions.length);
        console.log('Session created successfully:', newSessionId);
        setSessionId(newSessionId);
        
        console.log('=== EXAM INITIALIZATION COMPLETE ===');
        
      } catch (error) {
        console.error('=== EXAM INITIALIZATION ERROR ===');
        console.error('Error details:', error);
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
  }, [subject, user]); // Minimal dependencies to prevent re-runs

  // Start question timer only after exam is fully initialized
  useEffect(() => {
    if (!isLoading && questions.length > 0 && sessionId && currentQuestion) {
      console.log('Starting timer for question:', currentQuestion);
      startTimer(currentQuestion);
    }
    
    return () => {
      stopTimer();
    };
  }, [isLoading, questions.length, sessionId, currentQuestion]);

  // Handle question navigation with timer
  const handleQuestionNavigation = (newQuestion: number) => {
    if (newQuestion !== currentQuestion && !isLoading) {
      console.log('Navigating from question', currentQuestion, 'to', newQuestion);
      stopTimer();
      navigateToQuestion(newQuestion);
      startTimer(newQuestion);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions && !isLoading) {
      stopTimer();
      nextQuestion();
      startTimer(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1 && !isLoading) {
      stopTimer();
      previousQuestion();
      startTimer(currentQuestion - 1);
    }
  };

  // Handle answer change with improved error handling
  const handleAnswerChange = async (questionId: number, answer: string) => {
    console.log(`Answer changed for Q${questionId}:`, answer);
    updateAnswer(questionId, answer);
    
    if (sessionId && questions[questionId - 1]) {
      const question = questions[questionId - 1];
      const isCorrect = String(answer).trim() === String(question.correct_answer).trim();
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks;
      } else if (question.question_type === 'MCQ') {
        marksAwarded = -(question.negative_marks || 0);
      }
      
      try {
        await saveUserAnswer(
          sessionId,
          question.id,
          answer,
          isCorrect,
          marksAwarded,
          getTimeSpent(questionId)
        );
        console.log(`Answer saved successfully for Q${questionId}`);
      } catch (error) {
        console.error('Error saving answer for Q${questionId}:', error);
        // Don't show error to user for answer saving failures
        // The exam can continue and final submission will handle the score
      }
    }
  };

  // Fullscreen handlers
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsFullscreen]);

  const openCalculator = () => {
    window.open('https://www.tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html#nogo', '_blank');
  };

  // Handle submit with comprehensive validation
  const handleSubmit = async () => {
    console.log('=== SUBMIT BUTTON CLICKED ===');
    console.log('Current state:', {
      sessionId,
      questionsLength: questions.length,
      answersCount: Object.keys(answers).length,
      isSubmitting,
      timeLeft
    });
    
    // Validate session state
    if (!sessionId) {
      console.error('No session ID available for submission');
      toast({
        title: "Submission Error",
        description: "No active session found. Please restart the exam.",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      console.error('No questions available for submission');
      toast({
        title: "Submission Error",
        description: "No questions loaded. Please restart the exam.",
        variant: "destructive",
      });
      return;
    }

    if (isSubmitting) {
      console.log('Submission already in progress, ignoring duplicate click');
      return;
    }

    // Stop the current question timer before submission
    stopTimer();
    
    console.log('All validations passed, proceeding with submission...');
    await submitExam();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test questions...</p>
          <p className="mt-2 text-sm text-gray-600">Subject: {subject?.toUpperCase()}</p>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-4">No questions found for {subject?.toUpperCase()} subject.</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const currentQuestionData = questions[currentQuestion - 1];

  return (
    <div className="min-h-screen bg-gray-100">
      <ExamHeader
        subject={subject || ''}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenCalculator={openCalculator}
        onSubmitExam={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 flex flex-col">
          {currentQuestionData && (
            <QuestionContent
              question={currentQuestionData}
              currentQuestion={currentQuestion}
              answer={answers[currentQuestion] || ''}
              onAnswerChange={handleAnswerChange}
            />
          )}

          <ExamNavigation
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            isLoading={isLoading}
            markedForReview={markedForReview}
            onMarkForReview={toggleMarkForReview}
            onClearResponse={clearAnswer}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>

        <ExamSidebar
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          markedCount={markedCount}
          currentQuestion={currentQuestion}
          answers={answers}
          markedForReview={markedForReview}
          onNavigateToQuestion={handleQuestionNavigation}
        />
      </div>
    </div>
  );
};

export default Exam;
