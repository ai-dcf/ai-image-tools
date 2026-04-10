"use client";

import { useState } from "react";
import { useImageStore } from "@/store/useImageStore";
import dynamic from "next/dynamic";
import { Upload, Download, Settings, LayoutTemplate, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CollageCanvas = dynamic(() => import("./CollageCanvas"), {
  ssr: false,
});

export type PresetType = "xiaohongshu" | "compare" | "grid";

export interface CollageSettings {
  gap: number;
  borderRadius: number;
  backgroundColor: string;
  backgroundImage: string | null;
  objectFit: "cover" | "contain";
}

function SortableImageItem({
  id,
  url,
  index,
  onRemove,
}: {
  id: string;
  url: string;
  index: number;
  onRemove: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group aspect-square rounded-md overflow-hidden border touch-none bg-white"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={`上传的图片 ${index + 1}`} className="w-full h-full object-cover pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function CollageCore() {
  const { images, setImages, files, setFiles } = useImageStore();
  const [preset, setPreset] = useState<PresetType>("grid");
  const [settings, setSettings] = useState<CollageSettings>({
    gap: 10,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    backgroundImage: null,
    objectFit: "cover",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img === active.id);
      const newIndex = images.findIndex((img) => img === over.id);

      setImages(arrayMove(images, oldIndex, newIndex));
      setFiles(arrayMove(files, oldIndex, newIndex));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newImages = newFiles.map((file) => URL.createObjectURL(file));
      setFiles([...files, ...newFiles]);
      setImages([...images, ...newImages]);
    }
    // reset input
    e.target.value = "";
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setSettings((s) => ({ ...s, backgroundImage: url }));
    }
    e.target.value = "";
  };

  const removeBgImage = () => {
    setSettings((s) => ({ ...s, backgroundImage: null }));
  };

  const handleDownload = () => {
    const event = new CustomEvent("download-collage");
    window.dispatchEvent(event);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newFiles = [...files];
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    setImages(newImages);
    setFiles(newFiles);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full flex-col md:flex-row bg-gray-50">
      {/* Left: Templates (20%) */}
      <div className="w-full md:w-[20%] border-r bg-white p-4 overflow-y-auto shrink-0 flex flex-col">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-blue-500" />
          模板选择
        </h2>
        <div className="space-y-3">
          <Button
            variant={preset === "grid" ? "default" : "outline"}
            className="w-full justify-start font-normal"
            onClick={() => {
              setPreset("grid");
              setSettings((s) => ({ ...s, gap: 0, borderRadius: 0 }));
            }}
          >
            九宫格 (九张图)
          </Button>
          <Button
            variant={preset === "xiaohongshu" ? "default" : "outline"}
            className="w-full justify-start font-normal"
            onClick={() => {
              setPreset("xiaohongshu");
              setSettings((s) => ({ ...s, gap: 10, borderRadius: 8, backgroundColor: "#f5f5f0" }));
            }}
          >
            小红书风格 (3:4)
          </Button>
          <Button
            variant={preset === "compare" ? "default" : "outline"}
            className="w-full justify-start font-normal"
            onClick={() => {
              setPreset("compare");
              setSettings((s) => ({ ...s, gap: 10, borderRadius: 0 }));
            }}
          >
            对比测评 (左右对半分)
          </Button>
        </div>

        {images.length > 0 && (
          <div className="mt-8 border-t pt-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-sm font-medium mb-4 text-gray-700">已上传图片 ({images.length})</h3>
            <div className="flex-1 overflow-y-auto pr-1">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((img, i) => (
                      <SortableImageItem key={img} id={img} url={img} index={i} onRemove={removeImage} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
            <div className="mt-4 pt-2 shrink-0 bg-white">
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => document.getElementById("collage-upload-left")?.click()}
              >
                <Plus className="w-4 h-4 mr-2" />
                继续添加
              </Button>
              <input
                id="collage-upload-left"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}
      </div>

      {/* Center: Preview (55%) */}
      <div className="flex w-full md:w-[55%] flex-col items-center justify-center p-8 overflow-auto shrink-0 relative bg-gray-100/50">
        {images.length > 0 ? (
          <div className="w-full max-w-2xl h-full flex items-center justify-center">
            <CollageCanvas images={images} preset={preset} settings={settings} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full max-w-md aspect-square border-2 border-dashed border-gray-300 rounded-xl bg-white shadow-sm">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">上传图片开始拼图</h3>
            <p className="text-gray-500 text-sm mb-6 text-center px-8">
              支持上传多张图片，可随时在左侧调整图片顺序或删除
            </p>
            <Button onClick={() => document.getElementById("collage-upload-center")?.click()}>选择图片</Button>
            <input
              id="collage-upload-center"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>

      {/* Right: Config (25%) */}
      <div className="w-full md:w-[25%] border-l bg-white p-4 overflow-y-auto shadow-sm shrink-0">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-700" />
          配置项
        </h2>

        <div className="space-y-8">
          <div className="space-y-6 bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">间距 (Gap)</Label>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border text-gray-600">
                  {settings.gap}px
                </span>
              </div>
              <Slider
                value={[settings.gap]}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) =>
                  setSettings({
                    ...settings,
                    gap: Array.isArray(val) ? val[0] : (val as unknown as number[])[0] || (val as unknown as number),
                  })
                }
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-gray-700">圆角 (Radius)</Label>
                <span className="text-sm font-mono bg-white px-2 py-1 rounded border text-gray-600">
                  {settings.borderRadius}px
                </span>
              </div>
              <Slider
                value={[settings.borderRadius]}
                min={0}
                max={50}
                step={1}
                onValueChange={(val) =>
                  setSettings({
                    ...settings,
                    borderRadius: Array.isArray(val)
                      ? val[0]
                      : (val as unknown as number[])[0] || (val as unknown as number),
                  })
                }
                className="py-2"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">背景颜色</Label>
              <div className="flex gap-3 items-center">
                <div className="relative w-10 h-10 rounded-md overflow-hidden border shadow-sm shrink-0">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                  />
                </div>
                <Input
                  type="text"
                  value={settings.backgroundColor.toUpperCase()}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">背景图片</Label>
              {settings.backgroundImage ? (
                <div className="relative aspect-video rounded-md overflow-hidden border bg-gray-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.backgroundImage} alt="Background" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={removeBgImage}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      移除背景
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => document.getElementById("bg-upload")?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    上传背景图
                  </Button>
                  <input
                    id="bg-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBgUpload}
                  />
                </>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">图片缩放模式 (Object Fit)</Label>
              <Select
                value={settings.objectFit}
                onValueChange={(val) => {
                  if (val === "cover" || val === "contain") {
                    setSettings({ ...settings, objectFit: val });
                  }
                }}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="选择模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">填充裁切 (Cover)</SelectItem>
                  <SelectItem value="contain">完整显示 (Contain)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {images.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">已就绪，随时可导出</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8"
                  onClick={() => {
                    setImages([]);
                    setFiles([]);
                  }}
                >
                  清空全部
                </Button>
              </div>
              <Button className="w-full py-6 text-base font-medium shadow-sm" onClick={handleDownload}>
                <Download className="w-5 h-5 mr-2" />
                导出拼图
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
