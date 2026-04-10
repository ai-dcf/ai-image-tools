'use client'

import React, { useState, useCallback, useRef } from 'react'
import Cropper from 'react-easy-crop'
import { ToolLayout } from '@/components/layout/ToolLayout'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import getCroppedImg from '@/lib/cropImage'
import { Upload, Download, Image as ImageIcon, RotateCw } from 'lucide-react'

const PRESETS = [
  { name: '自由 (Free)', value: undefined },
  { name: '朋友圈/头像 (1:1)', value: 1 / 1 },
  { name: '小红书 (3:4)', value: 3 / 4 },
  { name: '微信公众号首图 (2.35:1)', value: 2.35 / 1 },
  { name: '抖音 (9:16)', value: 9 / 16 },
]

export function CropCore() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(undefined)
  const [flip, setFlip] = useState({ horizontal: false, vertical: false })
  const [outputWidth, setOutputWidth] = useState<string>('')
  const [outputHeight, setOutputHeight] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null)
      })
      reader.readAsDataURL(file)
    }
  }

  const handleExport = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      const outputSize = {
        width: outputWidth ? parseInt(outputWidth, 10) : undefined,
        height: outputHeight ? parseInt(outputHeight, 10) : undefined,
      }
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        flip,
        outputSize
      )
      
      if (croppedImage) {
        const link = document.createElement('a')
        link.download = 'cropped-image.jpg'
        link.href = croppedImage
        link.click()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const preview = (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
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
        <div className="text-center p-6">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无图片</h3>
          <p className="text-sm text-gray-500 mb-4">请在右侧控制面板上传需要裁剪的图片</p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            选择图片
          </Button>
        </div>
      )}
    </div>
  )

  const config = (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">图片裁剪</h2>
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
          variant={imageSrc ? "outline" : "default"}
        >
          <Upload className="mr-2 h-4 w-4" />
          {imageSrc ? '重新上传图片' : '上传图片'}
        </Button>
      </div>

      {imageSrc && (
        <>
          <div className="space-y-4">
            <Label>裁剪比例</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset, idx) => (
                <Button
                  key={idx}
                  variant={aspect === preset.value ? "default" : "outline"}
                  onClick={() => setAspect(preset.value)}
                  className="w-full text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between">
              <Label>缩放</Label>
              <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(val: number | readonly number[]) => setZoom(Array.isArray(val) ? val[0] : (val as number))}
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
                onValueChange={(val: number | readonly number[]) => setRotation(Array.isArray(val) ? val[0] : (val as number))}
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
            <div className="flex justify-between">
              <Label>翻转</Label>
            </div>
            <div className="flex gap-4">
              <Button 
                variant={flip.horizontal ? "default" : "outline"} 
                onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                className="flex-1"
              >
                水平翻转
              </Button>
              <Button 
                variant={flip.vertical ? "default" : "outline"} 
                onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
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

          <div className="pt-6 border-t">
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              导出裁剪图片
            </Button>
          </div>
        </>
      )}
    </div>
  )

  return <ToolLayout preview={preview} config={config} />
}
