import { useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { PresetType, CollageSettings } from "./CollageCore";

interface CollageCanvasProps {
  images: string[];
  preset: PresetType;
  settings: CollageSettings;
}

export default function CollageCanvas({ images, preset, settings }: CollageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDownload = async () => {
      if (containerRef.current) {
        try {
          const canvas = await html2canvas(containerRef.current, {
            backgroundColor: settings.backgroundColor,
            useCORS: true,
            scale: 3, // High quality
            logging: false,
          });
          const url = canvas.toDataURL("image/png", 1.0);
          const link = document.createElement("a");
          link.download = `collage-${Date.now()}.png`;
          link.href = url;
          link.click();
        } catch (error) {
          console.error("Failed to generate collage:", error);
        }
      }
    };

    window.addEventListener("download-collage", handleDownload);
    return () => window.removeEventListener("download-collage", handleDownload);
  }, [settings.backgroundColor]);

  // If no images, show nothing
  if (images.length === 0) return null;

  const containerStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor,
    backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    position: "relative",
  };

  const renderGrid = () => {
    // Up to 9 images
    const gridImages = images.slice(0, 9);
    // Determine rows/cols based on count
    let cols = 3;
    if (gridImages.length === 1) cols = 1;
    else if (gridImages.length === 2 || gridImages.length === 4) cols = 2;
    else cols = 3;

    return (
      <div
        ref={containerRef}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: `${settings.gap}px`,
          padding: `${settings.gap}px`,
          width: "100%",
          aspectRatio: "1 / 1",
          ...containerStyle,
        }}
      >
        {gridImages.map((img, i) => (
          <div
            key={i}
            style={{
              borderRadius: `${settings.borderRadius}px`,
              overflow: "hidden",
              position: "relative",
              width: "100%",
              height: "100%",
              backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
          </div>
        ))}
      </div>
    );
  };

  const renderCompare = () => {
    // Exactly 2 images side by side
    const compareImages = images.slice(0, 2);
    // Pad with empty strings if less than 2
    while (compareImages.length < 2) compareImages.push("");

    return (
      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: `${settings.gap}px`,
          padding: `${settings.gap}px`,
          width: "100%",
          aspectRatio: "16 / 9",
          ...containerStyle,
        }}
      >
        {compareImages.map((img, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              borderRadius: `${settings.borderRadius}px`,
              overflow: "hidden",
              backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
            ) : (
              <span style={{ color: "#9ca3af", fontSize: "14px" }}>等待图片...</span>
            )}
          </div>
        ))}
        {/* VS Element */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10,
            width: "48px",
            height: "48px",
            backgroundColor: "#fff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
            color: "#1f2937",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            border: "2px solid #f3f4f6",
          }}
        >
          VS
        </div>
      </div>
    );
  };

  const renderXiaohongshu = () => {
    // 3:4 aspect ratio. Layout depends on image count (max 4 for this simple logic).
    const xhsImages = images.slice(0, 4);

    return (
      <div
        ref={containerRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${settings.gap}px`,
          padding: `${settings.gap}px`,
          width: "100%",
          maxWidth: "400px", // constrain width to look like a phone screen somewhat
          aspectRatio: "3 / 4",
          ...containerStyle,
        }}
      >
        {xhsImages.length === 1 && (
          <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={xhsImages[0]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
          </div>
        )}

        {xhsImages.length === 2 && (
          <>
            <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={xhsImages[0]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
            </div>
            <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={xhsImages[1]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
            </div>
          </>
        )}

        {xhsImages.length === 3 && (
          <>
            <div style={{ flex: 2, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={xhsImages[0]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
            </div>
            <div style={{ flex: 1, display: "flex", gap: `${settings.gap}px` }}>
              <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={xhsImages[1]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
              </div>
              <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={xhsImages[2]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
              </div>
            </div>
          </>
        )}

        {xhsImages.length >= 4 && (
          <>
            <div style={{ flex: 1, display: "flex", gap: `${settings.gap}px` }}>
              <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={xhsImages[0]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
              </div>
              <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={xhsImages[1]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", gap: `${settings.gap}px` }}>
              <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={xhsImages[2]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
              </div>
              <div style={{ flex: 1, borderRadius: `${settings.borderRadius}px`, overflow: "hidden", backgroundColor: settings.backgroundImage ? "transparent" : "#f3f4f6" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={xhsImages[3]} alt="" style={{ width: "100%", height: "100%", objectFit: settings.objectFit, display: "block" }} />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  switch (preset) {
    case "grid":
      return renderGrid();
    case "compare":
      return renderCompare();
    case "xiaohongshu":
      return renderXiaohongshu();
    default:
      return renderGrid();
  }
}
