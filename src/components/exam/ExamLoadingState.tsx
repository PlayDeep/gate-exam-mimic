
interface ExamLoadingStateProps {
  subject: string;
}

const ExamLoadingState = ({ subject }: ExamLoadingStateProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-lg">Loading test questions...</p>
        <p className="mt-2 text-sm text-gray-600">Subject: {subject?.toUpperCase()}</p>
      </div>
    </div>
  );
};

export default ExamLoadingState;
