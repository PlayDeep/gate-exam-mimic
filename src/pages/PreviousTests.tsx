
import PreviousTestsHeader from "@/components/previous-tests/PreviousTestsHeader";
import TestSummaryCards from "@/components/previous-tests/TestSummaryCards";
import TestHistoryTable from "@/components/previous-tests/TestHistoryTable";
import { usePreviousTests } from "@/hooks/usePreviousTests";

const PreviousTests = () => {
  const { tests, isLoading, handleViewDetails, handleDeleteTest } = usePreviousTests();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading test history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PreviousTestsHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TestSummaryCards tests={tests} />
        <TestHistoryTable 
          tests={tests}
          onViewDetails={handleViewDetails}
          onDeleteTest={handleDeleteTest}
        />
      </div>
    </div>
  );
};

export default PreviousTests;
