'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useImageStore } from '@/store/useImageStore';
import { TextItem } from './TextCanvas';
import { Download, Plus, Type, Trash2, Upload, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { cn } from '@/lib/utils';

const DynamicTextCanvas = dynamic(() => import('./TextCanvas'), {
  ssr: false,
});

const PRESETS = [
  {
    id: 'quote',
    name: '金句/语录',
    config: {
      fontSize: 40,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 2,
      fontFamily: 'serif',
      text: '"金句在这里"'
    }
  },
  {
    id: 'title',
    name: '视频标题',
    config: {
      fontSize: 60,
      fill: '#000000',
      stroke: '#ff0000',
      strokeWidth: 3,
      bgFill: '#ffff00',
      bgPadding: 10,
      fontFamily: 'sans-serif',
      text: '震撼发布'
    }
  },
  {
    id: 'watermark',
    name: '水印',
    config: {
      fontSize: 24,
      fill: '#ffffff',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 0.5,
      x: 300,
      y: 300,
      fontFamily: 'sans-serif',
      text: '@我的账号'
    }
  },
  {
    id: 'badge',
    name: '标签',
    config: {
      fontSize: 30,
      fill: '#ffffff',
      stroke: 'transparent',
      strokeWidth: 0,
      bgFill: '#ff0000',
      bgRadius: 10,
      bgPadding: 8,
      x: 300,
      y: 50,
      fontFamily: 'sans-serif',
      text: '新发布'
    }
  }
];

export default function TextCore() {
  const { originalImage, setOriginalImage, setProcessedImage } = useImageStore();
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalImage(url);
    }
  };

  const addText = (preset?: any) => {
    const newText: TextItem = {
      id: `text-${Math.random().toString(36).substr(2, 9)}`,
      text: preset?.text || '双击编辑文字',
      x: preset?.x !== undefined ? preset.x : 50,
      y: preset?.y !== undefined ? preset.y : 50,
      fontSize: preset?.fontSize || 40,
      fill: preset?.fill || '#000000',
      stroke: preset?.stroke || '#ffffff',
      strokeWidth: preset?.strokeWidth !== undefined ? preset.strokeWidth : 1,
      fontFamily: preset?.fontFamily || 'sans-serif',
      opacity: preset?.opacity !== undefined ? preset.opacity : 1,
      bgFill: preset?.bgFill || '',
      bgPadding: preset?.bgPadding || 0,
      bgRadius: preset?.bgRadius || 0,
    };
    setTexts([...texts, newText]);
    setSelectedId(newText.id);
  };

  const updateText = (id: string, newAttrs: Partial<TextItem>) => {
    setTexts(texts.map(t => (t.id === id ? { ...t, ...newAttrs } : t)));
  };

  const removeText = (id: string) => {
    setTexts(texts.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleExport = useCallback(() => {
    if (stageRef.current) {
      setSelectedId(null);
      setTimeout(() => {
        const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = 'text-image.png';
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setProcessedImage(uri);
      }, 50);
    }
  }, [setProcessedImage]);

  const selectedText = texts.find(t => t.id === selectedId);

  const presets = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">添加文字</h2>
        <p className="text-sm text-gray-500 mt-1">选择预设或添加新文字</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">预设方案</Label>
        <div className="space-y-2">
          {PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => addText(preset.config)}
              disabled={!originalImage}
              className={cn(
                "w-full text-left px-4 py-3 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button 
          className="w-full" 
          onClick={() => addText()} 
          disabled={!originalImage}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加自定义文字
        </Button>
      </div>

      <div className="pt-4 border-t">
        <input
          type="file"
          accept="image/*"
          id="upload-text-image"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Label htmlFor="upload-text-image" className="cursor-pointer">
          <Button className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            上传图片
          </Button>
        </Label>
        {originalImage && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => {
              setOriginalImage(null);
              setTexts([]);
              setSelectedId(null);
            }}
          >
            重新上传
          </Button>
        )}
      </div>
    </div>
  );

  const preview = (
    <div className="flex h-full w-full items-center justify-center overflow-hidden relative">
      {!originalImage ? (
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-4">暂无图片</h3>
          <p className="text-sm text-gray-500 mt-2">请在左侧上传图片</p>
        </div>
      ) : (
        <>
          <DynamicTextCanvas
            imageSrc={originalImage}
            texts={texts}
            onChange={(id, newAttrs) => updateText(id, newAttrs)}
            onSelect={setSelectedId}
            selectedId={selectedId}
            stageRef={stageRef}
          />
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute top-4 right-4 z-10 shadow-md"
            onClick={() => {
              setOriginalImage(null);
              setTexts([]);
              setSelectedId(null);
            }}
          >
            重新上传
          </Button>
        </>
      )}
    </div>
  );

  const settings = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">文字设置</h3>
        <p className="text-sm text-gray-500 mt-1">选择文字进行编辑</p>
      </div>

      {selectedText ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center">
              <Settings2 className="w-4 h-4 mr-2" />
              编辑文字
            </h4>
            <Button variant="ghost" size="sm" onClick={() => removeText(selectedText.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>文本内容</Label>
              <Input
                value={selectedText.text}
                onChange={(e) => updateText(selectedText.id, { text: e.target.value })}
                placeholder="输入文字..."
              />
            </div>

            <div className="space-y-2">
              <Label>字号: {Math.round(selectedText.fontSize)}px</Label>
              <Slider
                value={[selectedText.fontSize]}
                min={10}
                max={200}
                step={1}
                onValueChange={(val) => updateText(selectedText.id, { fontSize: Array.isArray(val) ? val[0] : (val as any) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>文字颜色</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedText.fill.startsWith('rgba') ? '#ffffff' : selectedText.fill}
                    onChange={(e) => updateText(selectedText.id, { fill: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={selectedText.fill}
                    onChange={(e) => updateText(selectedText.id, { fill: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>描边颜色</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedText.stroke.startsWith('rgba') ? '#ffffff' : selectedText.stroke}
                    onChange={(e) => updateText(selectedText.id, { stroke: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={selectedText.stroke}
                    onChange={(e) => updateText(selectedText.id, { stroke: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>描边宽度: {selectedText.strokeWidth}px</Label>
              <Slider
                value={[selectedText.strokeWidth]}
                min={0}
                max={20}
                step={1}
                onValueChange={(val) => updateText(selectedText.id, { strokeWidth: Array.isArray(val) ? val[0] : (val as any) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>字体</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedText.fontFamily}
                  onChange={(e) => updateText(selectedText.id, { fontFamily: e.target.value })}
                >
                  <option value="sans-serif">无衬线</option>
                  <option value="serif">衬线</option>
                  <option value="monospace">等宽</option>
                  <option value="cursive">手写</option>
                  <option value="fantasy">艺术</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>不透明度: {Math.round((selectedText.opacity ?? 1) * 100)}%</Label>
                <Slider
                  value={[selectedText.opacity ?? 1]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={(val) => updateText(selectedText.id, { opacity: Array.isArray(val) ? val[0] : (val as any) })}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          请点击画布上的文字进行编辑
        </div>
      )}

      <div className="mt-auto pt-4 border-t">
        <Button className="w-full" onClick={handleExport} disabled={!originalImage}>
          <Download className="w-4 h-4 mr-2" />
          导出图片
        </Button>
      </div>
    </div>
  );

  return <ToolLayout presets={presets} preview={preview} settings={settings} />;
}
