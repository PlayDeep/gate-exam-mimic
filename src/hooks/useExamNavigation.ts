
interface UseExamNavigationProps {
  currentQuestion: number;
  setCurrentQuestion: (value: number) => void;
  totalQuestions: number;
  isLoading: boolean;
}

export const useExamNavigation = ({
  currentQuestion,
  setCurrentQuestion,
  totalQuestions,
  isLoading
}: UseExamNavigationProps) => {
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
    handleNext,
    handlePrevious,
    navigateToQuestion
  };
};
