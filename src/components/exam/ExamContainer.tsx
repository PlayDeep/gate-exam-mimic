
import { useMemo, useRef, useEffect } from "react";
import { useExamContainerState } from "@/hooks/useExamContainerState";
import { useExamHandlers } from "@/hooks/useExamHandlers";
import ExamLoadingState from "./ExamLoadingState";
import ExamContainerLayout from "./ExamContainerLayout";
import ExamConfirmationDialogs from "./ExamConfirmationDialogs";
import { Question } from "@/services/questionService";

interface ExamContainerProps {
  questions: Question[];
  sessionId: string;
  subject: string;
}

const ExamContainer = ({ questions: initialQuestions, sessionId: initialSessionId, subject }: ExamContainerProps) => {
  const containerState = useExamContainerState({
    initialQuestions,
    initialSessionId
  });

  const {
    timeLeft,
    currentQuestion,
    answers,
    markedForReview,
    isFullscreen,
    questions,
    sessionId,
    isLoading,
    totalQuestions,
    isMountedRef
  } = containerState;

  // Create stable props using useRef to prevent re-creation
  const stableStateRef = useRef(containerState);
  const stableSubjectRef = useRef(subject);
  
  // Only update refs when essential values change
  useEffect(() => {
    stableStateRef.current = containerState;
    stableSubjectRef.current = subject;
  });

  // Create ultra-stable handler props
  const handlerProps = useMemo(() => ({
    ...stableStateRef.current,
    subject: stableSubjectRef.current
  }), [
    // Only include values that actually affect handlers
    sessionId,
    questions.length,
    currentQuestion,
    Object.keys(answers).length,
    markedForReview.size,
    isLoading,
    containerState.isSubmitting
  ]);

  const handlers = useExamHandlers(handlerProps);

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
    submissionInProgress: handlers.submissionInProgress,
    timeLeft,
    sessionId
  });

  return (
    <>
      <ExamContainerLayout
        subject={subject}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        timeLeft={timeLeft}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handlers.toggleFullscreen}
        onSubmitExam={handlers.handleSubmitExam}
        submissionInProgress={handlers.submissionInProgress}
        currentQuestionData={currentQuestionData}
        answers={answers}
        isLoading={isLoading}
        markedForReview={markedForReview}
        onAnswerChange={handlers.handleAnswerChange}
        onMarkForReview={handlers.handleMarkForReview}
        onClearResponse={handlers.handleClearResponse}
        onNext={handlers.handleNext}
        onPrevious={handlers.handlePrevious}
        answeredCount={answeredCount}
        markedCount={markedCount}
        onNavigateToQuestion={handlers.handleQuestionNavigation}
      />

      <ExamConfirmationDialogs
        dialogs={handlers.dialogs}
        onHideDialog={handlers.hideDialog}
        onConfirmClearAnswer={handlers.confirmClearAnswer}
        onConfirmSubmitExam={handlers.confirmSubmitExam}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />
    </>
  );
};

export default ExamContainer;
