
import ConfirmationDialog from "./ConfirmationDialog";

interface ExamConfirmationDialogsProps {
  dialogs: {
    clearAnswer: boolean;
    submitExam: boolean;
  };
  onHideDialog: (type: 'clearAnswer' | 'submitExam') => void;
  onConfirmClearAnswer: () => void;
  onConfirmSubmitExam: () => void;
  answeredCount: number;
  totalQuestions: number;
}

const ExamConfirmationDialogs = ({
  dialogs,
  onHideDialog,
  onConfirmClearAnswer,
  onConfirmSubmitExam,
  answeredCount,
  totalQuestions
}: ExamConfirmationDialogsProps) => {
  return (
    <>
      <ConfirmationDialog
        isOpen={dialogs.clearAnswer}
        onClose={() => onHideDialog('clearAnswer')}
        onConfirm={onConfirmClearAnswer}
        title="Clear Answer"
        description="Are you sure you want to clear your answer for this question?"
        confirmText="Clear"
        cancelText="Cancel"
      />

      <ConfirmationDialog
        isOpen={dialogs.submitExam}
        onClose={() => onHideDialog('submitExam')}
        onConfirm={onConfirmSubmitExam}
        title="Submit Exam"
        description={`Are you sure you want to submit your exam? You have answered ${answeredCount} out of ${totalQuestions} questions. This action cannot be undone.`}
        confirmText="Submit Exam"
        cancelText="Continue Exam"
        variant="destructive"
      />
    </>
  );
};

export default ExamConfirmationDialogs;
