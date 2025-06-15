
interface UseExamNavigationHandlerProps {
  currentQuestion: number;
  totalQuestions: number;
  isLoading: boolean;
  isSubmitting: boolean;
  navigateToQuestion: (questionNum: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
}

export const useExamNavigationHandler = ({
  currentQuestion,
  totalQuestions,
  isLoading,
  isSubmitting,
  navigateToQuestion,
  nextQuestion,
  previousQuestion
}: UseExamNavigationHandlerProps) => {
  
  const handleQuestionNavigation = (newQuestion: number) => {
    if (newQuestion !== currentQuestion && !isLoading && !isSubmitting && newQuestion >= 1 && newQuestion <= totalQuestions) {
      console.log('Navigation: Navigating from question', currentQuestion, 'to', newQuestion);
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

  return {
    handleQuestionNavigation,
    handleNext,
    handlePrevious
  };
};
