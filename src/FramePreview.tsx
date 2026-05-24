import { asset } from "./design/asset";
import type { Shot } from "./shared/types";

type IconInfo = {
  src: string;
  top: number;
  left: number;
  width: number;
  height: number;
};

type FrameInfo = {
  bgColor: string;
  label: string;
  textColor: string;
  icon1?: IconInfo;
  icon2?: IconInfo;
  quote?: string;
};

/**
 * 좌표계: 4×6 인치(10.16cm×15.24cm) 용지 기준 287×432px.
 */
export const FRAME_DATA: Record<string, FrameInfo> = {
  basic_001:   { bgColor: "#ffce4c", label: "BASIC FRAME",         textColor: "#000" },
  basic_black: { bgColor: "#2b2b2b", label: "BASIC FRAME (BLACK)", textColor: "#fff" },
  basic_white: { bgColor: "#f5f0e8", label: "BASIC FRAME (WHITE)", textColor: "#372a15" },

  /** SELECT 화면에서 designed 프레임 기본 프리뷰용 (컬러 미선택 상태) */
  designed_default: { bgColor: "#5c5c5c", label: "DESIGNED FRAME", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },

  // ── DESIGN 화면 커스텀 컬러 14종 (Figma 배치 순서) ──
  color_FFFFFF: { bgColor: "#FFFFFF", label: "화이트",   textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_F3EBD5: { bgColor: "#F3EBD5", label: "크림",     textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_FF8C8F: { bgColor: "#FF8C8F", label: "핑크",     textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_C8FD9A: { bgColor: "#C8FD9A", label: "라임",     textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_EAAAFF: { bgColor: "#EAAAFF", label: "라벤더",   textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_FFFF94: { bgColor: "#FFFF94", label: "옐로우",   textColor: "#000", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_83BEFE: { bgColor: "#83BEFE", label: "스카이",   textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_000000: { bgColor: "#000000", label: "블랙",     textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_5C5C5C: { bgColor: "#5C5C5C", label: "그레이",   textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_C10000: { bgColor: "#C10000", label: "레드",     textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_63CA7D: { bgColor: "#63CA7D", label: "그린",     textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_9F8EFF: { bgColor: "#9F8EFF", label: "바이올렛", textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_FFCF8B: { bgColor: "#FFCF8B", label: "피치",     textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },
  color_5656FF: { bgColor: "#5656FF", label: "블루",     textColor: "#fff", quote: '"CHAllenge,  CHAnce,  CHAnge"' },

  designed_경영: {
    bgColor: "#f3ebd5", label: "경영학과", textColor: "#fff",
    icon1: { src: "frame-icons/biz-1.png",  top: 289, left: 149, width: 52, height: 53 },
    icon2: { src: "frame-icons/biz-2.png",  top: 120, left:  87, width: 57, height: 54 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_ai: {
    bgColor: "#5d8fc5", label: "AI의료데이터", textColor: "#fff",
    icon1: { src: "frame-icons/ai-1.png",  top: 310, left: 109, width: 33, height: 33 },
    icon2: { src: "frame-icons/ai-2.png",  top: 138, left: 153, width: 29, height: 35 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_보건: {
    bgColor: "#608c6b", label: "디지털보건의료", textColor: "#fff",
    icon1: { src: "frame-icons/dh-1.png",  top: 130, left:   7, width: 44, height: 45 },
    icon2: { src: "frame-icons/dh-2.png",  top: 302, left: 144, width: 44, height: 44 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_간호: {
    bgColor: "#e26164", label: "간호학과", textColor: "#fff",
    icon1: { src: "frame-icons/nurse-1.png", top: 281, left: 227, width: 64, height: 74 },
    icon2: { src: "frame-icons/nurse-2.png", top: 126, left:   0, width: 48, height: 50 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_mc: {
    bgColor: "#5c5c5c", label: "미디어커뮤니케이션", textColor: "#fff",
    icon1: { src: "frame-icons/media-1.png", top: 112, left: 223, width: 62, height: 65 },
    icon2: { src: "frame-icons/media-2.png", top: 298, left:   0, width: 49, height: 49 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_상심: {
    bgColor: "#fae1e2", label: "상담심리학과", textColor: "#fff",
    icon1: { src: "frame-icons/counseling-1.png", top: 132, left: 107, width: 35, height: 43 },
    icon2: { src: "frame-icons/counseling-2.png", top: 303, left: 152, width: 34, height: 40 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_약학: {
    bgColor: "#412626", label: "약학대학", textColor: "#fff",
    icon1: { src: "frame-icons/pharm-1.png", top: 310, left: 114, width: 29, height: 36 },
    icon2: { src: "frame-icons/pharm-2.png", top: 142, left: 142, width: 35, height: 38 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_바식: {
    bgColor: "#28496c", label: "바이오식의약학", textColor: "#fff",
    icon1: { src: "frame-icons/bio-1.png", top: 309, left: 111, width: 36, height: 39 },
    icon2: { src: "frame-icons/bio-2.png", top: 137, left: 142, width: 38, height: 42 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_세유: {
    bgColor: "#944542", label: "세포·유전자재생의학", textColor: "#fff",
    icon1: { src: "frame-icons/cell-1.png", top: 108, left:  98, width: 41, height: 41 },
    icon2: { src: "frame-icons/cell-2.png", top: 257, left: 147, width: 40, height: 40 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },
  designed_시생: {
    bgColor: "#521e1e", label: "시스템생명과학", textColor: "#fff",
    icon1: { src: "frame-icons/sys-1.png", top: 134, left: 249, width: 36, height: 47 },
    icon2: { src: "frame-icons/sys-2.png", top: 309, left: 108, width: 34, height: 38 },
    quote: '"CHAllenge,  CHAnce,  CHAnge"',
  },

  /** 동숲 모드 SELECT 프리뷰 */
  ac_동숲: {
    bgColor: "#cfead8",
    label: "Animal Forest",
    textColor: "#1e3d2f",
    quote: '"놀러오세요 차대의 숲"',
  },
};

// 4 photo slots (4×6 용지 기준, 모든 프레임 공통)
const PHOTO_SLOTS = [
  { id: "TL", top:   9, left:  10, width: 129, height: 140 },
  { id: "TR", top:   9, left: 148, width: 129, height: 140 },
  { id: "BL", top: 158, left:  10, width: 129, height: 139 },
  { id: "BR", top: 158, left: 148, width: 129, height: 139 },
];

type Props = {
  frameId: string;
  selectedShots: Shot[];
  /** true 시 icon1/icon2 렌더링 생략 (SELECT 화면의 designed 프레임 프리뷰 등) */
  hideIcons?: boolean;
  /** 동숲: 1장만 큰 슬롯에 표시 */
  animalCrossingSinglePhoto?: boolean;
};

// 동숲 모드 단일 슬롯 (287×432 기준)
const AC_SINGLE_SLOT = { top: 72, left: 34, width: 219, height: 304 };

export function FramePreview({ frameId, selectedShots, hideIcons = false, animalCrossingSinglePhoto = false }: Props) {
  const info = FRAME_DATA[frameId] ?? FRAME_DATA["basic_001"];

  const firstSelected = selectedShots[0];

  if (animalCrossingSinglePhoto) {
    return (
      <div className="framePreview" style={{ backgroundColor: info.bgColor }}>
        <div
          className="framePreview__slot"
          style={{
            position: "absolute",
            top: AC_SINGLE_SLOT.top,
            left: AC_SINGLE_SLOT.left,
            width: AC_SINGLE_SLOT.width,
            height: AC_SINGLE_SLOT.height,
            backgroundColor: "#fff",
            overflow: "hidden",
            borderRadius: 18,
          }}
        >
          {firstSelected?.previewUrl && (
            <img
              src={firstSelected.previewUrl}
              alt="preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
        {info.quote && (
          <span className="framePreview__quote" style={{ color: info.textColor }}>
            {info.quote}
          </span>
        )}
        <span className="framePreview__brand" style={{ color: info.textColor }}>
          2026 해솔네컷
        </span>
      </div>
    );
  }

  return (
    <div className="framePreview" style={{ backgroundColor: info.bgColor }}>
      {/* Photo slots */}
      {PHOTO_SLOTS.map((slot, idx) => {
        const shot = selectedShots[idx];
        return (
          <div
            key={slot.id}
            className="framePreview__slot"
            style={{
              position: "absolute",
              top: slot.top,
              left: slot.left,
              width: slot.width,
              height: slot.height,
              backgroundColor: "#fff",
              overflow: "hidden",
            }}
          >
            {shot?.previewUrl && (
              <img
                src={shot.previewUrl}
                alt={`slot-${slot.id}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        );
      })}

      {/* Character icons (hideIcons=true 시 스킵) */}
      {!hideIcons && info.icon1 && (
        <img
          src={asset(info.icon1.src)}
          alt=""
          style={{
            position: "absolute",
            top: info.icon1.top,
            left: info.icon1.left,
            width: info.icon1.width,
            height: info.icon1.height,
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}
      {!hideIcons && info.icon2 && (
        <img
          src={asset(info.icon2.src)}
          alt=""
          style={{
            position: "absolute",
            top: info.icon2.top,
            left: info.icon2.left,
            width: info.icon2.width,
            height: info.icon2.height,
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Footer */}
      {info.quote && (
        <span className="framePreview__quote" style={{ color: info.textColor }}>
          {info.quote}
        </span>
      )}
      <span className="framePreview__brand" style={{ color: info.textColor }}>
        2026 해솔네컷
      </span>
    </div>
  );
}
