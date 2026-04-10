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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line react-hooks/purity
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
      // Temporarily deselect so transformer isn't visible
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

  const preview = (
    <div className="flex h-full w-full items-center justify-center overflow-hidden relative">
      {!originalImage ? (
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4 flex text-sm leading-6 text-gray-600">
            <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80">
              <span>上传图片</span>
              <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
            </label>
            <p className="pl-1">或拖拽图片到这里</p>
          </div>
          <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF 最大 10MB</p>
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
            onClick={() => setOriginalImage(null)}
          >
            重新上传
          </Button>
        </>
      )}
    </div>
  );

  const config = (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="text-lg font-medium">添加文字</h3>
        <p className="text-sm text-gray-500 mb-4">选择预设或添加新文字块</p>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {PRESETS.map(preset => (
            <Button
              key={preset.id}
              variant="outline"
              onClick={() => addText(preset.config)}
              disabled={!originalImage}
              className="flex flex-col h-auto py-3 items-center justify-center space-y-1"
            >
              <Type className="w-5 h-5" />
              <span className="text-xs">{preset.name}</span>
            </Button>
          ))}
        </div>

        <Button 
          className="w-full" 
          onClick={() => addText()} 
          disabled={!originalImage}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加自定义文字
        </Button>
      </div>

      {selectedText && (
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center">
              <Settings2 className="w-4 h-4 mr-2" />
              文字设置
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
                  <option value="sans-serif">无衬线 (Sans-serif)</option>
                  <option value="serif">衬线 (Serif)</option>
                  <option value="monospace">等宽 (Monospace)</option>
                  <option value="cursive">手写 (Cursive)</option>
                  <option value="fantasy">艺术 (Fantasy)</option>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>字间距: {selectedText.letterSpacing || 0}px</Label>
                <Slider
                  value={[selectedText.letterSpacing || 0]}
                  min={-10}
                  max={50}
                  step={1}
                  onValueChange={(val) => updateText(selectedText.id, { letterSpacing: Array.isArray(val) ? val[0] : (val as any) })}
                />
              </div>

              <div className="space-y-2">
                <Label>行高: {selectedText.lineHeight || 1}</Label>
                <Slider
                  value={[selectedText.lineHeight || 1]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={(val) => updateText(selectedText.id, { lineHeight: Array.isArray(val) ? val[0] : (val as any) })}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <Label className="font-semibold">背景设置</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>背景颜色</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedText.bgFill || '#ffffff'}
                      onChange={(e) => updateText(selectedText.id, { bgFill: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={selectedText.bgFill || ''}
                      onChange={(e) => updateText(selectedText.id, { bgFill: e.target.value })}
                      placeholder="透明"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>圆角: {selectedText.bgRadius || 0}px</Label>
                  <Slider
                    value={[selectedText.bgRadius || 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(val) => updateText(selectedText.id, { bgRadius: Array.isArray(val) ? val[0] : (val as any) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>背景内边距: {selectedText.bgPadding || 0}px</Label>
                <Slider
                  value={[selectedText.bgPadding || 0]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(val) => updateText(selectedText.id, { bgPadding: Array.isArray(val) ? val[0] : (val as any) })}
                />
              </div>
            </div>

            <div className="pt-4 border-t space-y-4">
              <Label className="font-semibold">阴影设置</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>阴影颜色</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedText.shadowColor || '#000000'}
                      onChange={(e) => updateText(selectedText.id, { shadowColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={selectedText.shadowColor || ''}
                      onChange={(e) => updateText(selectedText.id, { shadowColor: e.target.value })}
                      placeholder="透明"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>模糊度: {selectedText.shadowBlur || 0}px</Label>
                  <Slider
                    value={[selectedText.shadowBlur || 0]}
                    min={0}
                    max={50}
                    step={1}
                    onValueChange={(val) => updateText(selectedText.id, { shadowBlur: Array.isArray(val) ? val[0] : (val as any) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>X轴偏移: {selectedText.shadowOffsetX || 0}px</Label>
                  <Slider
                    value={[selectedText.shadowOffsetX || 0]}
                    min={-50}
                    max={50}
                    step={1}
                    onValueChange={(val) => updateText(selectedText.id, { shadowOffsetX: Array.isArray(val) ? val[0] : (val as any) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Y轴偏移: {selectedText.shadowOffsetY || 0}px</Label>
                  <Slider
                    value={[selectedText.shadowOffsetY || 0]}
                    min={-50}
                    max={50}
                    step={1}
                    onValueChange={(val) => updateText(selectedText.id, { shadowOffsetY: Array.isArray(val) ? val[0] : (val as any) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t mt-auto">
        <Button className="w-full" size="lg" onClick={handleExport} disabled={!originalImage}>
          <Download className="w-4 h-4 mr-2" />
          导出图片
        </Button>
      </div>
    </div>
  );

  return <ToolLayout preview={preview} config={config} />;
}