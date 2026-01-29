"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePhotoContext } from "@/contexts/PhotoContext";

const MAX_IMAGES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ImageFile {
  file: File;
  preview: string;
  id: string;
  selected: boolean;
}

export default function SelectPhotosPage() {
  const router = useRouter();
  const { setSelectedImages } = usePhotoContext();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Please upload only image files";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} is too large (max 10MB)`;
    }
    return null;
  };

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const newImages: ImageFile[] = [];
      const errors: string[] = [];

      // Check total count
      if (images.length + files.length > MAX_IMAGES) {
        setError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
        return;
      }

      Array.from(files).forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(validationError);
          return;
        }

        const preview = URL.createObjectURL(file);
        newImages.push({
          file,
          preview,
          id: `${Date.now()}-${Math.random()}`,
          selected: true, // Auto-select new images
        });
      });

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        updateSelectedCount(updatedImages);
        setError(null);
      }
    },
    [images]
  );

  const updateSelectedCount = (imageList: ImageFile[]) => {
    const count = imageList.filter((img) => img.selected).length;
    setSelectedCount(count);
  };

  const toggleSelection = (id: string) => {
    const updatedImages = images.map((img) =>
      img.id === id ? { ...img, selected: !img.selected } : img
    );
    setImages(updatedImages);
    updateSelectedCount(updatedImages);
  };

  const handleSelectPhotos = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReselect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleNext = () => {
    const selectedImages = images.filter((img) => img.selected);
    if (selectedImages.length === 0) {
      setError("Please select at least one photo");
      return;
    }
    
    // Store selected images in context (keeps File objects in memory)
    const imagesToStore = selectedImages.map((img) => ({
      file: img.file,
      preview: img.preview,
      id: img.id,
    }));
    
    setSelectedImages(imagesToStore);
    
    // Navigate to card details page
    router.push("/card-details");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <Link
            href="/"
            className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          {/* Page Title */}
          <h1 className="text-lg font-semibold text-gray-900">Select Photos</h1>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={selectedCount === 0}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                selectedCount === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-900 hover:bg-gray-100"
              }
            `}
          >
            Next
          </button>
        </div>
      </header>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Photo Grid */}
        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-amber-300 bg-gray-100 cursor-pointer group"
                  onClick={() => toggleSelection(img.id)}
                >
                  <img
                    src={img.preview}
                    alt={`Photo ${img.id}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Selection Indicator - golden checkmark in top-right */}
                  {img.selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-amber-700 rounded flex items-center justify-center shadow-sm">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selection Count */}
            <div className="flex justify-center mb-6">
              <div className="px-6 py-2 bg-amber-700 rounded-full">
                <span className="text-white text-sm font-medium">
                  {selectedCount}/{MAX_IMAGES} selected
                </span>
              </div>
            </div>

            {/* Reselect Button */}
            <div className="flex justify-center">
              <button
                onClick={handleReselect}
                className="px-8 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
              >
                Reselect Photos
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No photos selected</p>
            <button
              onClick={handleSelectPhotos}
              className="px-6 py-3 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors"
            >
              Select Photos
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
