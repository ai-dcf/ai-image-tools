import { ReactNode } from 'react';

interface ToolLayoutProps {
  presets?: ReactNode;
  preview: ReactNode;
  settings?: ReactNode;
}

export function ToolLayout({ presets, preview, settings }: ToolLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col md:flex-row bg-zinc-50/50">
      {presets && (
        <div className="h-full min-h-0 w-full md:w-64 bg-white border-r border-zinc-100 p-6 overflow-y-auto flex-shrink-0">
          {presets}
        </div>
      )}
      <div className="flex h-full min-h-0 flex-1 items-center justify-center p-8 overflow-auto">
        <div className="w-full h-full max-w-5xl rounded-2xl bg-white shadow-sm border border-zinc-100 overflow-hidden relative flex flex-col">
          {preview}
        </div>
      </div>
      {settings && (
        <div className="h-full min-h-0 w-full md:w-80 bg-white border-l border-zinc-100 p-6 overflow-y-auto flex-shrink-0">
          {settings}
        </div>
      )}
    </div>
  );
}
