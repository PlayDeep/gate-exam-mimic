
import { Trophy, RotateCcw, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsHeaderProps {
  subject: string;
  onTakeAnother: () => void;
  onDownloadReport: () => void;
  onShareResults: () => void;
}

const ResultsHeader = ({ subject, onTakeAnother, onDownloadReport, onShareResults }: ResultsHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
              <p className="text-sm text-gray-500">GATE {subject} Mock Test</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onTakeAnother}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Another Test
            </Button>
            <Button variant="outline" onClick={onDownloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" onClick={onShareResults}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ResultsHeader;
