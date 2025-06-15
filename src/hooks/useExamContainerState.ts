
import { useEffect, useRef } from "react";
import { useSimpleExamState } from "@/hooks/useSimpleExamState";
import { Question } from "@/services/questionService";

interface UseExamContainerStateProps {
  initialQuestions: Question[];
  initialSessionId: string;
}

export const useExamContainerState = ({
  initialQuestions,
  initialSessionId
}: UseExamContainerStateProps) => {
  const isInitializedRef = useRef(false);
  const isMountedRef = useRef(true);
  
  const examState = useSimpleExamState();

  // Component mount tracking
  useEffect(() => {
    console.log('ExamContainer: Component mounting');
    isMountedRef.current = true;
    return () => {
      console.log('ExamContainer: Component unmounting');
      isMountedRef.current = false;
    };
  }, []);

  // Initialize with props
  useEffect(() => {
    if (initialQuestions.length > 0 && initialSessionId && !isInitializedRef.current && isMountedRef.current) {
      console.log('ExamContainer: Initializing with props data');
      console.log('Questions count:', initialQuestions.length);
      console.log('Session ID:', initialSessionId);
      examState.setQuestions(initialQuestions);
      examState.setSessionId(initialSessionId);
      examState.setIsLoading(false);
      isInitializedRef.current = true;
    }
  }, [initialQuestions, initialSessionId, examState.setQuestions, examState.setSessionId, examState.setIsLoading]);

  return {
    ...examState,
    isMountedRef,
    isInitializedRef
  };
};
