"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { ToolLayout } from "@/components/layout/ToolLayout";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import getCroppedImg from "@/lib/cropImage";
import { Upload, Download, Image as ImageIcon, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageUploadZone } from "@/components/common/ImageUploadZone";

const PRESETS = [
  { id: "free", name: "自由", value: undefined },
  { id: "1:1", name: "朋友圈/头像", value: 1 / 1 },
  { id: "3:4", name: "小红书", value: 3 / 4 },
  { id: "2.35:1", name: "微信公众号", value: 2.35 / 1 },
  { id: "9:16", name: "抖音", value: 9 / 16 },
];

export function CropCore() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [outputWidth, setOutputWidth] = useState<string>("");
  const [outputHeight, setOutputHeight] = useState<string>("");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(presetId);
      setAspect(preset.value);
    }
  };

  const handleExport = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const outputSize = {
        width: outputWidth ? parseInt(outputWidth, 10) : undefined,
        height: outputHeight ? parseInt(outputHeight, 10) : undefined,
      };
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        outputSize,
      );

      if (croppedImage) {
        const link = document.createElement("a");
        link.download = "cropped-image.jpg";
        link.href = croppedImage;
        link.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const presets = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">图片裁剪</h2>
        <p className="text-sm text-gray-500 mt-1">选择裁剪比例预设</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">裁剪比例</Label>
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
                {preset.id}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          onClick={() => {
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
          }}
          className="w-full"
        >
          <Upload className="mr-2 h-4 w-4" />
          上传图片
        </Button>
        {imageSrc && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setImageSrc(null)}
          >
            重新上传
          </Button>
        )}
      </div>
    </div>
  );

  const preview = (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      {imageSrc ? (
        <div className="absolute inset-0">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            transform={`translate(${crop.x}px, ${crop.y}px) rotate(${rotation}deg) scale(${zoom * (flip.horizontal ? -1 : 1)}, ${zoom * (flip.vertical ? -1 : 1)})`}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>
      ) : (
        <ImageUploadZone 
          onFilesSelected={handleFilesSelected}
          className="flex w-full max-w-md flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white"
        />
      )}
    </div>
  );

  const settings = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">高级设置</h3>
        <p className="text-sm text-gray-500 mt-1">自定义裁剪参数</p>
      </div>

      <div className={!imageSrc ? "space-y-4 opacity-50 pointer-events-none select-none transition-opacity" : "space-y-4 transition-opacity"}>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label>缩放</Label>
            <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={(val: number | readonly number[]) =>
              setZoom(Array.isArray(val) ? val[0] : (val as number))
            }
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex justify-between">
            <Label>旋转</Label>
            <span className="text-xs text-gray-500">{rotation}°</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[rotation]}
              min={0}
              max={360}
              step={1}
              onValueChange={(val: number | readonly number[]) =>
                setRotation(Array.isArray(val) ? val[0] : (val as number))
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRotation((r) => (r + 90) % 360)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Label>翻转</Label>
          <div className="flex gap-4">
            <Button
              variant={flip.horizontal ? "default" : "outline"}
              onClick={() =>
                setFlip((f) => ({ ...f, horizontal: !f.horizontal }))
              }
              className="flex-1"
            >
              水平翻转
            </Button>
            <Button
              variant={flip.vertical ? "default" : "outline"}
              onClick={() => setFlip((f) => ({ ...f, vertical: !f.vertical }))}
              className="flex-1"
            >
              垂直翻转
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <Label>精确输出尺寸 (可选)</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="宽 (px)"
              value={outputWidth}
              onChange={(e) => setOutputWidth(e.target.value)}
              className="flex-1"
            />
            <span className="text-gray-500">x</span>
            <Input
              type="number"
              placeholder="高 (px)"
              value={outputHeight}
              onChange={(e) => setOutputHeight(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t">
        <Button
          onClick={handleExport}
          className="w-full"
          disabled={!imageSrc}
        >
          <Download className="mr-2 h-4 w-4" />
          导出裁剪图片
        </Button>
      </div>
    </div>
  );

  return <ToolLayout presets={presets} preview={preview} settings={settings} />;
}
