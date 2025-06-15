
import { useEffect } from 'react';

interface UseExamFullscreenProps {
  setIsFullscreen: (isFullscreen: boolean) => void;
}

export const useExamFullscreen = ({ setIsFullscreen }: UseExamFullscreenProps) => {
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [setIsFullscreen]);

  return {
    toggleFullscreen
  };
};
