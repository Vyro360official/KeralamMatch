"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
import { usePathname } from "next/navigation";
import MatrimonialLogoLoader from "@/components/ui/matrimonial-logo-loader";

interface LoadingContextType {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>;
  isLoading: boolean;
  message?: string;
}

const LoadingContext = createContext<LoadingContextType>({
  startLoading: () => {},
  stopLoading: () => {},
  withLoading: async (p) => p,
  isLoading: false,
  message: undefined,
});

export function useLoading() {
  return useContext(LoadingContext);
}

// Global helpers accessible outside of React tree
export function kmStartLoading(message?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("km:start-loading", { detail: { message } })
    );
  }
}

export function kmStopLoading() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("km:stop-loading"));
  }
}

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState<string | undefined>();
  const [showOverlay, setShowOverlay] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();

  // Start loading (increments concurrent count)
  const startLoading = useCallback((message?: string) => {
    setLoadingCount((prev) => {
      if (prev === 0 && message) {
        setActiveMessage(message);
      }
      return prev + 1;
    });
  }, []);

  // Stop loading (decrements concurrent count)
  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Convenience wrapper for async promises
  const withLoading = useCallback(
    async <T,>(promise: Promise<T>, message?: string): Promise<T> => {
      startLoading(message);
      try {
        return await promise;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  // Anti-flicker delay (120ms): Only show overlay if operation exceeds threshold
  useEffect(() => {
    if (loadingCount > 0) {
      if (!showOverlay && !timerRef.current) {
        timerRef.current = setTimeout(() => {
          setShowOverlay(true);
          timerRef.current = null;
        }, 120);
      }
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowOverlay(false);
      setActiveMessage(undefined);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loadingCount, showOverlay]);

  // Route change completion: dismiss any route transition loading
  useEffect(() => {
    // When pathname updates, clear any pending navigation loader
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, [pathname]);

  // Global window event listeners
  useEffect(() => {
    function handleGlobalStart(e: any) {
      startLoading(e.detail?.message);
    }
    function handleGlobalStop() {
      stopLoading();
    }

    window.addEventListener("km:start-loading", handleGlobalStart);
    window.addEventListener("km:stop-loading", handleGlobalStop);

    return () => {
      window.removeEventListener("km:start-loading", handleGlobalStart);
      window.removeEventListener("km:stop-loading", handleGlobalStop);
    };
  }, [startLoading, stopLoading]);

  const value = {
    startLoading,
    stopLoading,
    withLoading,
    isLoading: loadingCount > 0,
    message: activeMessage,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {showOverlay && (
        <MatrimonialLogoLoader
          fullscreen
          text={activeMessage}
        />
      )}
    </LoadingContext.Provider>
  );
}
