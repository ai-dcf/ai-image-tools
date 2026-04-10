import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
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

  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            fontSize: Math.max(5, node.fontSize() * scaleX),
          });
        }}
      />
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
