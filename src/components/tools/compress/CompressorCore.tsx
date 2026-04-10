"use client";

import { useState, useEffect, useCallback } from "react";
import { useImageStore } from "@/store/useImageStore";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Download, Image as ImageIcon, RefreshCcw } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ImageUploadZone } from "@/components/common/ImageUploadZone";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatLoadTime = (bytes: number) => {
  const speed = 3 * 1024 * 1024;
  const time = bytes / speed;
  if (time < 0.01) return "< 0.01s";
  return time.toFixed(2) + "s";
};

const PRESETS = [
  { id: "wechat", name: "微信分享", format: "image/jpeg", quality: 80 },
  { id: "xiaohongshu", name: "小红书", format: "image/webp", quality: 70 },
  { id: "print", name: "无损打印", format: "image/png", quality: 100 },
];

export function CompressorCore() {
  const { originalFile, processedFile, originalImage, processedImage, setOriginalFile, setProcessedFile, setOriginalImage, setProcessedImage } = useImageStore();
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/jpeg");
  const [activePreset, setActivePreset] = useState("wechat");
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState<number>(4096);
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleFilesSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      setOriginalFile(file);
      setOriginalImage(URL.createObjectURL(file));
      setProcessedFile(null);
      setProcessedImage(null);
    }
  };

  const applyPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      setFormat(preset.format);
      setQuality(preset.quality);
    }
  }, []);

  const compressImage = useCallback(async () => {
    if (!originalFile) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 50,
        maxWidthOrHeight: maxWidthOrHeight || undefined,
        useWebWorker: true,
        fileType: format,
        initialQuality: quality / 100,
      };

      const compressedFile = await imageCompression(originalFile, options);
      setProcessedFile(compressedFile);
      setProcessedImage(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Compression failed:", error);
    } finally {
      setIsCompressing(false);
    }
  }, [originalFile, format, quality, maxWidthOrHeight, setProcessedFile, setProcessedImage]);

  useEffect(() => {
    if (originalFile) {
      compressImage();
    }
  }, [compressImage]);

  const handleDownload = () => {
    if (processedImage && processedFile) {
      const link = document.createElement("a");
      link.href = processedImage;
      const extension = format.split("/")[1] || "jpg";
      link.download = `compressed-${originalFile?.name.split(".")[0]}.${extension}`;
      link.click();
    }
  };

  const presets = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">图片压缩</h2>
        <p className="text-sm text-gray-500 mt-1">选择预设方案快速优化</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">预设方案</Label>
        <div className="space-y-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-all",
                activePreset === preset.id
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs mt-1 opacity-70">
                {preset.format.split("/")[1].toUpperCase()} · {preset.quality}%
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label className="cursor-pointer">
          <Button className="w-full" onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || []);
              if (files.length > 0) {
                handleFilesSelected(files);
              }
            };
            input.click();
          }}>
            <Upload className="mr-2 h-4 w-4" />
            上传图片
          </Button>
        </Label>
        {originalImage && (
          <Button 
            variant="outline" 
            className="w-full mt-2"
            onClick={() => {
              setOriginalFile(null);
              setOriginalImage(null);
              setProcessedFile(null);
              setProcessedImage(null);
            }}
          >
            重新上传
          </Button>
        )}
      </div>
    </div>
  );

  const preview = (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {!originalImage ? (
        <ImageUploadZone 
          onFilesSelected={handleFilesSelected}
          className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white"
        />
      ) : (
        <div className="flex w-full flex-col items-center gap-6">
          <div className="relative flex h-[60vh] min-h-[400px] w-full items-center justify-center overflow-hidden rounded-xl bg-gray-100 shadow-inner">
            {originalImage && (
              <img src={originalImage} alt="Original" className="absolute h-full w-full object-contain pointer-events-none" />
            )}
            
            {processedImage && (
              <img 
                src={processedImage} 
                alt="Processed" 
                className="absolute h-full w-full object-contain pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }} 
              />
            )}

            {processedImage && (
              <>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sliderPosition} 
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0"
                />
                <div 
                  className="pointer-events-none absolute bottom-0 top-0 z-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </>
            )}

            {isCompressing && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2 rounded-lg bg-white/90 p-4 shadow-lg">
                  <RefreshCcw className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">压缩中...</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid w-full grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-medium text-gray-700">原图</h4>
              {originalFile && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">{formatFileSize(originalFile.size)}</p>
                  <p className="mt-1 text-xs text-gray-500">预估加载时间: {formatLoadTime(originalFile.size)}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow-sm">
              <h4 className="font-medium text-gray-700">压缩后</h4>
              {processedFile ? (
                <div className="text-center">
                  <p className={cn("text-sm font-medium", processedFile.size > (originalFile?.size || 0) ? "text-red-600" : "text-green-600")}>
                    {formatFileSize(processedFile.size)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">预估加载时间: {formatLoadTime(processedFile.size)}</p>
                  {originalFile && processedFile.size < originalFile.size && (
                    <p className="mt-1 text-xs font-medium text-green-600">
                      ↓ 节省 {Math.round((1 - processedFile.size / originalFile.size) * 100)}%
                    </p>
                  )}
                </div>
              ) : isCompressing ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  处理中
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <ImageIcon className="h-4 w-4" />
                  等待压缩
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const settings = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">高级设置</h3>
        <p className="text-sm text-gray-500 mt-1">自定义压缩参数</p>
      </div>

      <div className={!originalImage ? "space-y-4 opacity-50 pointer-events-none select-none transition-opacity" : "space-y-4 transition-opacity"}>
        <div className="space-y-4 rounded-lg border bg-gray-50/50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm font-medium">压缩质量</Label>
              <span className="text-sm text-gray-500">{quality}%</span>
            </div>
            <Slider
              value={[quality]}
              min={1}
              max={100}
              step={1}
              onValueChange={(vals: number | readonly number[]) => {
                setQuality(Array.isArray(vals) ? vals[0] : (vals as number));
                setActivePreset("");
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">最大尺寸限制 (px)</Label>
            <Input 
              type="number" 
              value={maxWidthOrHeight} 
              onChange={(e) => {
                setMaxWidthOrHeight(Number(e.target.value));
                setActivePreset("");
              }}
              min={1}
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">输出格式</Label>
            <Select 
              value={format} 
              onValueChange={(val: string | null) => {
              if (val) {
                setFormat(val);
                setActivePreset("");
              }
            }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="选择格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="image/jpeg">JPEG (.jpg)</SelectItem>
                  <SelectItem value="image/png">PNG (.png)</SelectItem>
                  <SelectItem value="image/webp">WebP (.webp)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t">
        <Button 
          className="w-full" 
          onClick={handleDownload}
          disabled={!processedImage || isCompressing}
        >
          <Download className="mr-2 h-4 w-4" />
          下载图片
        </Button>
      </div>
    </div>
  );

  return <ToolLayout presets={presets} preview={preview} settings={settings} />;
}
