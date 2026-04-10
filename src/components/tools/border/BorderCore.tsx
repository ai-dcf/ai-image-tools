'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useImageStore } from '@/store/useImageStore';
import { Upload, Download, ImageIcon } from 'lucide-react';
import type { BorderSettings } from './BorderCanvas';
import type Konva from 'konva';

// 动态导入 BorderCanvas，避免服务端渲染 Konva 相关报错
const BorderCanvas = dynamic(() => import('./BorderCanvas'), { ssr: false });

const PRESETS = [
  {
    name: '拍立得',
    settings: { paddingTop: 40, paddingRight: 40, paddingBottom: 160, paddingLeft: 40, color: '#ffffff', radius: 0, strokeWidth: 0, strokeColor: '#000000' }
  },
  {
    name: '极简',
    settings: { paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, color: '#ffffff', radius: 0, strokeWidth: 1, strokeColor: '#000000' }
  },
  {
    name: '莫兰迪',
    settings: { paddingTop: 60, paddingRight: 60, paddingBottom: 60, paddingLeft: 60, color: '#d0c4b4', radius: 16, strokeWidth: 0, strokeColor: '#000000' }
  },
  {
    name: '电影感',
    settings: { paddingTop: 80, paddingRight: 0, paddingBottom: 80, paddingLeft: 0, color: '#000000', radius: 0, strokeWidth: 0, strokeColor: '#ffffff' }
  }
];

export function BorderCore() {
  const { originalImage, setOriginalImage } = useImageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<BorderSettings>(PRESETS[0].settings);
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].name);
  const [unifiedPadding, setUnifiedPadding] = useState<boolean>(false);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 监听容器大小变化
  useEffect(() => {
    const updateSize = () => {
      if (previewContainerRef.current) {
        setContainerSize({
          width: previewContainerRef.current.clientWidth,
          height: previewContainerRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [originalImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setOriginalImage(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    if (stageRef.current) {
      // 获取高分辨率图片，pixelRatio 可以提高导出图片的清晰度
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'bordered-image.png';
      link.href = dataURL;
      link.click();
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setSettings(preset.settings);
    setActivePreset(preset.name);
  };

  const updateSetting = (key: keyof BorderSettings, value: string | number) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      if (unifiedPadding && typeof value === 'number') {
        if (key === 'paddingTop' || key === 'paddingBottom' || key === 'paddingLeft' || key === 'paddingRight') {
          newSettings.paddingTop = value;
          newSettings.paddingBottom = value;
          newSettings.paddingLeft = value;
          newSettings.paddingRight = value;
        }
      }
      
      return newSettings;
    });
    setActivePreset(''); // 手动调整时清除选中状态
  };

  const preview = (
    <div 
      ref={previewContainerRef}
      className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300"
    >
      {originalImage && containerSize.width > 0 ? (
        <BorderCanvas
          ref={stageRef}
          imageUrl={originalImage}
          settings={settings}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
        />
      ) : (
        <div className="text-center p-6">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无图片</h3>
          <p className="text-sm text-gray-500 mb-4">请在右侧控制面板上传需要添加边框的图片</p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            选择图片
          </Button>
        </div>
      )}
    </div>
  );

  const config = (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">添加边框</h2>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()} 
          className="w-full mb-4"
          variant={originalImage ? "outline" : "default"}
        >
          <Upload className="mr-2 h-4 w-4" />
          {originalImage ? '重新上传图片' : '上传图片'}
        </Button>
      </div>

      {originalImage && (
        <>
          <div className="space-y-4">
            <Label>预设风格</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  variant={activePreset === preset.name ? "default" : "outline"}
                  onClick={() => applyPreset(preset)}
                  className="w-full text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label>边距设置</Label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={unifiedPadding}
                  onChange={(e) => setUnifiedPadding(e.target.checked)}
                  className="rounded border-gray-300"
                />
                统一边距
              </label>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-500">上边距</span>
                <Slider
                  value={[settings.paddingTop]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(val: number | readonly number[]) => updateSetting('paddingTop', Array.isArray(val) ? val[0] : (val as number))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-xs text-gray-500">{settings.paddingTop}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-500">下边距</span>
                <Slider
                  value={[settings.paddingBottom]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(val: number | readonly number[]) => updateSetting('paddingBottom', Array.isArray(val) ? val[0] : (val as number))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-xs text-gray-500">{settings.paddingBottom}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-500">左边距</span>
                <Slider
                  value={[settings.paddingLeft]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(val: number | readonly number[]) => updateSetting('paddingLeft', Array.isArray(val) ? val[0] : (val as number))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-xs text-gray-500">{settings.paddingLeft}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-500">右边距</span>
                <Slider
                  value={[settings.paddingRight]}
                  min={0}
                  max={200}
                  step={1}
                  onValueChange={(val: number | readonly number[]) => updateSetting('paddingRight', Array.isArray(val) ? val[0] : (val as number))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-xs text-gray-500">{settings.paddingRight}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label>圆角</Label>
              <span className="text-xs text-gray-500">{settings.radius}px</span>
            </div>
            <Slider
              value={[settings.radius]}
              min={0}
              max={100}
              step={1}
              onValueChange={(val: number | readonly number[]) => updateSetting('radius', Array.isArray(val) ? val[0] : (val as number))}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label>背景颜色</Label>
            <div className="flex gap-2">
              {['#ffffff', '#000000', '#d0c4b4', '#f1f5f9', '#fecdd3', '#e0f2fe'].map(color => (
                <button
                  key={color}
                  onClick={() => updateSetting('color', color)}
                  className={`w-8 h-8 rounded-full border-2 ${settings.color === color ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={settings.color}
                onChange={(e) => updateSetting('color', e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <Label>内边框宽度</Label>
              <span className="text-xs text-gray-500">{settings.strokeWidth}px</span>
            </div>
            <Slider
              value={[settings.strokeWidth]}
              min={0}
              max={20}
              step={1}
              onValueChange={(val: number | readonly number[]) => updateSetting('strokeWidth', Array.isArray(val) ? val[0] : (val as number))}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label>内边框颜色</Label>
            <div className="flex gap-2">
              {['#ffffff', '#000000', '#d0c4b4', '#f1f5f9', '#fecdd3', '#e0f2fe'].map(color => (
                <button
                  key={`stroke-${color}`}
                  onClick={() => updateSetting('strokeColor', color)}
                  className={`w-8 h-8 rounded-full border-2 ${settings.strokeColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={settings.strokeColor}
                onChange={(e) => updateSetting('strokeColor', e.target.value)}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-6 border-t">
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              导出图片
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return <ToolLayout preview={preview} config={config} />;
}
