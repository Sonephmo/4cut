/** Figma F_Picture_Layout Frame1–4. Shared by screen preview and 300 dpi print. */
export const HOMECOMING_FRAMES = [
  { id: "homecoming_1", name: "의미있는 밤 · 네이비", src: "homecoming/frame-1.png", width: 354, height: 531,
    slots: [{ x: 17, y: 16, w: 157, h: 197 }, { x: 179, y: 16, w: 157, h: 197 }, { x: 17, y: 217, w: 157, h: 197 }, { x: 179, y: 217, w: 157, h: 197 }] },
  { id: "homecoming_2", name: "의미있는 밤 · 필름", src: "homecoming/frame-2.png", width: 354, height: 531,
    slots: [{ x: 15, y: 48, w: 154, h: 193 }, { x: 182, y: 48, w: 154, h: 193 }, { x: 15, y: 251, w: 154, h: 193 }, { x: 182, y: 251, w: 154, h: 193 }] },
  { id: "homecoming_3", name: "의미있는 밤 · 블루", src: "homecoming/frame-3.png", width: 357, height: 536,
    slots: [{ x: 17, y: 16, w: 158, h: 199 }, { x: 183, y: 16, w: 158, h: 199 }, { x: 17, y: 221, w: 158, h: 199 }, { x: 183, y: 221, w: 158, h: 199 }] },
  { id: "homecoming_4", name: "의미있는 밤 · 메모리즈", src: "homecoming/frame-4.png", width: 357, height: 536,
    slots: [{ x: 16, y: 54, w: 158, h: 199 }, { x: 183, y: 53, w: 159, h: 200 }, { x: 16, y: 262, w: 158, h: 199 }, { x: 183, y: 253, w: 159, h: 200 }] },
] as const;

export function getHomecomingFrame(id: string) {
  const frame = HOMECOMING_FRAMES.find(frame => frame.id === id);
  if (!frame) throw new Error(`Unknown homecoming frame: ${id}`);
  return frame;
}

export const isHomecomingFrame = (id: string) => id.startsWith("homecoming_");
