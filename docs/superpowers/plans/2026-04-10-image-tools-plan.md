# Image Tools Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-performance, privacy-focused image editing platform using pure client-side processing with scenario-based presets.

**Architecture:** Next.js App Router providing the UI shell and routing. Zustand for global state (canvas, selected presets). specialized libraries (`browser-image-compression`, `react-easy-crop`, `react-konva`) handling specific tool logic.

**Tech Stack:** Next.js 14, React, Tailwind CSS, shadcn/ui, Zustand, browser-image-compression, react-easy-crop, react-konva, lucide-react.

---

### Task 1: Project Initialization & Core Dependencies

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `components/ui/*` (via shadcn-ui)

- [ ] **Step 1: Initialize Next.js project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --use-npm --src-dir --import-alias "@/*"`
Expected: Next.js project created in the current directory.

- [ ] **Step 2: Install core dependencies**
Run: `npm install zustand browser-image-compression react-easy-crop react-konva konva lucide-react`
Expected: Dependencies added to package.json.

- [ ] **Step 3: Initialize shadcn/ui**
Run: `npx shadcn-ui@latest init -d`
Run: `npx shadcn-ui@latest add button slider tabs card dialog input label select separator`
Expected: shadcn UI components added to `src/components/ui`.

- [ ] **Step 4: Commit**
Run: `git add . && git commit -m "chore: initialize next.js project with dependencies and shadcn"`

---

### Task 2: State Management (Zustand)

**Files:**
- Create: `src/store/useImageStore.ts`

- [ ] **Step 1: Create global state store**
Create `src/store/useImageStore.ts` with the following content:
```typescript
import { create } from 'zustand';

interface ImageState {
  originalImage: string | null; // Data URL or Object URL
  processedImage: string | null;
  activePreset: string | null;
  setOriginalImage: (url: string | null) => void;
  setProcessedImage: (url: string | null) => void;
  setActivePreset: (presetId: string | null) => void;
  reset: () => void;
}

export const useImageStore = create<ImageState>((set) => ({
  originalImage: null,
  processedImage: null,
  activePreset: null,
  setOriginalImage: (url) => set({ originalImage: url, processedImage: null, activePreset: null }),
  setProcessedImage: (url) => set({ processedImage: url }),
  setActivePreset: (presetId) => set({ activePreset: presetId }),
  reset: () => set({ originalImage: null, processedImage: null, activePreset: null }),
}));
```

- [ ] **Step 2: Commit**
Run: `git add src/store/useImageStore.ts && git commit -m "feat: add global zustand store for image state"`

---

### Task 3: Shared UI Components (Layout Shell)

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/ToolLayout.tsx`

- [ ] **Step 1: Create Header component**
Create `src/components/layout/Header.tsx` containing navigation links to Home, Compress, Crop, Border, Text, Collage.

- [ ] **Step 2: Update Root Layout**
Modify `src/app/layout.tsx` to include the `Header` component.

- [ ] **Step 3: Create generic ToolLayout**
Create `src/components/layout/ToolLayout.tsx` for the Left-Right split:
```typescript
import React from 'react';

interface ToolLayoutProps {
  preview: React.ReactNode;
  config: React.ReactNode;
}

export function ToolLayout({ preview, config }: ToolLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full">
      {/* Left: Preview (65%) */}
      <div className="w-[65%] bg-zinc-100 flex items-center justify-center p-8 overflow-hidden relative border-r">
        {preview}
      </div>
      {/* Right: Config (35%) */}
      <div className="w-[35%] bg-white flex flex-col h-full overflow-y-auto">
        {config}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**
Run: `git add src/app/layout.tsx src/components/layout/ && git commit -m "feat: add shared layout components"`

---

### Task 4: Image Compression Tool (/tools/compress)

**Files:**
- Create: `src/app/tools/compress/page.tsx`
- Create: `src/components/tools/compress/CompressorCore.tsx`

- [ ] **Step 1: Create Compressor component**
Implement the UI and logic using `browser-image-compression`.
Create `src/components/tools/compress/CompressorCore.tsx` handling file input, quality slider (0-100), and format selection.

- [ ] **Step 2: Implement presets logic**
In `CompressorCore.tsx`, add Tabs for:
- "WeChat" (options: { fileType: 'image/jpeg', maxSizeMB: 2, useWebWorker: true, exifOrientation: false })
- "Xiaohongshu" (options: { fileType: 'image/webp', maxSizeMB: 5, useWebWorker: true })
When a preset is clicked, update the slider and format state, and call `setActivePreset`.

- [ ] **Step 3: Create Page Route**
Create `src/app/tools/compress/page.tsx` using `ToolLayout`. Pass `CompressorCore` to the config prop and an image preview to the preview prop.

- [ ] **Step 4: Commit**
Run: `git add src/app/tools/compress/ src/components/tools/compress/ && git commit -m "feat: implement image compression tool"`

---

### Task 5: Image Cropping Tool (/tools/crop)

**Files:**
- Create: `src/app/tools/crop/page.tsx`
- Create: `src/components/tools/crop/CropCore.tsx`

- [ ] **Step 1: Create Crop component**
Implement `src/components/tools/crop/CropCore.tsx` using `react-easy-crop`.
Manage `crop`, `zoom`, and `aspect` state.

- [ ] **Step 2: Implement presets logic**
Add presets for aspect ratios:
- Xiaohongshu (3/4)
- WeChat Header (2.35/1)
- TikTok (9/16)
- Free (null)

- [ ] **Step 3: Implement export logic**
Write a utility function `getCroppedImg(imageSrc, pixelCrop)` that uses Canvas API to draw the cropped area and return a Data URL.

- [ ] **Step 4: Create Page Route**
Create `src/app/tools/crop/page.tsx` using `ToolLayout`.

- [ ] **Step 5: Commit**
Run: `git add src/app/tools/crop/ src/components/tools/crop/ && git commit -m "feat: implement image cropping tool"`

---

### Task 6: Home Page (Navigation)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build Scenario Grid**
Modify `src/app/page.tsx` to display cards linking to `/tools/compress`, `/tools/crop`, `/tools/border`, `/tools/text`, `/tools/collage`. Use `lucide-react` icons for visual appeal.

- [ ] **Step 2: Commit**
Run: `git add src/app/page.tsx && git commit -m "feat: build home page navigation grid"`
