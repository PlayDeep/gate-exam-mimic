
import { useParams } from "react-router-dom";
import { useExamState } from "@/hooks/useExamState";
import { useExamLogic } from "@/hooks/useExamLogic";
import ExamHeader from "@/components/exam/ExamHeader";
import ExamNavigation from "@/components/exam/ExamNavigation";
import ExamSidebar from "@/components/exam/ExamSidebar";
import QuestionContent from "@/components/exam/QuestionContent";
import { Button } from "@/components/ui/button";

const Exam = () => {
  const { subject } = useParams();
  
  const {
    timeLeft,
    setTimeLeft,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    markedForReview,
    setMarkedForReview,
    isFullscreen,
    setIsFullscreen,
    questions,
    setQuestions,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    totalQuestions
  } = useExamState();

  const {
    handleAnswerChange,
    handleMarkForReview,
    handleSubmitExam,
    toggleFullscreen,
    openCalculator,
    handleNext,
    handlePrevious,
    navigateToQuestion,
    getTimeSpent
  } = useExamLogic({
    subject,
    timeLeft,
    setTimeLeft,
    currentQuestion,
    setCurrentQuestion,
    answers,
    setAnswers,
    markedForReview,
    setMarkedForReview,
    isFullscreen,
    setIsFullscreen,
    questions,
    setQuestions,
    sessionId,
    setSessionId,
    isLoading,
    setIsLoading,
    totalQuestions
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <p className="mb-4">No questions found for this subject.</p>
          <Button onClick={() => window.location.href = '/'}>Go Back</Button>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const currentQuestionData = questions[currentQuestion - 1];

  console.log('Render - Current question:', currentQuestion, 'Total questions:', totalQuestions, 'Questions length:', questions.length);

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
        onSubmitExam={handleSubmitExam}
      />

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 flex flex-col">
          {currentQuestionData && (
            <QuestionContent
              question={currentQuestionData}
              currentQuestion={currentQuestion}
              timeSpent={getTimeSpent(currentQuestion)}
              answer={answers[currentQuestion] || ''}
              onAnswerChange={handleAnswerChange}
            />
          )}

          <ExamNavigation
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            isLoading={isLoading}
            markedForReview={markedForReview}
            onMarkForReview={handleMarkForReview}
            onClearResponse={() => {
              setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[currentQuestion];
                return newAnswers;
              });
            }}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>

        <ExamSidebar
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          markedCount={markedCount}
          currentQuestion={currentQuestion}
          answers={answers}
          markedForReview={markedForReview}
          onNavigateToQuestion={navigateToQuestion}
        />
      </div>
    </div>
  );
};

export default Exam;
