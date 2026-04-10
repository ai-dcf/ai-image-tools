import { create } from 'zustand';

interface ImageState {
  originalImage: string | null;
  processedImage: string | null;
  originalFile: File | null;
  processedFile: File | null;
  activePreset: string | null;
  setOriginalImage: (image: string | null) => void;
  setProcessedImage: (image: string | null) => void;
  setOriginalFile: (file: File | null) => void;
  setProcessedFile: (file: File | null) => void;
  setActivePreset: (preset: string | null) => void;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set) => ({
  originalImage: null,
  processedImage: null,
  originalFile: null,
  processedFile: null,
  activePreset: null,
  setOriginalImage: (image) => set({ originalImage: image }),
  setProcessedImage: (image) => set({ processedImage: image }),
  setOriginalFile: (file) => set({ originalFile: file }),
  setProcessedFile: (file) => set({ processedFile: file }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  reset: () => set({ originalImage: null, processedImage: null, originalFile: null, processedFile: null, activePreset: null }),
}));
