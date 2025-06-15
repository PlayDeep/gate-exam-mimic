
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getRandomQuestionsForTest } from "@/services/questionService";
import { createTestSession } from "@/services/testService";
import { useSimpleExamState } from "@/hooks/useSimpleExamState";
import { useExamTimer } from "@/hooks/useExamTimer";
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

  const { submitExam, isSubmitting } = useSimpleExamSubmission({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject
  });

  const { formattedTime } = useExamTimer({
    timeLeft,
    setTimeLeft,
    isLoading,
    sessionId,
    onTimeUp: submitExam
  });

  // Authentication check
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to take the test.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);

  // Initialize exam
  useEffect(() => {
    const initializeExam = async () => {
      if (!subject || !user) return;
      
      try {
        setIsLoading(true);
        
        const fetchedQuestions = await getRandomQuestionsForTest(subject.toUpperCase(), 65);
        
        if (fetchedQuestions.length === 0) {
          toast({
            title: "No Questions Available",
            description: "No questions found for this subject.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setQuestions(fetchedQuestions);
        
        const newSessionId = await createTestSession(subject.toUpperCase(), fetchedQuestions.length);
        setSessionId(newSessionId);
        
      } catch (error) {
        console.error('Error initializing exam:', error);
        toast({
          title: "Error",
          description: "Failed to load test questions.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
  }, [subject, user, navigate, toast, setIsLoading, setQuestions, setSessionId]);

  // Handle answer change
  const handleAnswerChange = async (questionId: number, answer: string) => {
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
          30 // Simple time tracking
        );
      } catch (error) {
        console.error('Error saving answer:', error);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-4">No questions found for this subject.</p>
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
        onSubmitExam={submitExam}
        isSubmitting={isSubmitting}
      />

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 flex flex-col">
          {currentQuestionData && (
            <QuestionContent
              question={currentQuestionData}
              currentQuestion={currentQuestion}
              timeSpent={0}
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
            onNext={nextQuestion}
            onPrevious={previousQuestion}
          />
        </div>

        <ExamSidebar
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          markedCount={markedCount}
          currentQuestion={currentQuestion}
          answers={answers}
          markedForReview={markedForReview}
          onNavigateToQuestion={navigateToQuestion}
        />
      </div>
    </div>
  );
};

export default Exam;
