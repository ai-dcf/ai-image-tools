import { ReactNode } from 'react';

interface ToolLayoutProps {
  preview: ReactNode;
  config: ReactNode;
}

export function ToolLayout({ preview, config }: ToolLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col md:flex-row">
      <div className="flex w-full md:w-[65%] items-center justify-center bg-gray-50 p-4 overflow-auto">
        {preview}
      </div>
      <div className="w-full md:w-[35%] border-l bg-white p-6 overflow-y-auto shadow-sm">
        {config}
      </div>
    </div>
  );
}
