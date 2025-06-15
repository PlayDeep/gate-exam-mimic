
import { useRef, useEffect } from 'react';

export const useSubmissionLock = () => {
  const hasSubmittedRef = useRef(false);
  const submissionLockRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const acquireLock = () => {
    if (submissionLockRef.current || hasSubmittedRef.current) {
      return false;
    }
    submissionLockRef.current = true;
    hasSubmittedRef.current = true;
    return true;
  };

  const releaseLock = () => {
    hasSubmittedRef.current = false;
    submissionLockRef.current = false;
  };

  const isLocked = () => submissionLockRef.current;
  const hasSubmitted = () => hasSubmittedRef.current;
  const isMounted = () => isMountedRef.current;

  return {
    acquireLock,
    releaseLock,
    isLocked,
    hasSubmitted,
    isMounted
  };
};
