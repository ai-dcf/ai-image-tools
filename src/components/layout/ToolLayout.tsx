import { ReactNode } from 'react';

interface ToolLayoutProps {
  preview: ReactNode;
  config: ReactNode;
}

export function ToolLayout({ preview, config }: ToolLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col md:flex-row bg-zinc-50/50">
      <div className="flex h-full min-h-0 w-full md:w-[65%] items-center justify-center p-8 overflow-auto">
        <div className="w-full h-full max-w-5xl rounded-2xl bg-white shadow-sm border border-zinc-100 overflow-hidden relative flex flex-col">
          {preview}
        </div>
      </div>
      <div className="h-full min-h-0 w-full md:w-[35%] bg-white border-l border-zinc-100 p-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {config}
        </div>
      </div>
    </div>
  );
}
