
import { useNavigate } from "react-router-dom";
import { useResultsData } from "@/hooks/useResultsData";
import ResultsContainer from "@/components/results/ResultsContainer";

const Results = () => {
  const navigate = useNavigate();
  const { resultsData, isLoading, error } = useResultsData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !resultsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Unable to Load Results</h2>
          <p className="text-gray-600 mb-4">{error || 'No results data available'}</p>
          <button 
            onClick={() => navigate('/')} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <ResultsContainer resultsData={resultsData} />;
};

export default Results;
