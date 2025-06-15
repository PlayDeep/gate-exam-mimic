
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

  // Create a stable props object to prevent re-creation
  const stableHandlerProps = useRef({
    ...containerState,
    subject
  });

  // Only update the ref when actual values change, not on every render
  const propsHash = useMemo(() => {
    return `${containerState.sessionId}-${containerState.questions.length}-${containerState.timeLeft}-${containerState.currentQuestion}-${Object.keys(containerState.answers).length}-${containerState.markedForReview.size}-${containerState.isFullscreen}-${containerState.isLoading}-${containerState.isSubmitting}-${containerState.totalQuestions}-${subject}`;
  }, [
    containerState.sessionId,
    containerState.questions.length,
    containerState.timeLeft,
    containerState.currentQuestion,
    Object.keys(containerState.answers).length,
    containerState.markedForReview.size,
    containerState.isFullscreen,
    containerState.isLoading,
    containerState.isSubmitting,
    containerState.totalQuestions,
    subject
  ]);

  const lastPropsHashRef = useRef('');
  
  useEffect(() => {
    if (lastPropsHashRef.current !== propsHash) {
      stableHandlerProps.current = {
        ...containerState,
        subject
      };
      lastPropsHashRef.current = propsHash;
    }
  }, [propsHash, containerState, subject]);

  const handlers = useExamHandlers(stableHandlerProps.current);

  // Loading state
  if (isLoading || questions.length === 0) {
    return <ExamLoadingState subject={subject} />;
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const currentQuestionData = questions[currentQuestion - 1];

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
