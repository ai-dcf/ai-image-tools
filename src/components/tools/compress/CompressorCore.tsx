"use client";

import { useState, useEffect, useCallback } from "react";
import { useImageStore } from "@/store/useImageStore";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Download, Image as ImageIcon, RefreshCcw } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatLoadTime = (bytes: number) => {
  const speed = 3 * 1024 * 1024; // 3MB/s
  const time = bytes / speed;
  if (time < 0.01) return "< 0.01s";
  return time.toFixed(2) + "s";
};

export function CompressorCore() {
  const { originalFile, processedFile, originalImage, processedImage, setOriginalFile, setProcessedFile, setOriginalImage, setProcessedImage } = useImageStore();
  
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("image/jpeg");
  const [activeTab, setActiveTab] = useState("wechat");
  const [maxWidthOrHeight, setMaxWidthOrHeight] = useState<number>(4096);
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      setOriginalImage(URL.createObjectURL(file));
      setProcessedFile(null);
      setProcessedImage(null);
    }
  };

  const applyPreset = useCallback((tab: string) => {
    setActiveTab(tab);
    if (tab === "wechat") {
      setFormat("image/jpeg");
      setQuality(80);
    } else if (tab === "xiaohongshu") {
      setFormat("image/webp");
      setQuality(70);
    } else if (tab === "print") {
      setFormat("image/png"); // Using PNG for lossless
      setQuality(100);
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

  const preview = (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {!originalImage ? (
        <div className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center hover:border-blue-500 transition-colors">
          <Upload className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">上传图片以压缩</h3>
          <p className="mb-4 text-sm text-gray-500">支持 JPG, PNG, WebP 等格式</p>
          <Label htmlFor="upload-image" className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            选择文件
          </Label>
          <input
            id="upload-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
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

  const config = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">图片压缩</h2>
        <p className="text-sm text-gray-500">通过预设或自定义设置优化您的图片大小</p>
      </div>

      <div className={!originalImage ? "space-y-4 opacity-50 pointer-events-none select-none transition-opacity" : "space-y-4 transition-opacity"}>
        <div className="space-y-2">
          <Label className="text-sm font-medium">预设方案</Label>
          <Tabs value={activeTab} onValueChange={applyPreset} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="wechat" className="flex-1">微信分享</TabsTrigger>
              <TabsTrigger value="xiaohongshu" className="flex-1">小红书</TabsTrigger>
              <TabsTrigger value="print" className="flex-1">无损打印</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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
                setActiveTab("custom");
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
                setActiveTab("custom");
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
                setActiveTab("custom");
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

      <div className="mt-4 flex flex-col gap-3">
        <Button 
          className="w-full" 
          onClick={handleDownload}
          disabled={!processedImage || isCompressing}
        >
          <Download className="mr-2 h-4 w-4" />
          下载图片
        </Button>
        {originalImage && (
          <Button 
            variant="outline" 
            className="w-full"
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

  return <ToolLayout preview={preview} config={config} />;
}
