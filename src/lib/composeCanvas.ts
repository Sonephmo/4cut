import { AC_FRAME } from "../shared/animalCrossingFrame";
import { asset } from "../design/asset";
import type { StickerPlacement } from "../shared/types";

/**
 * 인쇄 canvas: 4×6 인치(10.16cm×15.24cm) 용지.
 * preview 287×432 × 4 = 1148×1728 (≈287dpi, 실사용 인쇄 품질 충분).
 */
const TEMPLATE = {
  canvas: { w: 1148, h: 1728 },
  slots: [
    { id: "TL", x:  40, y:  36, w: 516, h: 560 },
    { id: "TR", x: 592, y:  36, w: 516, h: 560 },
    { id: "BL", x:  40, y: 632, w: 516, h: 556 },
    { id: "BR", x: 592, y: 632, w: 516, h: 556 }
  ],
  fillOrder: ["TL", "TR", "BL", "BR"] as const
} as const;

const PREVIEW_REF_W = 287;
const S = TEMPLATE.canvas.w / PREVIEW_REF_W; // 1148/287 ≈ 4

type IconInfo = {
  src: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

type FrameConfig = {
  bgColor: string;
  textColor: string;
  icon1?: IconInfo;
  icon2?: IconInfo;
  quote?: string;
};

/**
 * electron/composer.ts · FramePreview 와 동기화.
 * 모든 icon 좌표는 4×6(287×432) preview 좌표계 기준.
 */
const FRAME_DATA: Record<string, FrameConfig> = {
  basic_001: { bgColor: "#ffce4c", textColor: "#000" },
  basic_black: { bgColor: "#2b2b2b", textColor: "#fff" },
  basic_white: { bgColor: "#f5f0e8", textColor: "#372a15" },

  designed_default: { bgColor: "#5c5c5c", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },

  // 14종 커스텀 컬러 (DESIGN 화면용)
  color_FFFFFF: { bgColor: "#FFFFFF", textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_F3EBD5: { bgColor: "#F3EBD5", textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_FF8C8F: { bgColor: "#FF8C8F", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_C8FD9A: { bgColor: "#C8FD9A", textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_EAAAFF: { bgColor: "#EAAAFF", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_FFFF94: { bgColor: "#FFFF94", textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_83BEFE: { bgColor: "#83BEFE", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_000000: { bgColor: "#000000", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_5C5C5C: { bgColor: "#5C5C5C", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_C10000: { bgColor: "#C10000", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_63CA7D: { bgColor: "#63CA7D", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_9F8EFF: { bgColor: "#9F8EFF", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_FFCF8B: { bgColor: "#FFCF8B", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_5656FF: { bgColor: "#5656FF", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },

  designed_경영: {
    bgColor: "#f3ebd5", textColor: "#fff",
    icon1: { src: "frame-icons/biz-1.png", top: 289, left: 149, width: 52, height: 53 },
    icon2: { src: "frame-icons/biz-2.png", top: 120, left:  87, width: 57, height: 54 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_ai: {
    bgColor: "#5d8fc5", textColor: "#fff",
    icon1: { src: "frame-icons/ai-1.png", top: 310, left: 109, width: 33, height: 33 },
    icon2: { src: "frame-icons/ai-2.png", top: 138, left: 153, width: 29, height: 35 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_보건: {
    bgColor: "#608c6b", textColor: "#fff",
    icon1: { src: "frame-icons/dh-1.png", top: 130, left:   7, width: 44, height: 45 },
    icon2: { src: "frame-icons/dh-2.png", top: 302, left: 144, width: 44, height: 44 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_간호: {
    bgColor: "#e26164", textColor: "#fff",
    icon1: { src: "frame-icons/nurse-1.png", top: 281, left: 227, width: 64, height: 74 },
    icon2: { src: "frame-icons/nurse-2.png", top: 126, left:   0, width: 48, height: 50 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_mc: {
    bgColor: "#5c5c5c", textColor: "#fff",
    icon1: { src: "frame-icons/media-1.png", top: 112, left: 223, width: 62, height: 65 },
    icon2: { src: "frame-icons/media-2.png", top: 298, left:   0, width: 49, height: 49 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_상심: {
    bgColor: "#fae1e2", textColor: "#fff",
    icon1: { src: "frame-icons/counseling-1.png", top: 132, left: 107, width: 35, height: 43 },
    icon2: { src: "frame-icons/counseling-2.png", top: 303, left: 152, width: 34, height: 40 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_약학: {
    bgColor: "#412626", textColor: "#fff",
    icon1: { src: "frame-icons/pharm-1.png", top: 310, left: 114, width: 29, height: 36 },
    icon2: { src: "frame-icons/pharm-2.png", top: 142, left: 142, width: 35, height: 38 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_바식: {
    bgColor: "#28496c", textColor: "#fff",
    icon1: { src: "frame-icons/bio-1.png", top: 309, left: 111, width: 36, height: 39 },
    icon2: { src: "frame-icons/bio-2.png", top: 137, left: 142, width: 38, height: 42 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_세유: {
    bgColor: "#944542", textColor: "#fff",
    icon1: { src: "frame-icons/cell-1.png", top: 108, left:  98, width: 41, height: 41 },
    icon2: { src: "frame-icons/cell-2.png", top: 257, left: 147, width: 40, height: 40 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },
  designed_시생: {
    bgColor: "#521e1e", textColor: "#fff",
    icon1: { src: "frame-icons/sys-1.png", top: 134, left: 249, width: 36, height: 47 },
    icon2: { src: "frame-icons/sys-2.png", top: 309, left: 108, width: 34, height: 38 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"'
  },

  /** 동물의 숲 모드 · 인쇄 합성 (단일 사진 + 로고) */
  ac_동숲: {
    bgColor: "#52C482",
    textColor: "#1e3d2f",
  }
};


function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`IMAGE_LOAD_FAIL: ${src}`));
    img.src = src;
  });
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/** object-fit: cover */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const ir = img.naturalWidth / img.naturalHeight;
  const wr = dw / dh;
  let sx: number;
  let sy: number;
  let sw: number;
  let sh: number;
  if (ir > wr) {
    sh = img.naturalHeight;
    sw = sh * wr;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / wr;
    sx = 0;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawSlotPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  slot: { x: number; y: number; w: number; h: number; radius?: number }
) {
  const r = slot.radius && slot.radius > 0 ? slot.radius : 0;
  if (r > 0) {
    ctx.save();
    roundRectPath(ctx, slot.x, slot.y, slot.w, slot.h, r);
    ctx.clip();
    drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
    ctx.restore();
  } else {
    drawImageCover(ctx, img, slot.x, slot.y, slot.w, slot.h);
  }
}

/**
 * Footer 텍스트(quote / brand)를 4×6(preview 287×432) 기준 좌표로 배치.
 * - quote : "Gowun Dodum" 24px(display) → 13px(logical)
 * - brand : "Eulyoo1945"  32px(display) → 17px(logical)
 */
function drawFooter(
  ctx: CanvasRenderingContext2D,
  textColor: string,
  quote: string | undefined
) {
  type Box = { x: number; y: number; w: number; h: number };

  const quoteBox: Box = { x: 33, y: 348, w: 220, h: 29 };
  const brandBox: Box = { x: 88, y: 371, w: 111, h: 22 };

  const toCanvas = (b: Box) => ({
    cx: (b.x + b.w / 2) * S,
    cy: (b.y + b.h / 2) * S
  });

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = textColor;

  if (quote) {
    const { cx, cy } = toCanvas(quoteBox);
    ctx.font = `400 ${13 * S}px "Gowun Dodum", "Malgun Gothic", sans-serif`;
    ctx.fillText(quote, cx, cy);
  }

  {
    const { cx, cy } = toCanvas(brandBox);
    ctx.font = `400 ${17 * S}px "Eulyoo1945", "Malgun Gothic", "Apple SD Gothic Neo", serif`;
    ctx.fillText("2026 해솔네컷", cx, cy);
  }
}

/**
 * 선택한 4장(blob URL 또는 http URL)을 합성해 JPEG Blob으로 반환.
 * @param stickerPlacements - designed 프레임용 사용자 배치 스티커 배열 (없으면 FRAME_DATA icons 사용)
 */
export async function composeFinalImageBlob(
  imageUrls: string[],
  frameId: string,
  stickerPlacements?: StickerPlacement[]
): Promise<Blob> {
  if (imageUrls.length !== 4) {
    throw new Error("SELECTED_PATHS_MUST_BE_4");
  }

  const cfg = FRAME_DATA[frameId] ?? FRAME_DATA["basic_001"];
  const slotById = new Map(TEMPLATE.slots.map((s) => [s.id, s]));

  const photoImages = await Promise.all(imageUrls.map((u) => loadImage(u)));

  // 아이콘 로드: stickerPlacements 배열이 있으면 사용자 스티커만, 없으면 FRAME_DATA icons
  const iconLoadTargets: Array<{ src: string; x: number; y: number; w: number; h: number }> = [];

  if (stickerPlacements && stickerPlacements.length > 0) {
    for (const sp of stickerPlacements) {
      iconLoadTargets.push({
        src: asset(sp.src),
        x: Math.round(sp.x * S),
        y: Math.round(sp.y * S),
        w: Math.round(sp.w * S),
        h: Math.round(sp.h * S),
      });
    }
  } else {
    for (const iconKey of ["icon1", "icon2"] as const) {
      const icon = cfg[iconKey];
      if (icon) {
        iconLoadTargets.push({
          src: asset(icon.src),
          x: Math.round(icon.left * S),
          y: Math.round(icon.top * S),
          w: Math.round(icon.width * S),
          h: Math.round(icon.height * S),
        });
      }
    }
  }

  const iconImages = await Promise.all(
    iconLoadTargets.map((t) =>
      loadImage(t.src)
        .then((img) => ({ img, x: t.x, y: t.y, w: t.w, h: t.h }))
        .catch(() => null)
    )
  );

  const canvas = document.createElement("canvas");
  canvas.width = TEMPLATE.canvas.w;
  canvas.height = TEMPLATE.canvas.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("CANVAS_CONTEXT_FAIL");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.fillStyle = cfg.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < TEMPLATE.fillOrder.length; i++) {
    const slotId = TEMPLATE.fillOrder[i];
    const slot = slotById.get(slotId);
    const img = photoImages[i];
    if (!slot || !img) continue;
    drawSlotPhoto(ctx, img, slot);
  }

  for (const res of iconImages) {
    if (!res) continue;
    const nw = res.img.naturalWidth;
    const nh = res.img.naturalHeight;
    if (nw > 0 && nh > 0) {
      // object-fit: contain 동일 로직 — SVG 고유 비율 유지
      const naturalAspect = nw / nh;
      const targetAspect  = res.w / res.h;
      let drawW = res.w, drawH = res.h;
      let drawX = res.x, drawY = res.y;
      if (naturalAspect > targetAspect) {
        // 이미지가 목표보다 가로로 넓음 → 너비에 맞추고 세로 중앙 정렬
        drawH = res.w / naturalAspect;
        drawY = res.y + (res.h - drawH) / 2;
      } else {
        // 이미지가 목표보다 세로로 길음 → 높이에 맞추고 가로 중앙 정렬
        drawW = res.h * naturalAspect;
        drawX = res.x + (res.w - drawW) / 2;
      }
      ctx.drawImage(res.img, drawX, drawY, drawW, drawH);
    } else {
      ctx.drawImage(res.img, res.x, res.y, res.w, res.h);
    }
  }

  drawFooter(ctx, cfg.textColor, cfg.quote);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("BLOB_FAIL")); return; }
        resolve(blob);
      },
      "image/png"
    );
  });
}

/**
 * BIO 모드: 프레임 PNG를 배경으로 깔고 사진 4장을 슬롯에 합성해 인쇄용 PNG 반환.
 * Select 화면 Figma 좌표(1080×1920) 기준으로 프레임 영역(626×908)을 추출해 스케일.
 * 인쇄 해상도: 626×4=2504, 908×4=3632
 */
export async function composeBioPrint(
  imageUrls: string[],
  frameId: "bh_bio_black" | "bh_bio_pink"
): Promise<Blob> {
  if (imageUrls.length !== 4) throw new Error("SELECTED_PATHS_MUST_BE_4");

  // Figma 프레임 영역 논리 크기 (Select 화면 기준)
  const FRAME_W = 626;
  const FRAME_H = 908;
  const BIO_S = 4; // 인쇄 배율 → 2504×3632
  const cw = FRAME_W * BIO_S;
  const ch = FRAME_H * BIO_S;

  // 슬롯 좌표: Figma 절대좌표 - 프레임 origin(227,52) = 프레임 내 상대좌표
  // Select1~4: (289-227,107-52)=(62,55), (540-227,107-52)=(313,55), (289-227,471-52)=(62,419), (540-227,471-52)=(313,419)
  const BIO_SLOTS = [
    { x:  62, y:  55, w: 251, h: 353 },
    { x: 313, y:  55, w: 251, h: 353 },
    { x:  62, y: 419, w: 251, h: 353 },
    { x: 313, y: 419, w: 251, h: 353 },
  ];

  const frameSrc = frameId === "bh_bio_pink"
    ? asset("bh_bio_frame/Frame_pink.png")
    : asset("bh_bio_frame/네컷프레임2_블랙_수정2 1.png");

  const [frameImg, ...photoImgs] = await Promise.all([
    loadImage(frameSrc),
    ...imageUrls.map((u) => loadImage(u)),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAIL");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // 1. 사진 먼저
  for (let i = 0; i < BIO_SLOTS.length; i++) {
    const slot = BIO_SLOTS[i];
    const img = photoImgs[i];
    if (!img) continue;
    drawSlotPhoto(ctx, img, {
      x: slot.x * BIO_S,
      y: slot.y * BIO_S,
      w: slot.w * BIO_S,
      h: slot.h * BIO_S,
    });
  }

  // 2. 프레임 PNG 위에 덮기
  ctx.drawImage(frameImg, 0, 0, cw, ch);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("BLOB_FAIL")); return; }
        resolve(blob);
      },
      "image/png"
    );
  });
}

/** Compose the shared 4×6 layout at 300 dpi (1200×1800). */
export async function composeAnimalCrossingPrint(imageUrl: string): Promise<Blob> {
  const scale = 1200 / AC_FRAME.width;
  const [main, logo] = await Promise.all([
    loadImage(imageUrl),
    loadImage(asset(AC_FRAME.logoSrc)),
    document.fonts.load('64px "' + AC_FRAME.font + '"', "모여봐요차대의숲").then((fonts) => {
      if (!fonts.length) throw new Error("AC_LOGO_FONT_LOAD_FAIL");
    }),
  ]);
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1800;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_CONTEXT_FAIL");
  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = AC_FRAME.background;
  ctx.fillRect(0, 0, AC_FRAME.width, AC_FRAME.height);
  const p = AC_FRAME.photo;
  drawImageCover(ctx, main, p.x, p.y, p.w, p.h);
  const l = AC_FRAME.logo;
  ctx.drawImage(logo, l.x, l.y, l.w, l.h);

  // Render lettering at print resolution instead of enlarging a small raster logo.
  ctx.fillStyle = AC_FRAME.textColor;
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowOffsetY = 4 * scale;
  ctx.shadowBlur = 4 * scale;
  for (const label of AC_FRAME.labels) {
    ctx.font = label.size + 'px "' + AC_FRAME.font + '"';
    const chars = Array.from(label.text);
    const spacing = label.size * label.spacing;
    // Center visible lettering without a trailing letter-spacing advance.
    const width = chars.reduce((sum, char) => sum + ctx.measureText(char).width, 0) + spacing * (chars.length - 1);
    let x = label.x + (label.w - width) / 2;
    for (const char of chars) {
      ctx.fillText(char, x, label.y + label.h / 2);
      x += ctx.measureText(char).width + spacing;
    }
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error("BLOB_FAIL")); return; }
      resolve(blob);
    }, "image/png");
  });
}
