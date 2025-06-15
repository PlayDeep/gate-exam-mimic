
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
  const submissionHandledRef = useRef(false);
  
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
    isSubmitting,
    setIsSubmitting,
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
    isSubmitting
  });

  const { submitExam, isSubmitting: submissionInProgress } = useSimpleExamSubmission({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    questionTimeData: getAllTimeData()
  });

  // Sync submission states
  useEffect(() => {
    setIsSubmitting(submissionInProgress);
  }, [submissionInProgress, setIsSubmitting]);

  const handleTimeUp = useCallback(async () => {
    console.log('ExamContainer: Time up triggered');
    
    if (!isMountedRef.current || submissionHandledRef.current) {
      console.log('ExamContainer: Already handled or unmounted');
      return;
    }
    
    submissionHandledRef.current = true;
    
    try {
      await submitExam();
    } catch (error) {
      console.error('ExamContainer: Time up submission failed:', error);
      submissionHandledRef.current = false;
    }
  }, [submitExam]);

  const { formattedTime } = useExamTimer({
    timeLeft,
    setTimeLeft,
    isLoading: isLoading || questions.length === 0,
    sessionId,
    onTimeUp: handleTimeUp
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
    isSubmitting: submissionInProgress,
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

  // Initialize with props
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
    
    // Enhanced validation
    if (!isMountedRef.current) {
      console.log('ExamContainer: Component not mounted');
      return;
    }

    if (!sessionId || questions.length === 0) {
      console.log('ExamContainer: Invalid state - sessionId:', !!sessionId, 'questions:', questions.length);
      return;
    }

    if (submissionInProgress || submissionHandledRef.current) {
      console.log('ExamContainer: Submission already in progress or handled');
      return;
    }

    submissionHandledRef.current = true;

    // Cleanup timers before submission
    cleanupTimers();
    
    try {
      await submitExam();
    } catch (error) {
      console.error('ExamContainer: Submission failed:', error);
      submissionHandledRef.current = false;
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
        isSubmitting={submissionInProgress}
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
