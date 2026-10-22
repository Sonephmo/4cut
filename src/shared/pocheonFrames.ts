/** Photo openings measured in a 1024 × 1536 frame coordinate space. */
export const POCHEON_FRAMES = [
  { id: "pocheon_1", name: "포천네것 · 마스코트", src: "pocheon/frame-1.png", example: "pocheon/frame-1-example.png", width: 1024, height: 1536,
    slots: [{ x: 66, y: 192, w: 425, h: 472, r: 20 }, { x: 535, y: 192, w: 425, h: 472, r: 20 }, { x: 66, y: 708, w: 425, h: 472, r: 20 }, { x: 535, y: 708, w: 425, h: 472, r: 20 }] },
  { id: "pocheon_2", name: "포천네것 · 자연", src: "pocheon/frame-2.png", example: "pocheon/frame-2-example.png", width: 1024, height: 1536,
    slots: [{ x: 78, y: 268, w: 417, h: 480, r: 24 }, { x: 530, y: 268, w: 417, h: 480, r: 24 }, { x: 78, y: 785, w: 417, h: 476, r: 24 }, { x: 530, y: 785, w: 417, h: 476, r: 24 }] },
] as const;

export const isPocheonFrame = (id: string) => POCHEON_FRAMES.some(frame => frame.id === id);

export function getPocheonFrame(id: string) {
  const frame = POCHEON_FRAMES.find(frame => frame.id === id);
  if (!frame) throw new Error(`Unknown Pocheon frame: ${id}`);
  return frame;
}
