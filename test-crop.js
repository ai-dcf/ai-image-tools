function getPixelCrop(imageW, imageH, cropX, cropY, zoom, rotation, flipH) {
  // Mock react-easy-crop logic
  const rotRad = (rotation * Math.PI) / 180;
  const bBoxW = Math.abs(Math.cos(rotRad) * imageW) + Math.abs(Math.sin(rotRad) * imageH);
  const bBoxH = Math.abs(Math.sin(rotRad) * imageW) + Math.abs(Math.cos(rotRad) * imageH);
  
  // Crop window size on screen
  const cropSizeW = 100;
  const cropSizeH = 100;
  
  // Center of image on screen is at cropX, cropY
  // Top-left of crop window relative to top-left of image on screen
  const pointX = (bBoxW * zoom - cropSizeW) / 2 - cropX;
  const pointY = (bBoxH * zoom - cropSizeH) / 2 - cropY;
  
  // Convert to original resolution
  return {
    x: pointX / zoom,
    y: pointY / zoom,
    width: cropSizeW / zoom,
    height: cropSizeH / zoom
  };
}

const imageW = 200;
const imageH = 200;
const flipH = true;
const zoom = 1;
const rotation = 0;
const cropX = -50; // panning left by 50px
const cropY = 0;

const pixelCrop = getPixelCrop(imageW, imageH, cropX, cropY, zoom, rotation, flipH);
console.log("pixelCrop:", pixelCrop);
