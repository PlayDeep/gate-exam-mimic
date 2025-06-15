
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ResultsData } from "./ResultsCalculator";
import { GradeInfo } from "./ResultsDataProcessor";

interface ResultsActionsProps {
  subject: string;
  results: ResultsData;
  percentage: number;
  gradeInfo: GradeInfo;
  timeSpentFormatted: string;
}

export const useResultsActions = ({ 
  subject, 
  results, 
  percentage, 
  gradeInfo, 
  timeSpentFormatted 
}: ResultsActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleTakeAnother = () => navigate('/');

  return {
    handleDownloadReport,
    handleShareResults,
    handleTakeAnother
  };
};
