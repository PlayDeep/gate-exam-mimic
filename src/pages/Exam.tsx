
import { useExamInitialization } from "@/hooks/useExamInitialization";
import ExamContainer from "@/components/exam/ExamContainer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Exam = () => {
  const navigate = useNavigate();
  const { questions, sessionId, isLoading, subject } = useExamInitialization();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test questions...</p>
          <p className="mt-2 text-sm text-gray-600">Subject: {subject?.toUpperCase()}</p>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-4">No questions found for {subject?.toUpperCase()} subject.</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  // No session state
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Error</h2>
          <p className="mb-4">Failed to create exam session.</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <ExamContainer
      questions={questions}
      sessionId={sessionId}
      subject={subject || ''}
    />
  );
};

export default Exam;
