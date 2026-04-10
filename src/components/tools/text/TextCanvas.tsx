import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer, Label, Tag } from 'react-konva';
import useImage from 'use-image';

export interface TextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fontFamily: string;
  letterSpacing?: number;
  lineHeight?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  bgFill?: string;
  bgPadding?: number;
  bgRadius?: number;
  opacity?: number;
}

interface TextCanvasProps {
  imageSrc: string;
  texts: TextItem[];
  onChange: (id: string, newAttrs: TextItem) => void;
  onSelect: (id: string | null) => void;
  selectedId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stageRef: React.RefObject<any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextNode = ({ shapeProps, isSelected, onSelect, onChange }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapeRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const hasBg = !!shapeProps.bgFill;

  const handleDragEnd = (e: any) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    if (!node) return;
    const scaleX = node.scaleX();

    node.scaleX(1);
    node.scaleY(1);

    onChange({
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      fontSize: Math.max(5, (shapeProps.fontSize || 40) * scaleX),
    });
  };

  const commonProps = {
    x: shapeProps.x,
    y: shapeProps.y,
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    opacity: shapeProps.opacity !== undefined ? shapeProps.opacity : 1,
  };

  const textProps = {
    text: shapeProps.text,
    fontSize: shapeProps.fontSize,
    fill: shapeProps.fill,
    stroke: shapeProps.stroke,
    strokeWidth: shapeProps.strokeWidth,
    fontFamily: shapeProps.fontFamily,
    letterSpacing: shapeProps.letterSpacing || 0,
    lineHeight: shapeProps.lineHeight || 1,
  };

  const shadowProps = {
    shadowColor: shapeProps.shadowColor || 'transparent',
    shadowBlur: shapeProps.shadowBlur || 0,
    shadowOffsetX: shapeProps.shadowOffsetX || 0,
    shadowOffsetY: shapeProps.shadowOffsetY || 0,
  };

  return (
    <React.Fragment>
      {hasBg ? (
        <Label {...commonProps} ref={shapeRef}>
          <Tag
            fill={shapeProps.bgFill}
            cornerRadius={shapeProps.bgRadius || 0}
            {...shadowProps}
          />
          <Text
            {...textProps}
            padding={shapeProps.bgPadding || 0}
          />
        </Label>
      ) : (
        <Text
          {...commonProps}
          {...textProps}
          {...shadowProps}
          ref={shapeRef}
        />
      )}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      )}
    </React.Fragment>
  );
};

export default function TextCanvas({
  imageSrc,
  texts,
  onChange,
  onSelect,
  selectedId,
  stageRef,
}: TextCanvasProps) {
  const [image] = useImage(imageSrc, 'anonymous');
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && image) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const imageRatio = image.width / image.height;
        const containerRatio = containerWidth / containerHeight;

        let newWidth = containerWidth;
        let newHeight = containerHeight;
        let newScale = 1;

        if (imageRatio > containerRatio) {
          newWidth = containerWidth;
          newHeight = containerWidth / imageRatio;
          newScale = containerWidth / image.width;
        } else {
          newHeight = containerHeight;
          newWidth = containerHeight * imageRatio;
          newScale = containerHeight / image.height;
        }

        setStageSize({ width: newWidth, height: newHeight });
        setScale(newScale);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [image]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.hasName('backgroundImage');
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden">
      {image && stageSize.width > 0 && (
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <KonvaImage image={image} name="backgroundImage" />
            {texts.map((text) => (
              <TextNode
                key={text.id}
                shapeProps={text}
                isSelected={text.id === selectedId}
                onSelect={() => onSelect(text.id)}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(newAttrs: any) => {
                  onChange(text.id, newAttrs);
                }}
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
}
