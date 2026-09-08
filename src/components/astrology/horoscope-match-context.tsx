"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { HoroscopeMatchResultDTO } from "@/modules/astrology/astrology.dto";

export interface HoroscopeTargetInput {
  id: string;
  name?: string;
  avatar?: string | null;
}

interface HoroscopeMatchContextType {
  isOpen: boolean;
  targetProfile: HoroscopeTargetInput | null;
  loading: boolean;
  error: string | null;
  errorDetails: any | null;
  result: HoroscopeMatchResultDTO | null;
  fullReportOpen: boolean;
  openHoroscopeMatch: (target: HoroscopeTargetInput) => void;
  closeHoroscopeMatch: () => void;
  openFullReport: () => void;
  closeFullReport: () => void;
}

const HoroscopeMatchContext = createContext<HoroscopeMatchContextType | undefined>(undefined);

export function HoroscopeMatchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetProfile, setTargetProfile] = useState<HoroscopeTargetInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [result, setResult] = useState<HoroscopeMatchResultDTO | null>(null);
  const [fullReportOpen, setFullReportOpen] = useState(false);

  // In-memory session cache for calculated matches to avoid duplicate recalculations
  const [cache, setCache] = useState<Record<string, HoroscopeMatchResultDTO>>({});

  const openHoroscopeMatch = useCallback(
    async (target: HoroscopeTargetInput) => {
      setTargetProfile(target);
      setIsOpen(true);
      setError(null);
      setErrorDetails(null);
      setFullReportOpen(false);

      // Check cache first
      if (cache[target.id]) {
        setResult(cache[target.id]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setResult(null);

      try {
        const response = await fetch("/api/astrology/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            targetProfileId: target.id,
            includeReportHtml: true,
          }),
        });

        const data = await response.json();

        if (data.success && data.result) {
          setResult(data.result);
          setCache((prev) => ({ ...prev, [target.id]: data.result }));
        } else {
          setError(data.error || "Unable to calculate horoscope compatibility.");
          if (data.details) {
            setErrorDetails(data.details);
          }
        }
      } catch (fetchErr: any) {
        setError("Network error while calculating horoscope match. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [cache]
  );

  const closeHoroscopeMatch = useCallback(() => {
    setIsOpen(false);
    setFullReportOpen(false);
  }, []);

  const openFullReport = useCallback(() => {
    setFullReportOpen(true);
  }, []);

  const closeFullReport = useCallback(() => {
    setFullReportOpen(false);
  }, []);

  return (
    <HoroscopeMatchContext.Provider
      value={{
        isOpen,
        targetProfile,
        loading,
        error,
        errorDetails,
        result,
        fullReportOpen,
        openHoroscopeMatch,
        closeHoroscopeMatch,
        openFullReport,
        closeFullReport,
      }}
    >
      {children}
    </HoroscopeMatchContext.Provider>
  );
}

export function useHoroscopeMatch() {
  const context = useContext(HoroscopeMatchContext);
  if (!context) {
    throw new Error("useHoroscopeMatch must be used within a HoroscopeMatchProvider");
  }
  return context;
}
