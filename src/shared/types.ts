export type AppStep =
  | "MAIN"
  | "FRAME_CONFIRM"
  | "QUANTITY"
  | "CAMERA_GUIDE"
  | "SHOOTING"
  | "SELECT"
  | "DESIGN"
  | "LOADING"
  | "PRINTING"
  | "END"
  // ── 동숲 모드 전용 스텝 ──
  | "AC_CAMERA_GUIDE"
  | "AC_SHOOTING"
  | "AC_SELECT"
  | "AC_TRANSFORMING"
  | "AC_RESULT";

/** 287×432 논리 좌표계(프리뷰 좌표)에서의 스티커 배치 정보 */
export type StickerPlacement = {
  src: string;   // design-assets 상대 경로 (예: "frame-icons/nurse-1.png")
  x: number;     // 스티커 좌상단 x (287px 기준)
  y: number;     // 스티커 좌상단 y (432px 기준)
  w: number;     // 스티커 표시 폭
  h: number;     // 스티커 표시 높이
};

export type Shot = {
  index: number;
  captured: boolean;
  previewUrl: string | null;
  localPath: string | null;
  selectedOrder: number | null;
};

export type Session = {
  uuid: string;
  frameId: string;
  copies: number;
  createdAt: string;
};

export type JobStatus = "QUEUED" | "COMPOSING" | "PRINTING" | "DONE" | "FAILED_PRINT";

export type JobSnapshot = {
  uuid: string;
  status: JobStatus;
  progress: number;
  errorMessage?: string;
};
