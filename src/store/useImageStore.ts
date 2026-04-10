import { create } from 'zustand';

interface ImageState {
  originalImage: string | null;
  processedImage: string | null;
  originalFile: File | null;
  processedFile: File | null;
  activePreset: string | null;
  images: string[];
  files: File[];
  setOriginalImage: (image: string | null) => void;
  setProcessedImage: (image: string | null) => void;
  setOriginalFile: (file: File | null) => void;
  setProcessedFile: (file: File | null) => void;
  setActivePreset: (preset: string | null) => void;
  setImages: (images: string[]) => void;
  setFiles: (files: File[]) => void;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set) => ({
  originalImage: null,
  processedImage: null,
  originalFile: null,
  processedFile: null,
  activePreset: null,
  images: [],
  files: [],
  setOriginalImage: (image) => set({ originalImage: image }),
  setProcessedImage: (image) => set({ processedImage: image }),
  setOriginalFile: (file) => set({ originalFile: file }),
  setProcessedFile: (file) => set({ processedFile: file }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  setImages: (images) => set({ images }),
  setFiles: (files) => set({ files }),
  reset: () => set({ 
    originalImage: null, 
    processedImage: null, 
    originalFile: null, 
    processedFile: null, 
    activePreset: null,
    images: [],
    files: []
  }),
}));
