"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ImageUploadZone({
  onFilesSelected,
  multiple = false,
  accept = "image/*",
  children,
  className,
}: ImageUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    };
    input.click();
  }, [accept, multiple, onFilesSelected]);

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        isDragOver && "ring-2 ring-blue-500 bg-blue-50/50",
        className
      )}
    >
      {children || (
        <div className="flex flex-col items-center justify-center p-12">
          <div className={cn(
            "p-4 rounded-full mb-4 transition-colors",
            isDragOver ? "bg-blue-100" : "bg-zinc-100"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors",
              isDragOver ? "text-blue-600" : "text-zinc-400"
            )} />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-2">
            {isDragOver ? "松开上传图片" : "点击或拖拽上传图片"}
          </h3>
          <p className="text-sm text-zinc-500">
            支持 JPG, PNG, WebP, GIF 等格式
          </p>
        </div>
      )}
    </div>
  );
}
