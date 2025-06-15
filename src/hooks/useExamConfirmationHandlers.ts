
import { useConfirmationDialogs } from "@/hooks/useConfirmationDialogs";

interface UseExamConfirmationHandlersProps {
  currentQuestion: number;
  clearAnswer: (questionNum: number) => void;
  toggleMarkForReview: (questionNum: number) => void;
  handleSubmit: () => void;
}

export const useExamConfirmationHandlers = ({
  currentQuestion,
  clearAnswer,
  toggleMarkForReview,
  handleSubmit
}: UseExamConfirmationHandlersProps) => {
  const { dialogs, showDialog, hideDialog } = useConfirmationDialogs();

  const handleMarkForReview = () => {
    toggleMarkForReview(currentQuestion);
  };

  const handleClearResponse = () => {
    showDialog('clearAnswer');
  };

  const handleSubmitExam = () => {
    console.log('ExamContainer: Submit exam button clicked');
    showDialog('submitExam');
  };

  const confirmClearAnswer = () => {
    clearAnswer(currentQuestion);
    hideDialog('clearAnswer');
  };

  const confirmSubmitExam = () => {
    console.log('ExamContainer: Confirmed submit exam');
    hideDialog('submitExam');
    handleSubmit();
  };

  return {
    dialogs,
    hideDialog,
    handleMarkForReview,
    handleClearResponse,
    handleSubmitExam,
    confirmClearAnswer,
    confirmSubmitExam
  };
};
