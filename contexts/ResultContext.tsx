"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export interface ResultImage {
  file: File;
  preview: string; // blob URL
  id: string;
}

interface ResultContextType {
  resultImages: ResultImage[];
  setResultImages: (images: ResultImage[]) => void;
  clearResultImages: () => void;
}

const ResultContext = createContext<ResultContextType | undefined>(undefined);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [resultImages, setResultImagesState] = useState<ResultImage[]>([]);

  const setResultImages = (images: ResultImage[]) => {
    setResultImagesState(images);
  };

  const clearResultImages = () => {
    setResultImagesState([]);
  };

  const value = useMemo(
    () => ({ resultImages, setResultImages, clearResultImages }),
    [resultImages]
  );

  return <ResultContext.Provider value={value}>{children}</ResultContext.Provider>;
}

export function useResultContext() {
  const ctx = useContext(ResultContext);
  if (!ctx) throw new Error("useResultContext must be used within a ResultProvider");
  return ctx;
}

