
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSimpleExamState } from "@/hooks/useSimpleExamState";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useQuestionTimer } from "@/hooks/useQuestionTimer";
import { useSimpleExamSubmission } from "@/hooks/useSimpleExamSubmission";
import { saveUserAnswer } from "@/services/testService";
import ExamHeader from "./ExamHeader";
import ExamNavigation from "./ExamNavigation";
import ExamSidebar from "./ExamSidebar";
import QuestionContent from "./QuestionContent";
import { Question } from "@/services/questionService";

interface ExamContainerProps {
  questions: Question[];
  sessionId: string;
  subject: string;
}

const ExamContainer = ({ questions: initialQuestions, sessionId: initialSessionId, subject }: ExamContainerProps) => {
  const navigate = useNavigate();
  
  // Use refs to prevent unnecessary re-initializations
  const isInitializedRef = useRef(false);
  const currentQuestionRef = useRef(1);
  const timerCleanupRef = useRef<(() => void) | null>(null);
  
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

  // Initialize with props - only once to prevent loops
  useEffect(() => {
    if (initialQuestions.length > 0 && initialSessionId && !isInitializedRef.current) {
      console.log('ExamContainer: Initializing with props data');
      setQuestions(initialQuestions);
      setSessionId(initialSessionId);
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, [initialQuestions, initialSessionId, setQuestions, setSessionId, setIsLoading]);

  // Improved timer management - prevent overlapping timers
  useEffect(() => {
    if (!isLoading && questions.length > 0 && sessionId && !isSubmitting) {
      // Only manage timer if question actually changed
      if (currentQuestionRef.current !== currentQuestion) {
        console.log('ExamContainer: Question changed from', currentQuestionRef.current, 'to', currentQuestion);
        
        // Clean up previous timer
        if (timerCleanupRef.current) {
          timerCleanupRef.current();
        }
        
        // Stop any existing timer
        stopTimer();
        
        // Start new timer
        startTimer(currentQuestion);
        currentQuestionRef.current = currentQuestion;
        
        // Store cleanup function
        timerCleanupRef.current = () => {
          stopTimer();
          timerCleanupRef.current = null;
        };
      }
    }
    
    // Cleanup function
    return () => {
      if (timerCleanupRef.current) {
        timerCleanupRef.current();
      }
    };
  }, [currentQuestion, isLoading, questions.length, sessionId, isSubmitting, startTimer, stopTimer]);

  // Enhanced navigation handlers with better state management
  const handleQuestionNavigation = (newQuestion: number) => {
    if (newQuestion !== currentQuestion && !isLoading && !isSubmitting && newQuestion >= 1 && newQuestion <= totalQuestions) {
      console.log('ExamContainer: Navigating from question', currentQuestion, 'to', newQuestion);
      navigateToQuestion(newQuestion);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions && !isLoading && !isSubmitting) {
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1 && !isLoading && !isSubmitting) {
      previousQuestion();
    }
  };

  // Enhanced answer saving with better error handling
  const handleAnswerChange = async (questionId: number, answer: string) => {
    console.log(`ExamContainer: Answer changed for Q${questionId}:`, answer);
    updateAnswer(questionId, answer);
    
    if (sessionId && questions[questionId - 1]) {
      const question = questions[questionId - 1];
      const normalizedAnswer = String(answer).trim();
      const normalizedCorrectAnswer = String(question.correct_answer || '').trim();
      const isCorrect = normalizedAnswer === normalizedCorrectAnswer;
      
      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = question.marks || 1;
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
        console.log(`ExamContainer: Answer saved successfully for Q${questionId}`);
      } catch (error) {
        console.error(`ExamContainer: Error saving answer for Q${questionId}:`, error);
        // Don't throw error to user, just log it - exam can continue
      }
    }
  };

  // Fullscreen management
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
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

  // Enhanced submit handler
  const handleSubmit = async () => {
    console.log('ExamContainer: Submit button clicked');
    
    if (!sessionId || questions.length === 0 || isSubmitting) {
      console.log('ExamContainer: Invalid state for submission:', { sessionId: !!sessionId, questionsLength: questions.length, isSubmitting });
      return;
    }

    // Clean up timer before submission
    if (timerCleanupRef.current) {
      timerCleanupRef.current();
    }
    
    console.log('ExamContainer: Proceeding with submission...');
    try {
      await submitExam();
    } catch (error) {
      console.error('ExamContainer: Submission failed:', error);
      // Error handling is done in the submission hook
    }
  };

  // Loading state
  if (isLoading || questions.length === 0) {
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

export default ExamContainer;
