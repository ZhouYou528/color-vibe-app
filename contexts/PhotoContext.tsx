"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface PhotoContextType {
  selectedImages: ImageFile[];
  setSelectedImages: (images: ImageFile[]) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);

  return (
    <PhotoContext.Provider
      value={{
        selectedImages,
        setSelectedImages,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhotoContext() {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error("usePhotoContext must be used within a PhotoProvider");
  }
  return context;
}
