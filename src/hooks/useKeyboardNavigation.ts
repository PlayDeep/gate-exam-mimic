
import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  isLoading: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onMarkForReview: () => void;
  onClearResponse: () => void;
}

export const useKeyboardNavigation = ({
  currentQuestion,
  totalQuestions,
  isLoading,
  isSubmitting,
  onNext,
  onPrevious,
  onMarkForReview,
  onClearResponse
}: UseKeyboardNavigationProps) => {
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't trigger during loading or submission
      if (isLoading || isSubmitting) {
        return;
      }

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if (currentQuestion < totalQuestions) {
            onNext();
          }
          break;
        
        case 'ArrowLeft':
          event.preventDefault();
          if (currentQuestion > 1) {
            onPrevious();
          }
          break;
        
        case 'm':
        case 'M':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            onMarkForReview();
          }
          break;
        
        case 'Delete':
          event.preventDefault();
          onClearResponse();
          break;
        
        case 'F11':
          event.preventDefault();
          // Fullscreen toggle is handled by the parent component
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentQuestion, totalQuestions, isLoading, isSubmitting, onNext, onPrevious, onMarkForReview, onClearResponse]);
};
