
import { useEffect, useRef } from "react";
import { useSimpleExamState } from "@/hooks/useSimpleExamState";
import { useExamTimer } from "@/hooks/useExamTimer";
import { useSimpleExamSubmission } from "@/hooks/useSimpleExamSubmission";
import { useExamTimerManager } from "@/hooks/useExamTimerManager";
import { useExamAnswerHandler } from "@/hooks/useExamAnswerHandler";
import { useExamNavigationHandler } from "@/hooks/useExamNavigationHandler";
import { useExamFullscreen } from "@/hooks/useExamFullscreen";
import ExamHeader from "./ExamHeader";
import ExamSidebar from "./ExamSidebar";
import ExamLoadingState from "./ExamLoadingState";
import ExamMainContent from "./ExamMainContent";
import { Question } from "@/services/questionService";

interface ExamContainerProps {
  questions: Question[];
  sessionId: string;
  subject: string;
}

const ExamContainer = ({ questions: initialQuestions, sessionId: initialSessionId, subject }: ExamContainerProps) => {
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  
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

  const { getTimeSpent, getAllTimeData, cleanupTimers } = useExamTimerManager({
    currentQuestion,
    isLoading,
    questionsLength: questions.length,
    sessionId,
    isSubmitting: false
  });

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

  const { handleAnswerChange } = useExamAnswerHandler({
    sessionId,
    questions,
    updateAnswer,
    getTimeSpent
  });

  const { handleQuestionNavigation, handleNext, handlePrevious } = useExamNavigationHandler({
    currentQuestion,
    totalQuestions,
    isLoading,
    isSubmitting,
    navigateToQuestion,
    nextQuestion,
    previousQuestion
  });

  const { toggleFullscreen } = useExamFullscreen({ setIsFullscreen });

  // Component mount tracking
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize with props - simplified approach
  useEffect(() => {
    if (initialQuestions.length > 0 && initialSessionId && !isInitializedRef.current && isMountedRef.current) {
      console.log('ExamContainer: Initializing with props data');
      setQuestions(initialQuestions);
      setSessionId(initialSessionId);
      setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, [initialQuestions, initialSessionId, setQuestions, setSessionId, setIsLoading]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('ExamContainer: Component unmounting, cleaning up timers');
      cleanupTimers();
      isMountedRef.current = false;
    };
  }, [cleanupTimers]);

  const openCalculator = () => {
    window.open('https://www.tcsion.com/OnlineAssessment/ScientificCalculator/Calculator.html#nogo', '_blank');
  };

  const handleSubmit = async () => {
    console.log('ExamContainer: Submit button clicked');
    
    if (!sessionId || questions.length === 0 || isSubmitting || !isMountedRef.current) {
      console.log('ExamContainer: Invalid state for submission');
      return;
    }

    cleanupTimers();
    
    try {
      await submitExam();
    } catch (error) {
      console.error('ExamContainer: Submission failed:', error);
    }
  };

  // Loading state
  if (isLoading || questions.length === 0) {
    return <ExamLoadingState subject={subject} />;
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
        <ExamMainContent
          currentQuestionData={currentQuestionData}
          currentQuestion={currentQuestion}
          answers={answers}
          totalQuestions={totalQuestions}
          isLoading={isLoading}
          markedForReview={markedForReview}
          onAnswerChange={handleAnswerChange}
          onMarkForReview={toggleMarkForReview}
          onClearResponse={clearAnswer}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />

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
