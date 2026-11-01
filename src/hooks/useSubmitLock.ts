import { useState, useCallback } from "react";

export const useSubmitLock = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lock = useCallback(async (fn: () => Promise<void>) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await fn();
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return [isSubmitting, lock] as const;
};