
import { useExamTimer } from "@/hooks/useExamTimer";
import { useExamAnswerHandler } from "@/hooks/useExamAnswerHandler";
import { useExamNavigationHandler } from "@/hooks/useExamNavigationHandler";
import { useExamFullscreen } from "@/hooks/useExamFullscreen";
import { useExamContainerState } from "@/hooks/useExamContainerState";
import { useExamSubmissionHandler } from "@/hooks/useExamSubmissionHandler";
import ExamLoadingState from "./ExamLoadingState";
import ExamContainerLayout from "./ExamContainerLayout";
import { Question } from "@/services/questionService";

interface ExamContainerProps {
  questions: Question[];
  sessionId: string;
  subject: string;
}

const ExamContainer = ({ questions: initialQuestions, sessionId: initialSessionId, subject }: ExamContainerProps) => {
  const {
    timeLeft,
    setTimeLeft,
    currentQuestion,
    answers,
    markedForReview,
    isFullscreen,
    setIsFullscreen,
    questions,
    sessionId,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    totalQuestions,
    clearAnswer,
    navigateToQuestion,
    nextQuestion,
    previousQuestion,
    toggleMarkForReview,
    updateAnswer,
    isMountedRef
  } = useExamContainerState({
    initialQuestions,
    initialSessionId
  });

  const { formattedTime, stopTimerForSubmission } = useExamTimer({
    timeLeft,
    setTimeLeft,
    isLoading: isLoading || questions.length === 0,
    sessionId,
    onTimeUp: () => {} // Will be set by submission handler
  });

  const {
    handleTimeUp,
    handleSubmit,
    getTimeSpent,
    submissionInProgress
  } = useExamSubmissionHandler({
    sessionId,
    questions,
    answers,
    timeLeft,
    subject,
    currentQuestion,
    isLoading,
    isSubmitting,
    setIsSubmitting,
    isMountedRef,
    stopTimerForSubmission
  });

  // Update timer's onTimeUp to use submission handler
  const { formattedTime: finalFormattedTime } = useExamTimer({
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

  // Loading state
  if (isLoading || questions.length === 0) {
    return <ExamLoadingState subject={subject} />;
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const currentQuestionData = questions[currentQuestion - 1];

  console.log('ExamContainer: Rendering with state:', {
    currentQuestion,
    totalQuestions,
    answeredCount,
    markedCount,
    submissionInProgress,
    timeLeft
  });

  return (
    <ExamContainerLayout
      subject={subject}
      currentQuestion={currentQuestion}
      totalQuestions={totalQuestions}
      timeLeft={timeLeft}
      isFullscreen={isFullscreen}
      onToggleFullscreen={toggleFullscreen}
      onSubmitExam={handleSubmit}
      submissionInProgress={submissionInProgress}
      currentQuestionData={currentQuestionData}
      answers={answers}
      isLoading={isLoading}
      markedForReview={markedForReview}
      onAnswerChange={handleAnswerChange}
      onMarkForReview={toggleMarkForReview}
      onClearResponse={() => clearAnswer(currentQuestion)}
      onNext={handleNext}
      onPrevious={handlePrevious}
      answeredCount={answeredCount}
      markedCount={markedCount}
      onNavigateToQuestion={handleQuestionNavigation}
    />
  );
};

export default ExamContainer;
