import { getPocheonCaptureCrop, isPocheonFrame } from "../shared/pocheonFrames";

/** Store the same centered, mirrored area displayed by the camera viewport. */
export function captureCameraFrame(source: CanvasImageSource, sourceWidth: number, sourceHeight: number, frameId: string) {
  if (sourceWidth <= 0 || sourceHeight <= 0) throw new Error("VIDEO_NOT_READY");
  const crop = isPocheonFrame(frameId) ? getPocheonCaptureCrop(frameId, sourceWidth, sourceHeight) : null;
  const canvas = document.createElement("canvas");
  canvas.width = crop?.outputWidth ?? sourceWidth;
  canvas.height = crop?.outputHeight ?? sourceHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_CONTEXT_FAIL");
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  if (crop) {
    context.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, canvas.width, canvas.height);
  } else {
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
  }
  return canvas;
}
