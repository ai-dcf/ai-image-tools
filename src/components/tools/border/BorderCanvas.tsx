'use client';

import React, { forwardRef } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

export interface BorderSettings {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  color: string;
  radius: number;
}

interface BorderCanvasProps {
  imageUrl: string;
  settings: BorderSettings;
  containerWidth: number;
  containerHeight: number;
}

const BorderCanvas = forwardRef<Konva.Stage, BorderCanvasProps>(
  ({ imageUrl, settings, containerWidth, containerHeight }, ref) => {
    const [image] = useImage(imageUrl, 'anonymous');

    if (!image) return null;

    // 计算实际内容尺寸
    const contentWidth = image.width + settings.paddingLeft + settings.paddingRight;
    const contentHeight = image.height + settings.paddingTop + settings.paddingBottom;

    // 计算适合容器的缩放比例（留出40px边距）
    const maxStageWidth = Math.max(containerWidth - 40, 10);
    const maxStageHeight = Math.max(containerHeight - 40, 10);

    const scaleX = maxStageWidth / contentWidth;
    const scaleY = maxStageHeight / contentHeight;
    // 允许缩放，以在预览区域适应显示
    const scale = Math.min(scaleX, scaleY);

    const stageWidth = contentWidth * scale;
    const stageHeight = contentHeight * scale;

    return (
      <Stage
        width={stageWidth}
        height={stageHeight}
        scale={{ x: scale, y: scale }}
        ref={ref}
        className="shadow-md transition-all duration-300"
      >
        <Layer>
          {/* 背景边框 */}
          <Rect
            x={0}
            y={0}
            width={contentWidth}
            height={contentHeight}
            fill={settings.color}
            cornerRadius={settings.radius}
          />
          {/* 原图 */}
          <KonvaImage
            image={image}
            x={settings.paddingLeft}
            y={settings.paddingTop}
            width={image.width}
            height={image.height}
          />
        </Layer>
      </Stage>
    );
  }
);

BorderCanvas.displayName = 'BorderCanvas';

export default BorderCanvas;
