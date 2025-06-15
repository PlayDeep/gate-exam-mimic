
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ResultsHeader from "@/components/results/ResultsHeader";
import ScoreOverview from "@/components/results/ScoreOverview";
import QuestionAnalysis from "@/components/results/QuestionAnalysis";
import SubjectAnalysis from "@/components/results/SubjectAnalysis";
import AnswerReview from "@/components/results/AnswerReview";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { answers, questions, timeSpent, subject, score: passedScore, percentage: passedPercentage } = location.state || {};

  if (!answers || !questions) {
    navigate('/');
    return null;
  }

  const usePassedScore = passedScore !== undefined && passedPercentage !== undefined;

  const calculateResults = () => {
    if (usePassedScore) {
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unanswered = 0;
      const subjectWiseAnalysis: Record<string, any> = {};

      questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
        const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            score: 0
          };
        }
        
        subjectWiseAnalysis[question.subject].total++;

        if (!userAnswer) {
          unanswered++;
          subjectWiseAnalysis[question.subject].unanswered++;
        } else if (isCorrect) {
          correctAnswers++;
          subjectWiseAnalysis[question.subject].correct++;
          subjectWiseAnalysis[question.subject].score += question.marks;
        } else {
          wrongAnswers++;
          subjectWiseAnalysis[question.subject].wrong++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (question.marks === 1 ? 1/3 : 2/3);
            subjectWiseAnalysis[question.subject].score -= negativeMarks;
          }
        }
      });

      return {
        score: passedScore,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions: questions.length,
        maxScore: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        subjectWiseAnalysis
      };
    } else {
      let score = 0;
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unanswered = 0;
      const subjectWiseAnalysis: Record<string, any> = {};

      questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;
        const userAnswer = answers[questionNum];
        
        const normalizedUserAnswer = userAnswer ? String(userAnswer).trim() : '';
        const normalizedCorrectAnswer = String(question.correct_answer || question.correctAnswer).trim();
        const isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (!subjectWiseAnalysis[question.subject]) {
          subjectWiseAnalysis[question.subject] = {
            total: 0,
            correct: 0,
            wrong: 0,
            unanswered: 0,
            score: 0
          };
        }
        
        subjectWiseAnalysis[question.subject].total++;

        if (!userAnswer) {
          unanswered++;
          subjectWiseAnalysis[question.subject].unanswered++;
        } else if (isCorrect) {
          correctAnswers++;
          score += question.marks;
          subjectWiseAnalysis[question.subject].correct++;
          subjectWiseAnalysis[question.subject].score += question.marks;
        } else {
          wrongAnswers++;
          if (question.question_type === 'MCQ') {
            const negativeMarks = question.negative_marks || (question.marks === 1 ? 1/3 : 2/3);
            score -= negativeMarks;
            subjectWiseAnalysis[question.subject].score -= negativeMarks;
          }
          subjectWiseAnalysis[question.subject].wrong++;
        }
      });

      return {
        score: Math.round(score * 100) / 100,
        correctAnswers,
        wrongAnswers,
        unanswered,
        totalQuestions: questions.length,
        maxScore: questions.reduce((sum: number, q: any) => sum + q.marks, 0),
        subjectWiseAnalysis
      };
    }
  };

  const results = calculateResults();
  const percentage = usePassedScore ? passedPercentage : Math.round((results.score / results.maxScore) * 100);
  
  const getGrade = (percentage: number) => {
    if (percentage >= 85) return { grade: 'A+', color: 'text-green-600', description: 'Excellent' };
    if (percentage >= 75) return { grade: 'A', color: 'text-green-500', description: 'Very Good' };
    if (percentage >= 65) return { grade: 'B+', color: 'text-blue-500', description: 'Good' };
    if (percentage >= 55) return { grade: 'B', color: 'text-blue-400', description: 'Above Average' };
    if (percentage >= 45) return { grade: 'C', color: 'text-yellow-500', description: 'Average' };
    return { grade: 'F', color: 'text-red-500', description: 'Below Average' };
  };

  const gradeInfo = getGrade(percentage);
  const timeSpentFormatted = `${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s`;

  const handleDownloadReport = () => {
    const reportData = {
      subject,
      score: results.score,
      maxScore: results.maxScore,
      percentage,
      grade: gradeInfo.grade,
      correctAnswers: results.correctAnswers,
      wrongAnswers: results.wrongAnswers,
      unanswered: results.unanswered,
      timeSpent: timeSpentFormatted,
      date: new Date().toLocaleDateString(),
      subjectWiseAnalysis: results.subjectWiseAnalysis
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GATE_${subject}_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: "Your test report has been downloaded successfully.",
    });
  };

  const handleShareResults = async () => {
    const shareText = `🎓 GATE ${subject} Mock Test Results\n\n📊 Score: ${results.score}/${results.maxScore} (${percentage}%)\n🏆 Grade: ${gradeInfo.grade}\n✅ Correct: ${results.correctAnswers}\n❌ Wrong: ${results.wrongAnswers}\n⏱️ Time: ${timeSpentFormatted}\n\nTake your GATE preparation to the next level!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GATE Test Results',
          text: shareText,
        });
        toast({
          title: "Results Shared",
          description: "Your test results have been shared successfully.",
        });
      } catch (error) {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Results Copied",
          description: "Your test results have been copied to clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Results Copied",
        description: "Your test results have been copied to clipboard.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ResultsHeader
        subject={subject}
        onTakeAnother={() => navigate('/')}
        onDownloadReport={handleDownloadReport}
        onShareResults={handleShareResults}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ScoreOverview
          score={results.score}
          maxScore={results.maxScore}
          percentage={percentage}
          gradeInfo={gradeInfo}
          timeSpentFormatted={timeSpentFormatted}
          totalTimeSpent={timeSpent}
          totalQuestions={results.totalQuestions}
          answers={answers}
        />

        <QuestionAnalysis
          correctAnswers={results.correctAnswers}
          wrongAnswers={results.wrongAnswers}
          unanswered={results.unanswered}
          totalQuestions={results.totalQuestions}
        />

        <SubjectAnalysis subjectWiseAnalysis={results.subjectWiseAnalysis} />

        <AnswerReview questions={questions} answers={answers} />

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate('/')} className="mr-4">
            Take Another Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
