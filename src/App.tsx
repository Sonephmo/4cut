import { useEffect, useMemo, useRef, useState } from "react";
import { asset } from "./design/asset";
import { FramePreview } from "./FramePreview";
import { composeAnimalCrossingPrint, composeBioPrint, composeFinalImageBlob } from "./lib/composeCanvas";
import { transformAnimalCrossingImage } from "./lib/acImageTransform";
import { getSupabase, getSavedSupabaseConfig, saveSupabaseConfig } from "./lib/supabaseClient";
import type { AppStep, JobSnapshot, Session, Shot, StickerPlacement } from "./shared/types";

const SHOT_TOTAL = 6;
const SELECT_TOTAL = 4;
const SHOT_TOTAL_DEFAULT = 6;
const SELECT_TOTAL_DEFAULT = 4;
/** 동물의 숲 모드 */
const SHOT_TOTAL_AC = 3;
const SELECT_TOTAL_AC = 1;
const FRAME_ID_AC = "ac_동숲";
/** BH Bio 모드 */
const SHOT_TOTAL_BIO = 6;
const SELECT_TOTAL_BIO = 4;

function isAnimalCrossingFrame(fid: string): boolean {
  return fid.startsWith("ac_");
}

const COUNTDOWN_SECONDS = 5;
const GAP_SECONDS = 2;

/** DESIGN 화면 컬러 팔레트 (Figma 279:120 배치 순서, 2행×7열) */
const COLOR_OPTIONS = [
  // Row 1
  { key: "color_FFFFFF", label: "화이트",   bgColor: "#FFFFFF" },
  { key: "color_F3EBD5", label: "크림",     bgColor: "#F3EBD5" },
  { key: "color_FF8C8F", label: "핑크",     bgColor: "#FF8C8F" },
  { key: "color_C8FD9A", label: "라임",     bgColor: "#C8FD9A" },
  { key: "color_EAAAFF", label: "라벤더",   bgColor: "#EAAAFF" },
  { key: "color_FFFF94", label: "옐로우",   bgColor: "#FFFF94" },
  { key: "color_83BEFE", label: "스카이",   bgColor: "#83BEFE" },
  // Row 2
  { key: "color_000000", label: "블랙",     bgColor: "#000000" },
  { key: "color_5C5C5C", label: "그레이",   bgColor: "#5C5C5C" },
  { key: "color_C10000", label: "레드",     bgColor: "#C10000" },
  { key: "color_63CA7D", label: "그린",     bgColor: "#63CA7D" },
  { key: "color_9F8EFF", label: "바이올렛", bgColor: "#9F8EFF" },
  { key: "color_FFCF8B", label: "피치",     bgColor: "#FFCF8B" },
  { key: "color_5656FF", label: "블루",     bgColor: "#5656FF" },
] as const;

/** DESIGN 화면 스티커 팔레트 (Figma 279:120 배치 순서, 3행×12열) */
const STICKER_OPTIONS: Array<{ src: string; w: number; h: number }> = [
  // Row 1
  { src: "haesol/mc_6.svg",      w: 48, h: 48 },
  { src: "haesol/mc_6-1.svg",    w: 48, h: 48 },
  { src: "haesol/mc_6-2.svg",    w: 48, h: 48 },
  { src: "haesol/mc_6-3.svg",    w: 48, h: 48 },
  { src: "haesol/mc_6-4.svg",    w: 48, h: 48 },
  { src: "haesol/mc_6-5.svg",    w: 48, h: 48 },
  { src: "haesol/image 108.svg", w: 48, h: 48 },
  { src: "haesol/image 113.svg", w: 48, h: 48 },
  { src: "haesol/nurse_8.svg",   w: 48, h: 48 },
  { src: "haesol/nurse_8-1.svg", w: 48, h: 48 },
  { src: "haesol/세유1.svg",     w: 48, h: 48 },
  { src: "haesol/DH_4.svg",      w: 48, h: 48 },
  // Row 2
  { src: "haesol/AI_3.svg",      w: 48, h: 48 },
  { src: "haesol/AI_2.svg",      w: 48, h: 48 },
  { src: "haesol/AI_5.svg",      w: 48, h: 48 },
  { src: "haesol/AI_1.svg",      w: 48, h: 48 },
  { src: "haesol/AI_7.svg",      w: 48, h: 48 },
  { src: "haesol/image 110.svg", w: 48, h: 48 },
  { src: "haesol/image 111.svg", w: 48, h: 48 },
  { src: "haesol/image 109.svg", w: 48, h: 48 },
  { src: "haesol/nurse_7.svg",   w: 48, h: 48 },
  { src: "haesol/nurse_8-2.svg", w: 48, h: 48 },
  { src: "haesol/세유2.svg",     w: 48, h: 48 },
  // Row 3
  { src: "haesol/상심2.svg",     w: 48, h: 48 },
  { src: "haesol/경영1.svg",     w: 48, h: 48 },
  { src: "haesol/경영2.svg",     w: 48, h: 48 },
  { src: "haesol/디보1.svg",     w: 48, h: 48 },
  { src: "haesol/바식2.svg",     w: 48, h: 48 },
  { src: "haesol/바식1.svg",     w: 48, h: 48 },
  { src: "haesol/시스템2.svg",   w: 48, h: 48 },
  { src: "haesol/시스템1.svg",   w: 48, h: 48 },
  { src: "haesol/약학1.svg",     w: 48, h: 48 },
  { src: "haesol/data_2.svg",    w: 48, h: 48 },
  { src: "haesol/data_7.svg",    w: 48, h: 48 },
  { src: "haesol/약학2.svg",     w: 48, h: 48 },
];

/** DESIGN 화면 프리뷰 표시 스케일: 534px / 287px */
const DESIGN_PREVIEW_SCALE = 534 / 287;

function createShots(total: number): Shot[] {
  return Array.from({ length: total }, (_, index) => ({
    index,
    captured: false,
    previewUrl: null,
    localPath: null,
    selectedOrder: null
  }));
}

function revokeShotUrls(shots: Shot[]) {
  for (const shot of shots) {
    if (shot.previewUrl) {
      URL.revokeObjectURL(shot.previewUrl);
    }
  }
}

export function App() {
  const [step, setStep] = useState<AppStep>("MAIN");
  const [frameId, setFrameId] = useState("basic_001");
  const [copies, setCopies] = useState(1);
  const [designColor, setDesignColor] = useState("");
  /** 확정된(V 누른) 스티커 목록 */
  const [committedStickers, setCommittedStickers] = useState<StickerPlacement[]>([]);
  /** 현재 드래그/배치 중인 활성 스티커 (V/X 표시됨) */
  const [activeSticker, setActiveSticker] = useState<StickerPlacement | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [shots, setShots] = useState<Shot[]>(createShots(SHOT_TOTAL));
  const [loadingText, setLoadingText] = useState("사진을 합성하고 있어요…");
  const [currentShot, setCurrentShot] = useState(0);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [gap, setGap] = useState(GAP_SECONDS);
  const [shootingPhase, setShootingPhase] = useState<"idle" | "countdown" | "capturing" | "gap">(
    "idle"
  );
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastCapturedUrl, setLastCapturedUrl] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [jobActive, setJobActive] = useState(false);
  /** Supabase 업로드 후 폴링에 사용 (storage 파일명) */
  const [printJobFilePath, setPrintJobFilePath] = useState<string | null>(null);
  /** 동숲: API 변환 결과 이미지 URL (blob: 또는 https) */
  const [transformedImageUrl, setTransformedImageUrl] = useState<string | null>(null);
  const [acTransformError, setAcTransformError] = useState<string | null>(null);
  /** 동숲: AC_RESULT 진입 즉시 백그라운드로 실행되는 인쇄 준비 Promise */
  const acPrintReadyRef = useRef<Promise<string> | null>(null);
  const [operatorOpen, setOperatorOpen] = useState(false);
  const [operatorUnlocked, setOperatorUnlocked] = useState(false);
  const [operatorPinInput, setOperatorPinInput] = useState("");
  const [operatorError, setOperatorError] = useState<string | null>(null);
  const [sbUrlInput, setSbUrlInput] = useState("");
  const [sbKeyInput, setSbKeyInput] = useState("");
  const [sbSaveMsg, setSbSaveMsg] = useState<string | null>(null);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [opsStatus, setOpsStatus] = useState<{
    printerDeviceName: string;
    skipPrint: boolean;
    appEnv: string;
  } | null>(null);
  const [printers, setPrinters] = useState<Array<{ name: string; isDefault: boolean }>>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [displays, setDisplays] = useState<Array<{ index: number; label: string; width: number; height: number }>>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [failedJobs, setFailedJobs] = useState<
    Array<{
      uuid: string;
      frameId: string;
      selectedIndexes: number[];
      copies: number;
      errorMessage: string;
      updatedAt: string;
    }>
  >([]);
  const [opsMessage, setOpsMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const shotsRef = useRef<Shot[]>(shots);
  const countdownSoundRef = useRef<HTMLAudioElement | null>(null);
  const shutterSoundRef = useRef<HTMLAudioElement | null>(null);

  /** DESIGN 화면: 드래그용 */
  const designPreviewRef = useRef<HTMLDivElement | null>(null);
  const dragActiveRef    = useRef(false);
  const dragOffsetRef    = useRef({ ox: 0, oy: 0 });

  const selectedCount = useMemo(
    () => shots.filter((s) => s.selectedOrder !== null).length,
    [shots]
  );

  useEffect(() => {
    shotsRef.current = shots;
  }, [shots]);

  const selectedShots = useMemo(
    () =>
      [...shots]
        .filter((s) => s.selectedOrder !== null)
        .sort((a, b) => (a.selectedOrder ?? 0) - (b.selectedOrder ?? 0)),
    [shots]
  );

  const ensureCamera = async () => {
    if (streamRef.current) {
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      setCameraError(null);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      return true;
    } catch (error) {
      setCameraError("카메라 연결에 실패했습니다. 장치를 확인해주세요.");
      return false;
    }
  };

  const stopCamera = () => {
    if (!streamRef.current) {
      return;
    }
    for (const track of streamRef.current.getTracks()) {
      track.stop();
    }
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndStoreShot = async (shotIndex: number) => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error("VIDEO_NOT_READY");
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("CANVAS_CONTEXT_FAIL");
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (!value) {
            reject(new Error("BLOB_FAIL"));
            return;
          }
          resolve(value);
        },
        "image/png"
      );
    });

    const previewUrl = URL.createObjectURL(blob);
    let localPath: string | null = null;

    if (session && window.kioskApi?.saveShot) {
      const bytes = Array.from(new Uint8Array(await blob.arrayBuffer()));
      try {
        const saved = await window.kioskApi.saveShot({
          uuid: session.uuid,
          index: shotIndex,
          mime: blob.type,
          bytes
        });
        localPath = saved.localPath;
      } catch {
        localPath = null;
      }
    }

    setLastCapturedUrl(previewUrl);
    setShots((prev) => {
      const next = prev.map((shot) => ({ ...shot }));
      const target = next[shotIndex];
      if (!target) {
        return prev;
      }
      if (target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      target.captured = true;
      target.previewUrl = previewUrl;
      target.localPath = localPath;
      return next;
    });
  };

  const toggleShot = (index: number) => {
    setShots((prev) => {
      const selectCap = isAnimalCrossingFrame(frameId) ? SELECT_TOTAL_AC : frameId.startsWith("bh_bio") ? SELECT_TOTAL_BIO : SELECT_TOTAL_DEFAULT;
      const next = prev.map((s) => ({ ...s }));
      const target = next[index];
      if (!target || !target.captured) {
        return prev;
      }

      if (target.selectedOrder !== null) {
        const removed = target.selectedOrder;
        target.selectedOrder = null;
        for (const shot of next) {
          if (shot.selectedOrder !== null && shot.selectedOrder > removed) {
            shot.selectedOrder -= 1;
          }
        }
      } else {
        if (selectCap === 1) {
          for (const s of next) {
            s.selectedOrder = null;
          }
          target.selectedOrder = 1;
          return next;
        }
        const currentCount = next.filter((s) => s.selectedOrder !== null).length;
        if (currentCount >= selectCap) {
          return prev;
        }
        target.selectedOrder = currentCount + 1;
      }
      return next;
    });
  };

  const goToFrameConfirm = () => {
    setStep("FRAME_CONFIRM");
  };

  const startSession = async (overrideFrameId?: string) => {
    const fid = overrideFrameId ?? frameId;
    try {
      if (window.kioskApi?.createSession) {
        const created = await window.kioskApi.createSession({ frameId: fid, copies });
        setSession(created);
      } else {
        setSession({
          uuid: crypto.randomUUID(),
          frameId: fid,
          copies,
          createdAt: new Date().toISOString()
        });
      }
    } catch {
      setSession({
        uuid: crypto.randomUUID(),
        frameId: fid,
        copies,
        createdAt: new Date().toISOString()
      });
    }
    if (isAnimalCrossingFrame(fid)) {
      setShots(createShots(SHOT_TOTAL_AC));
    } else if (fid.startsWith("bh_bio")) {
      setShots(createShots(SHOT_TOTAL_BIO));
    } else {
      setShots(createShots(SHOT_TOTAL_DEFAULT));
    }
    setStep("QUANTITY");
  };

  const startShooting = async () => {
    const ok = await ensureCamera();
    if (!ok) {
      return;
    }
    setStep(isAnimalCrossingFrame(frameId) ? "AC_SHOOTING" : "SHOOTING");
    setCurrentShot(1);
    setCountdown(COUNTDOWN_SECONDS);
    setGap(GAP_SECONDS);
    setShootingPhase("countdown");
  };

  const startJob = async (
    overrideFrameId?: string,
    overrideCommittedStickers?: StickerPlacement[],
    overrideActiveSticker?: StickerPlacement | null
  ) => {
    if (!session) {
      return;
    }
    const selectedIndexes = selectedShots.map((shot) => shot.index);
    if (selectedIndexes.length !== SELECT_TOTAL) {
      return;
    }
    const effectiveFrameId = overrideFrameId ?? frameId;
    const allStickers: StickerPlacement[] = [
      ...(overrideCommittedStickers ?? committedStickers),
      ...((overrideActiveSticker !== undefined ? overrideActiveSticker : activeSticker) ? [(overrideActiveSticker !== undefined ? overrideActiveSticker : activeSticker)!] : []),
    ];

    const supabase = getSupabase();
    console.log("[startJob] supabase 클라이언트:", supabase ? "✅ 연결됨" : "❌ 없음 (Electron 경로)");
    console.log("[startJob] session.uuid:", session.uuid);
    console.log("[startJob] effectiveFrameId:", effectiveFrameId);
    console.log("[startJob] allStickers:", allStickers);
    if (supabase) {
      const urls = selectedShots.map((s) => s.previewUrl).filter((u): u is string => !!u);
      console.log("[startJob] previewUrl 수:", urls.length, "| 필요:", SELECT_TOTAL);
      if (urls.length !== SELECT_TOTAL) {
        console.error("[startJob] ❌ 사진 URL 부족 → SHOT_NOT_FOUND");
        setJob({
          uuid: session.uuid,
          status: "FAILED_PRINT",
          progress: 100,
          errorMessage: "SHOT_NOT_FOUND"
        });
        setStep("PRINTING");
        return;
      }
      try {
        setStep("LOADING");
        setLoadingText("사진을 합성하고 있어요…");
        setJob({ uuid: session.uuid, status: "COMPOSING", progress: 10 });

        console.log("[startJob] 1️⃣ 이미지 합성 시작...");
        const blob = effectiveFrameId.startsWith("bh_bio")
          ? await composeBioPrint(urls, effectiveFrameId as "bh_bio_black" | "bh_bio_pink")
          : await composeFinalImageBlob(urls, effectiveFrameId, allStickers);
        console.log("[startJob] ✅ 이미지 합성 완료 | blob size:", blob.size, "bytes | type:", blob.type);

        const filePath = `${session.uuid}.png`;
        console.log("[startJob] 2️⃣ Storage 업로드 시작... filePath:", filePath);

        const { data: upData, error: upErr } = await supabase.storage.from("photos").upload(filePath, blob, {
          contentType: "image/png",
          upsert: true
        });
        if (upErr) {
          console.error("[startJob] ❌ Storage 업로드 실패:", upErr.message, upErr);
          throw upErr;
        }
        console.log("[startJob] ✅ Storage 업로드 완료:", upData);

        console.log("[startJob] 3️⃣ print_jobs INSERT 시작...", { file_path: filePath, copies, status: "pending" });
        const { data: insData, error: insErr } = await supabase.from("print_jobs").insert({
          file_path: filePath,
          copies,
          status: "pending"
        }).select();
        if (insErr) {
          console.error("[startJob] ❌ print_jobs INSERT 실패:", insErr.message, insErr);
          throw insErr;
        }
        console.log("[startJob] ✅ print_jobs INSERT 성공:", insData);

        setPrintJobFilePath(filePath);
        setLoadingText("업로드 완료. 인쇄를 준비하고 있어요…");
        setJob({ uuid: session.uuid, status: "QUEUED", progress: 30 });
        setJobActive(true);
        console.log("[startJob] ✅ 잡 등록 완료 → 폴링 시작");
      } catch (e) {
        console.error("[startJob] ❌ 전체 오류:", e);
        setJob({
          uuid: session.uuid,
          status: "FAILED_PRINT",
          progress: 100,
          errorMessage: e instanceof Error ? e.message : "JOB_START_FAILED"
        });
        setStep("PRINTING");
        setJobActive(false);
      }
      return;
    }

    if (window.kioskApi?.startJob) {
      try {
        await window.kioskApi.startJob({
          uuid: session.uuid,
          selectedIndexes,
          copies
        });
        setStep("LOADING");
        setLoadingText("사진을 합성하고 있어요…");
        setJobActive(true);
      } catch {
        setJob({
          uuid: session.uuid,
          status: "FAILED_PRINT",
          progress: 100,
          errorMessage: "JOB_START_FAILED"
        });
        setStep("PRINTING");
        setJobActive(false);
      }
      return;
    }

    setJob({
      uuid: session.uuid,
      status: "FAILED_PRINT",
      progress: 100,
      errorMessage: "SUPABASE_NOT_CONFIGURED"
    });
    setStep("PRINTING");
    setJobActive(false);
  };

  /** 동숲: 선택 1장 → 변환 API → 결과 화면 */
  const runAcTransform = async () => {
    if (!session) {
      return;
    }
    if (selectedCount !== SELECT_TOTAL_AC) {
      return;
    }
    const shot = shots.find((s) => s.selectedOrder !== null);
    if (!shot?.previewUrl) {
      return;
    }
    setAcTransformError(null);
    setStep("AC_TRANSFORMING");
    setLoadingText("동물의 숲 스타일로 변환 중…");
    setJob({ uuid: session.uuid, status: "COMPOSING", progress: 5 });
    try {
      const outUrl = await transformAnimalCrossingImage(shot.previewUrl);
      /** blob: URL 중복 선택 시 새 탭 문제 방지: 이전 동숲 결과만 해제 */
      if (transformedImageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(transformedImageUrl);
      }
      setTransformedImageUrl(outUrl);
      setJob({ uuid: session.uuid, status: "QUEUED", progress: 35 });

      /** 인쇄 준비(합성 + Supabase 업로드)를 백그라운드에서 미리 시작 */
      const supabase = getSupabase();
      if (supabase && session) {
        const sid = session.uuid;
        acPrintReadyRef.current = (async () => {
          const blob = await composeAnimalCrossingPrint(outUrl);
          const filePath = `${sid}.png`;
          const { error } = await supabase.storage.from("photos").upload(filePath, blob, {
            contentType: "image/png",
            upsert: true,
          });
          if (error) throw error;
          return filePath;
        })();
      }

      setStep("AC_RESULT");
    } catch (e) {
      setAcTransformError(e instanceof Error ? e.message : "TRANSFORM_FAILED");
      setStep("AC_SELECT");
      setJob(null);
      acPrintReadyRef.current = null;
    }
  };

  /** 동숲 결과 이미지 + 프레임 합성 후 인쇄 큐와 동일 */
  const startAcPrintJob = async () => {
    if (!session || !transformedImageUrl) {
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setJob({
        uuid: session.uuid,
        status: "FAILED_PRINT",
        progress: 100,
        errorMessage: "SUPABASE_NOT_CONFIGURED",
      });
      setStep("PRINTING");
      return;
    }
    setAcTransformError(null);
    setStep("LOADING");
    setLoadingText("인쇄용 이미지를 준비하고 있어요…");
    setJob({ uuid: session.uuid, status: "COMPOSING", progress: 55 });
    try {
      /** 백그라운드에서 미리 업로드가 끝났으면 즉시 filePath를 받고, 아직 진행 중이면 여기서 기다림 */
      const filePath = acPrintReadyRef.current
        ? await acPrintReadyRef.current
        : await (async () => {
            const blob = await composeAnimalCrossingPrint(transformedImageUrl);
            const fp = `${session.uuid}.png`;
            const { error } = await supabase.storage.from("photos").upload(fp, blob, {
              contentType: "image/png",
              upsert: true,
            });
            if (error) throw error;
            return fp;
          })();
      acPrintReadyRef.current = null;

      const { error: insErr } = await supabase.from("print_jobs").insert({
        file_path: filePath,
        copies,
        status: "pending",
      });
      if (insErr) throw insErr;

      setPrintJobFilePath(filePath);
      setLoadingText("업로드 완료. 인쇄를 준비하고 있어요…");
      setJob({ uuid: session.uuid, status: "QUEUED", progress: 60 });
      setJobActive(true);
    } catch (e) {
      acPrintReadyRef.current = null;
      setJob({
        uuid: session.uuid,
        status: "FAILED_PRINT",
        progress: 100,
        errorMessage: e instanceof Error ? e.message : "AC_PRINT_PREP_FAILED",
      });
      setStep("PRINTING");
      setJobActive(false);
    }
  };

  const resetFlow = () => {
    if (transformedImageUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(transformedImageUrl);
    }
    setTransformedImageUrl(null);
    setAcTransformError(null);
    acPrintReadyRef.current = null;
    revokeShotUrls(shots);
    setStep("MAIN");
    setFrameId("basic_001");
    setSession(null);
    setCopies(1);
    setDesignColor("");
    setCommittedStickers([]);
    setActiveSticker(null);
    setShots(createShots(SHOT_TOTAL));
    setLoadingText("사진을 합성하고 있어요…");
    setCurrentShot(0);
    setCountdown(COUNTDOWN_SECONDS);
    setGap(GAP_SECONDS);
    setShootingPhase("idle");
    setCameraError(null);
    setLastCapturedUrl(null);
    setShowFlash(false);
    setJob(null);
    setJobActive(false);
    setPrintJobFilePath(null);
    stopCamera();
  };

  const openOperatorPanel = async () => {
    setOperatorOpen(true);
    setOperatorUnlocked(false);
    setOperatorPinInput("");
    setOperatorError(null);
    setSbSaveMsg(null);
    const saved = getSavedSupabaseConfig();
    setSbUrlInput(saved.url);
    setSbKeyInput(saved.anonKey);
    if (!window.kioskApi) {
      setOpsStatus({ printerDeviceName: "-", skipPrint: false, appEnv: "web (Vercel)" });
      setPrinters([]);
      setDisplays([]);
      return;
    }
    try {
      const status = await window.kioskApi.getOpsStatus();
      setOpsStatus(status);
      setSelectedPrinter(status.printerDeviceName);
      const printerList = await window.kioskApi.getPrinters();
      setPrinters(printerList.printers);
    } catch {
      setOpsStatus(null);
      setPrinters([]);
    }
    try {
      const dispInfo = await window.kioskApi.getDisplays();
      setDisplays(dispInfo.displays);
      setSelectedDisplay(dispInfo.currentIndex);
    } catch {
      setDisplays([]);
    }
  };

  const closeOperatorPanel = () => {
    setOperatorOpen(false);
    setOperatorUnlocked(false);
    setOperatorPinInput("");
    setOperatorError(null);
    setOpsMessage(null);
  };

  const refreshFailedJobs = async () => {
    if (!window.kioskApi?.listFailedJobs) {
      setFailedJobs([]);
      return;
    }
    try {
      const result = await window.kioskApi.listFailedJobs();
      setFailedJobs(result.jobs);
    } catch {
      setFailedJobs([]);
    }
  };

  const WEB_OPERATOR_PIN = "6875";

  const submitOperatorPin = async () => {
    if (!window.kioskApi?.verifyOperatorPin) {
      // 웹 모드 — 하드코딩 PIN으로 인증
      if (operatorPinInput !== WEB_OPERATOR_PIN) {
        setOperatorError("PIN이 올바르지 않습니다.");
        return;
      }
      setOperatorUnlocked(true);
      setOperatorError(null);
      return;
    }
    const result = await window.kioskApi.verifyOperatorPin({ pin: operatorPinInput });
    if (!result.ok) {
      setOperatorError("PIN이 올바르지 않습니다.");
      return;
    }
    setOperatorUnlocked(true);
    setOperatorError(null);
    await refreshFailedJobs();
    try {
      if (window.kioskApi?.getPrinters) {
        const printerList = await window.kioskApi.getPrinters();
        setPrinters(printerList.printers);
      }
    } catch {
      setPrinters([]);
    }
  };

  useEffect(() => {
    if (step !== "SHOOTING" && step !== "AC_SHOOTING") {
      stopCamera();
    }
  }, [step]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "o") {
        event.preventDefault();
        void openOperatorPanel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!videoRef.current || !streamRef.current) {
      return;
    }
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => undefined);
  }, [step]);

  useEffect(() => {
    return () => {
      revokeShotUrls(shotsRef.current);
      stopCamera();
    };
  }, []);

  useEffect(() => {
    countdownSoundRef.current = new Audio(asset("sounds/카운트다운.mp3"));
    shutterSoundRef.current   = new Audio(asset("sounds/촬영.mp3"));
    return () => {
      countdownSoundRef.current = null;
      shutterSoundRef.current   = null;
    };
  }, []);

  useEffect(() => {
    if ((step === "SHOOTING" || step === "AC_SHOOTING") && shootingPhase === "countdown") {
      const snd = countdownSoundRef.current;
      if (snd) {
        snd.src = asset(step === "AC_SHOOTING" ? "sounds/ac-countdown.mp3" : "sounds/카운트다운.mp3");
        snd.load();
        snd.currentTime = 0;
        snd.playbackRate = step === "AC_SHOOTING" ? 1.5 : 1.0;
        void snd.play().catch(() => undefined);
      }
    }
  }, [shootingPhase, step]);

  useEffect(() => {
    if (shootingPhase === "capturing") {
      setShowFlash(true);
      const t = window.setTimeout(() => setShowFlash(false), 450);
      const snd = shutterSoundRef.current;
      if (snd) {
        snd.currentTime = 0;
        void snd.play().catch(() => undefined);
      }
      return () => window.clearTimeout(t);
    }
  }, [shootingPhase]);

  useEffect(() => {
    if (step !== "SHOOTING" && step !== "AC_SHOOTING") {
      return;
    }

    const shotCap = isAnimalCrossingFrame(frameId) ? SHOT_TOTAL_AC : frameId.startsWith("bh_bio") ? SHOT_TOTAL_BIO : SHOT_TOTAL_DEFAULT;
    const selectStep: AppStep = isAnimalCrossingFrame(frameId) ? "AC_SELECT" : "SELECT";

    if (shootingPhase === "countdown") {
      if (countdown > 0) {
        const timeout = window.setTimeout(() => {
          setCountdown((value) => value - 1);
        }, 1000);
        return () => window.clearTimeout(timeout);
      }
      setShootingPhase("capturing");
      return;
    }

    if (shootingPhase === "capturing") {
      void (async () => {
        try {
          await captureAndStoreShot(currentShot - 1);
          setCameraError(null);
        } catch {
          setCameraError("촬영 저장에 실패했습니다. 운영자를 불러주세요.");
        }
        setGap(GAP_SECONDS);
        setShootingPhase("gap");
      })();
      return;
    }

    if (shootingPhase === "gap") {
      if (gap > 0) {
        const timeout = window.setTimeout(() => {
          setGap((value) => value - 1);
        }, 1000);
        return () => window.clearTimeout(timeout);
      }
      if (currentShot >= shotCap) {
        setStep(selectStep);
        setShootingPhase("idle");
        return;
      }
      setCurrentShot((value) => value + 1);
      setCountdown(COUNTDOWN_SECONDS);
      setShootingPhase("countdown");
    }
  }, [step, shootingPhase, countdown, gap, currentShot, frameId]);

  useEffect(() => {
    if (!jobActive || !session) {
      return;
    }

    const supabase = getSupabase();
    if (printJobFilePath) {
      if (!supabase) {
        setJob({
          uuid: session.uuid,
          status: "FAILED_PRINT",
          progress: 100,
          errorMessage: "SUPABASE_NOT_CONFIGURED"
        });
        setStep("PRINTING");
        setJobActive(false);
        return;
      }
      console.log("[polling] 시작 | filePath:", printJobFilePath);
      let lastLoggedStatus = "";
      const timer = window.setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from("print_jobs")
            .select("status, error_message")
            .eq("file_path", printJobFilePath)
            .maybeSingle();

          if (error) {
            console.error("[polling] ❌ SELECT 오류:", error.message, error);
            throw error;
          }
          if (!data) {
            console.warn("[polling] ⚠️ 아직 레코드 없음 (data=null)");
            return;
          }

          const st = data.status;
          if (st !== lastLoggedStatus) {
            console.log("[polling] 상태 변경:", lastLoggedStatus || "(없음)", "→", st);
            lastLoggedStatus = st;
          }

          if (st === "pending") {
            setStep("LOADING");
            setLoadingText("인쇄 대기 중…");
            setJob({ uuid: session.uuid, status: "QUEUED", progress: 40 });
          }
          if (st === "printing") {
            setStep("PRINTING");
            setJob({ uuid: session.uuid, status: "PRINTING", progress: 75 });
          }
          if (st === "done") {
            console.log("[polling] ✅ 인쇄 완료 → END");
            setJob({ uuid: session.uuid, status: "DONE", progress: 100 });
            setStep("END");
            setJobActive(false);
          }
          if (st === "failed") {
            console.error("[polling] ❌ 인쇄 실패:", data.error_message);
            setJob({
              uuid: session.uuid,
              status: "FAILED_PRINT",
              progress: 100,
              errorMessage: data.error_message ?? "PRINT_FAILED"
            });
            setStep("PRINTING");
            setJobActive(false);
          }
        } catch (e) {
          console.error("[polling] ❌ 폴링 오류 → 중단:", e);
          setJob({
            uuid: session.uuid,
            status: "FAILED_PRINT",
            progress: 100,
            errorMessage: "JOB_STATUS_POLL_FAILED"
          });
          setStep("PRINTING");
          setJobActive(false);
        }
      }, 500);

      return () => window.clearInterval(timer);
    }

    const kiosk = window.kioskApi;
    if (!kiosk?.getJobStatus) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const status = await kiosk.getJobStatus({ uuid: session.uuid });
        if (!status) {
          return;
        }
        setJob(status);

        if (status.status === "QUEUED" || status.status === "COMPOSING") {
          setStep("LOADING");
          setLoadingText(
            status.progress < 45 ? "사진을 합성하고 있어요…" : "인쇄를 준비하고 있어요…"
          );
        }
        if (status.status === "PRINTING") {
          setStep("PRINTING");
        }
        if (status.status === "DONE") {
          setStep("END");
          setJobActive(false);
        }
        if (status.status === "FAILED_PRINT") {
          setStep("PRINTING");
          setJobActive(false);
        }
      } catch {
        setJob({
          uuid: session.uuid,
          status: "FAILED_PRINT",
          progress: 100,
          errorMessage: "JOB_STATUS_POLL_FAILED"
        });
        setStep("PRINTING");
        setJobActive(false);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [jobActive, session, printJobFilePath]);

  const isBasic = frameId.startsWith("basic");
  const isBio = frameId.startsWith("bh_bio");
  return (
    <div className="app-viewport">
    <div className="app-scale">
    <main className={`screen ${step === "MAIN" ? "screen--main" : ""} ${step === "FRAME_CONFIRM" ? (isBio ? "screen--frameConfirm screen--frameConfirm-bio" : isBasic ? "screen--frameConfirm screen--frameConfirm-basic" : "screen--frameConfirm screen--frameConfirm-designed") : ""} ${step === "QUANTITY" ? (isAnimalCrossingFrame(frameId) ? "screen--quantity" : isBio ? "screen--quantity screen--quantity-bio" : isBasic ? "screen--quantity screen--quantity-basic" : "screen--quantity screen--quantity-designed") : ""} ${step === "CAMERA_GUIDE" || step === "AC_CAMERA_GUIDE" ? "screen--cameraGuide" : ""} ${step === "SHOOTING" || step === "AC_SHOOTING" ? "screen--shooting" : ""} ${step === "LOADING" || step === "AC_TRANSFORMING" ? "screen--loading" : ""} ${step === "SELECT" || step === "AC_SELECT" ? "screen--select" : ""} ${step === "DESIGN" ? "screen--design" : ""} ${step === "PRINTING" ? "screen--printing" : ""} ${step === "END" ? "screen--end" : ""} ${step === "AC_RESULT" ? "screen--acResult" : ""} ${isAnimalCrossingFrame(frameId) && step !== "MAIN" ? "screen--acTheme" : ""} ${isBio && step !== "MAIN" ? "screen--bioTheme" : ""}`}>
      {step === "MAIN" && (
        <>
          {/* 설정 버튼 (우상단) */}
          <img
            className="mainBtnSetting"
            alt="Setting"
            src={asset("main/button-setting.png")}
            onClick={() => void openOperatorPanel()}
          />

          {/* 좌측 대형 BH Bio 버튼 (Frame 8) */}
          <button
            type="button"
            className="mainPreview"
            onClick={() => { setFrameId("bh_bio"); goToFrameConfirm(); }}
          >
            <img className="mainPreview__img" src={asset("bh_bio_frame/BH_BIO_Button.png")} alt="차병헌 ♥ 비오" />
          </button>

          {/* BASIC FRAME 카드 (Frame 9, 우측 상단) */}
          <button
            type="button"
            className="mainCard mainCardBasic"
            onClick={() => { setFrameId("basic_001"); goToFrameConfirm(); }}
          >
            <div className="mainCard__bg" />
            <div className="mainCardBasic__title">BASIC FRAME</div>
            <div className="mainCardBasic__sub">
              기본적인 4컷형태의 프레임입니다<br />
              4*6사이즈로 제공됩니다
            </div>
            <img className="mainCardBasic__char" src={asset("main/image-88.png")} alt="" />
          </button>

          {/* DESIGNED FRAME 카드 (Frame 10, 우측 중단) */}
          <button
            type="button"
            className="mainCard mainCardDesigned"
            onClick={() => { setFrameId("designed_001"); void startSession("designed_001"); }}
          >
            <div className="mainCard__bg" />
            <div className="mainCardDesigned__title">DESIGNED FRAME</div>
            <p className="mainCardDesigned__sub">
              차의대의 마스코트 "해솔이"와 함께 촬영합니다<br />
              원하는 해솔이 캐릭터를 직접 선택 할 수 있습니다
            </p>
            <img className="mainDChar mainDChar--116" src={asset("main/image-116.png")} alt="" />
            <img className="mainDChar mainDChar--121" src={asset("main/image-121.png")} alt="" />
            <img className="mainDChar mainDChar--114" src={asset("main/image-114.png")} alt="" />
            <img className="mainDChar mainDChar--123" src={asset("main/image-123.png")} alt="" />
            <img className="mainDChar mainDChar--120" src={asset("main/image-120.png")} alt="" />
            <img className="mainDChar mainDChar--122" src={asset("main/image-122.png")} alt="" />
            <img className="mainDChar mainDChar--119" src={asset("main/image-119.png")} alt="" />
            <img className="mainDChar mainDChar--118" src={asset("main/image-118.png")} alt="" />
            <img className="mainDChar mainDChar--117" src={asset("main/image-117.png")} alt="" />
            <img className="mainDChar mainDChar--115" src={asset("main/image-115.png")} alt="" />
            <img className="mainDChar mainDChar--nurse" src={asset("main/nurse-3.png")} alt="" />
            <img className="mainDChar mainDChar--87"   src={asset("main/image-87.png")} alt="" />
            <img className="mainDChar mainDChar--mc"   src={asset("main/mc-3.png")} alt="" />
          </button>

          {/* ANIMAL CROSSING 카드 (Frame 11, 좌측 하단) */}
          <button
            type="button"
            className="mainCard mainCardAnimal"
            onClick={() => {
              setFrameId(FRAME_ID_AC);
              void startSession(FRAME_ID_AC);
            }}
          >
            <div className="mainCard__bg" />
            <img className="mainAnimalLogo" src={asset("animal-crossing/logo.png")} alt="" />
            <img className="mainAnimalImg mainAnimalImg--137" src={asset("main/image-137.png")} alt="" />
            <img className="mainAnimalImg mainAnimalImg--136" src={asset("main/image-136.png")} alt="" />
            <img className="mainAnimalImg mainAnimalImg--134" src={asset("main/image-134.png")} alt="" />
          </button>

          {/* BH Bio Frame 카드 (Frame 12, 우측 하단, 회색 — Coming Soon 비활성) */}
          <button
            type="button"
            className="mainCard mainCardBio"
            disabled
          >
            <div className="mainCard__bg" />
            <div className="mainCardBio__title">BH BIO FRAME</div>
            <img className="mainCardBio__char" src={asset("main/image-165.png")} alt="" />
            <div className="mainCardBio__comingSoon">COMING SOON</div>
          </button>

          <span className="mainVersion">버전 0.96a</span>
        </>
      )}

      {step === "FRAME_CONFIRM" && (
        <>
          <div className="frameConfirm__bg" />
          {isBio && (
            <>
              <img className="frameConfirmBio__header" src={asset("bh_bio_frame/Text_Frame4Title.png")} alt="병헌이랑 비오랑" />
              <button
                type="button"
                className={`frameConfirmBio__frameBtn frameConfirmBio__img--160 ${frameId === "bh_bio_black" ? "frameConfirmBio__frameBtn--selected" : ""}`}
                onClick={() => setFrameId("bh_bio_black")}
              >
                <img src={asset("bh_bio_frame/image 160.png")} alt="블랙 프레임" />
              </button>
              <button
                type="button"
                className={`frameConfirmBio__frameBtn frameConfirmBio__img--161 ${frameId === "bh_bio_pink" ? "frameConfirmBio__frameBtn--selected" : ""}`}
                onClick={() => setFrameId("bh_bio_pink")}
              >
                <img src={asset("bh_bio_frame/image 161.png")} alt="핑크 프레임" />
              </button>
              <button type="button" className="btnQuantityPrev" onClick={() => setStep("MAIN")}>이전</button>
              <button
                type="button"
                className="btnQuantityNext"
                disabled={frameId === "bh_bio"}
                onClick={() => void startSession()}
              >다음</button>
            </>
          )}
          {!isBio && <h1 className="frameConfirm__title">{isBasic ? "BASIC FRAME" : "DESIGNED FRAME"}</h1>}
          {!isBio && isBasic && (
            <>
              <button
                type="button"
                className={`frameConfirmBasic__btn frameConfirmBasic__btn--black ${frameId === "basic_black" ? "frameConfirmBasic__btn--selected" : ""}`}
                onClick={() => setFrameId("basic_black")}
              >
                <img src={asset("basic-frame-black.png")} alt="기본 프레임 블랙" className="frameConfirmBasic__preview" />
              </button>
              <button
                type="button"
                className={`frameConfirmBasic__btn frameConfirmBasic__btn--white ${frameId === "basic_white" ? "frameConfirmBasic__btn--selected" : ""}`}
                onClick={() => setFrameId("basic_white")}
              >
                <img src={asset("basic-frame-white.png")} alt="기본 프레임 화이트" className="frameConfirmBasic__preview" />
              </button>
            </>
          )}
          {!isBio && !isBasic && (
            <>
              {/* Row 1: 경영학과 / AI의료데이터 / 디지털보건의료 / 간호학과 / 미디어커뮤니케이션 */}
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--경영 ${frameId === "designed_경영" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_경영")}>
                <img src={asset("designed-frame/image-132.png")} alt="경영학과" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--ai ${frameId === "designed_ai" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_ai")}>
                <img src={asset("designed-frame/image-128.png")} alt="AI의료데이터" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--보건 ${frameId === "designed_보건" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_보건")}>
                <img src={asset("designed-frame/image-130.png")} alt="디지털보건의료" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--간호 ${frameId === "designed_간호" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_간호")}>
                <img src={asset("designed-frame/image-124.png")} alt="간호학과" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--mc ${frameId === "designed_mc" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_mc")}>
                <img src={asset("designed-frame/image-133.png")} alt="미디어커뮤니케이션" />
              </button>
              {/* Row 2: 상담심리학과 / 약학대학 / 바이오식의약학 / 세포유전자재생의학 / 시스템생명과학 */}
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--상심 ${frameId === "designed_상심" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_상심")}>
                <img src={asset("designed-frame/image-131.png")} alt="상담심리학과" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--약학 ${frameId === "designed_약학" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_약학")}>
                <img src={asset("designed-frame/image-127.png")} alt="약학대학" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--바식 ${frameId === "designed_바식" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_바식")}>
                <img src={asset("designed-frame/image-125.png")} alt="바이오식의약학" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--세유 ${frameId === "designed_세유" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_세유")}>
                <img src={asset("designed-frame/image-126.png")} alt="세포유전자재생의학" />
              </button>
              <button type="button" className={`frameConfirmDesigned__imgWrap fcd--시생 ${frameId === "designed_시생" ? "frameConfirmDesigned__imgWrap--selected" : ""}`} onClick={() => setFrameId("designed_시생")}>
                <img src={asset("designed-frame/image-129.png")} alt="시스템생명과학" />
              </button>
              {/* Row 1 레이블 */}
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--경영">경영학과</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--ai">AI의료데이터</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--보건">디지털보건의료</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--간호">간호학과</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--mc">미디어커뮤니케이션</span>
              {/* Row 2 레이블 */}
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--상심">상담심리학과</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--약학">약학대학</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--바식">바이오식의약학</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--세유">세포·유전자재생의학</span>
              <span className="frameConfirmDesigned__label frameConfirmDesigned__label--시생">시스템생명과학</span>
            </>
          )}
          {!isBio && (
            <>
              <button
                type="button"
                className="frameConfirm__prev btnQuantityPrev"
                onClick={() => { setStep("MAIN"); setFrameId("basic_001"); }}
              >이전</button>
              <button
                type="button"
                className="frameConfirm__next btnQuantityNext"
                onClick={() => void startSession()}
                disabled={(isBasic && frameId === "basic_001") || (!isBasic && frameId === "designed_001")}
              >다음</button>
            </>
          )}
        </>
      )}

      {step === "QUANTITY" && (
        <>
          <h1 className="quantityTitle">인쇄 갯수</h1>
          <div className="quantityCount">{copies}</div>
          <button type="button" className="btnQuantitySymbol btnQuantityMinus" onClick={() => setCopies((v) => Math.max(1, v - 1))} aria-label="감소">−</button>
          <button type="button" className="btnQuantitySymbol btnQuantityPlus" onClick={() => setCopies((v) => Math.min(4, v + 1))} aria-label="증가">+</button>
          <button type="button" className={isBio ? "btnQuantityPrev btnBioQuantityPrev" : "btnQuantityPrev"} onClick={() => {
            if (isAnimalCrossingFrame(frameId)) setStep("MAIN");
            else if (isBasic) setStep("FRAME_CONFIRM");
            else setStep("FRAME_CONFIRM");
          }}>이전</button>
          <button type="button" className={isBio ? "btnQuantityNext btnBioQuantityNext" : "btnQuantityNext"} onClick={() => void setStep(isAnimalCrossingFrame(frameId) ? "AC_CAMERA_GUIDE" : "CAMERA_GUIDE")}>다음</button>
        </>
      )}

      {(step === "CAMERA_GUIDE" || step === "AC_CAMERA_GUIDE") && (
        <>
          {isBio
            ? <img src={asset("bh_bio_frame/image 153.png")} alt="" className="cameraGuide__illus cameraGuide__illus--bio" />
            : <img src={asset("Group 8.png")} alt="" className="cameraGuide__illus" />
          }
          <p className="cameraGuide__text1">잠시 후 촬영이 시작됩니다<br />마음에드는 포즈를&nbsp;&nbsp;미리 생각해두세요!!</p>
          <p className="cameraGuide__text2">촬영은 총 {isAnimalCrossingFrame(frameId) ? SHOT_TOTAL_AC : isBio ? SHOT_TOTAL_BIO : SHOT_TOTAL_DEFAULT}번 진행됩니다</p>
          {cameraError && <p className="errorText">{cameraError}</p>}
          <button type="button" className={isBio ? "btnQuantityPrev btnBioCameraGuidePrev" : "btnQuantityPrev"} onClick={() => setStep("QUANTITY")}>이전</button>
          <button type="button" className={isBio ? "btnCameraStart btnBioCameraStart" : "btnCameraStart"} onClick={startShooting}>촬영 시작</button>
        </>
      )}


      {(step === "SHOOTING" || step === "AC_SHOOTING") && (
        <>
          <h1 className="shootingTitle">남은횟수 {Math.min(currentShot, isAnimalCrossingFrame(frameId) ? SHOT_TOTAL_AC : frameId.startsWith("bh_bio") ? SHOT_TOTAL_BIO : SHOT_TOTAL_DEFAULT)}/{isAnimalCrossingFrame(frameId) ? SHOT_TOTAL_AC : frameId.startsWith("bh_bio") ? SHOT_TOTAL_BIO : SHOT_TOTAL_DEFAULT}</h1>
          <div className="cameraBox">
            {/* 갭 중: 찍힌 사진 표시 / 그 외: 라이브 영상 */}
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              style={{ display: shootingPhase === "gap" && lastCapturedUrl ? "none" : "block" }}
            />
            {shootingPhase === "gap" && lastCapturedUrl && (
              <img
                src={lastCapturedUrl}
                alt="촬영된 사진"
                className="cameraBox__captured"
              />
            )}
            {/* 셔터 플래시 */}
            {showFlash && <div className="shutterFlash" />}
          </div>
          {shootingPhase === "countdown" && <div className="shootingCountdown">{countdown}</div>}
          {shootingPhase === "gap" && <p className="shootingPhase">다음 촬영까지 {gap}초</p>}
          {cameraError && <p className="errorText">{cameraError}</p>}
        </>
      )}

      {(step === "SELECT" || step === "AC_SELECT") && (
        <>
          {!isBio && <h1 className="selectTitle">Select</h1>}

          {/* BIO SELECT: 프리뷰 + 6장 그리드 */}
          {isBio ? (
            <>
              {/* 사진 4슬롯 — 캔버스 절대좌표 */}
              {[0,1,2,3].map((i) => (
                <div key={i} className={`selectBioPreviewSlot selectBioPreviewSlot--${i}`}>
                  {selectedShots[i]?.previewUrl && (
                    <img src={selectedShots[i].previewUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  )}
                </div>
              ))}
              {/* 프레임 오버레이 — 캔버스 절대좌표 */}
              <img
                className="selectBioFrameOverlay"
                src={asset(frameId === "bh_bio_pink" ? "bh_bio_frame/Frame_pink.png" : "bh_bio_frame/네컷프레임2_블랙_수정2 1.png")}
                alt=""
              />
              <div className="selectBioShotsGrid">
                {shots.map((shot) => (
                  <button
                    key={shot.index}
                    type="button"
                    className={`shotCard ${shot.selectedOrder != null ? "selected" : ""}`}
                    onClick={() => toggleShot(shot.index)}
                    disabled={!shot.captured}
                  >
                    {shot.previewUrl ? (
                      <>
                        <img src={shot.previewUrl} alt={`shot-${shot.index + 1}`} />
                        {shot.selectedOrder != null && (
                          <span className="shotCard__order">{shot.selectedOrder}</span>
                        )}
                      </>
                    ) : (
                      <span className="shotCard__placeholder">{shot.index + 1}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="selectBioActions">
                <p className="selectHint">사진을 4장 선택해주세요 ({selectedCount}/4)</p>
                <button
                  type="button"
                  className="btnPrint"
                  disabled={selectedCount !== SELECT_TOTAL_BIO}
                  onClick={() => void startJob()}
                >인쇄 진행</button>
              </div>
            </>
          ) : step !== "AC_SELECT" ? (
            <div className="selectFramePreviewWrap">
              <FramePreview
                frameId={isBasic ? frameId : isAnimalCrossingFrame(frameId) ? FRAME_ID_AC : "designed_default"}
                selectedShots={selectedShots}
                hideIcons={isBasic || isAnimalCrossingFrame(frameId)}
                animalCrossingSinglePhoto={isAnimalCrossingFrame(frameId)}
              />
            </div>
          ) : (
            <div className="selectAcPlaceholder">
              {selectedShots[0]?.previewUrl ? (
                <img src={selectedShots[0].previewUrl} alt="" className="selectAcPlaceholder__img" />
              ) : null}
            </div>
          )}

          {!isBio && (
            <>
              <div className="selectShotsGrid">
                {shots.map((shot) => (
                  <button
                    key={shot.index}
                    type="button"
                    className={`shotCard ${shot.selectedOrder != null ? "selected" : ""}`}
                    onClick={() => toggleShot(shot.index)}
                    disabled={!shot.captured}
                  >
                    {shot.previewUrl ? (
                      <>
                        <img src={shot.previewUrl} alt={`shot-${shot.index + 1}`} />
                        {shot.selectedOrder != null && (
                          <span className="shotCard__order">{shot.selectedOrder}</span>
                        )}
                      </>
                    ) : (
                      <span className="shotCard__placeholder">{shot.index + 1}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="selectActions">
                <p className="selectHint">
                  {isAnimalCrossingFrame(frameId)
                    ? `사진을 1장 선택해주세요 (${selectedCount}/1)`
                    : `사진을 4장 선택해주세요 (${selectedCount}/4)`}
                </p>
                {acTransformError && <p className="errorText">{acTransformError}</p>}
                <button
                  type="button"
                  className="btnPrint"
                  disabled={selectedCount !== (isAnimalCrossingFrame(frameId) ? SELECT_TOTAL_AC : SELECT_TOTAL_DEFAULT)}
                  onClick={() => (isAnimalCrossingFrame(frameId) ? void runAcTransform() : isBasic ? void startJob() : setStep("DESIGN"))}
                >{isAnimalCrossingFrame(frameId) ? "변환하기" : isBasic ? "인쇄 진행" : "다음"}</button>
              </div>
            </>
          )}
        </>
      )}

      {step === "DESIGN" && (
        <>
          <h1 className="design__title">Design</h1>

          {/* 프레임 프리뷰 + 스티커 오버레이 */}
          <div className="design__previewContainer" ref={designPreviewRef}>
            <FramePreview
              frameId={designColor || "designed_default"}
              selectedShots={selectedShots}
              hideIcons
            />

            {/* 확정된 스티커들 (고정, 드래그 불가) */}
            {committedStickers.map((s, i) => (
              <img
                key={i}
                src={asset(s.src)}
                alt=""
                className="design__dragSticker"
                style={{
                  left:        s.x * DESIGN_PREVIEW_SCALE,
                  top:         s.y * DESIGN_PREVIEW_SCALE,
                  width:       s.w * DESIGN_PREVIEW_SCALE,
                  height:      s.h * DESIGN_PREVIEW_SCALE,
                  cursor:      "default",
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* 활성(드래그 가능) 스티커 */}
            {activeSticker && (
              <>
                <img
                  src={asset(activeSticker.src)}
                  alt="sticker"
                  className="design__dragSticker"
                  style={{
                    left:   activeSticker.x * DESIGN_PREVIEW_SCALE,
                    top:    activeSticker.y * DESIGN_PREVIEW_SCALE,
                    width:  activeSticker.w * DESIGN_PREVIEW_SCALE,
                    height: activeSticker.h * DESIGN_PREVIEW_SCALE,
                  }}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    dragActiveRef.current = true;
                    const rect = e.currentTarget.getBoundingClientRect();
                    dragOffsetRef.current = {
                      ox: e.clientX - rect.left,
                      oy: e.clientY - rect.top,
                    };
                  }}
                  onPointerMove={(e) => {
                    if (!dragActiveRef.current) return;
                    const container = designPreviewRef.current;
                    if (!container) return;
                    const rect = container.getBoundingClientRect();
                    // getBoundingClientRect()는 뷰포트 픽셀 → --app-scale 반영된 실제 렌더 크기
                    // 논리 좌표계(287px)로 환산
                    const actualScale = rect.width / 287;
                    const rawX = (e.clientX - rect.left - dragOffsetRef.current.ox) / actualScale;
                    const rawY = (e.clientY - rect.top  - dragOffsetRef.current.oy) / actualScale;
                    setActiveSticker((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        x: Math.max(0, Math.min(287 - prev.w, rawX)),
                        y: Math.max(0, Math.min(432 - prev.h, rawY)),
                      };
                    });
                  }}
                  onPointerUp={() => { dragActiveRef.current = false; }}
                />

                {/* V / X 컨트롤 버튼 */}
                {(() => {
                  const displayBottom = (activeSticker.y + activeSticker.h) * DESIGN_PREVIEW_SCALE;
                  const displayCenterX = (activeSticker.x + activeSticker.w / 2) * DESIGN_PREVIEW_SCALE;
                  const btnH = 68;
                  const gap = 8;
                  const containerH = 801;
                  const top = displayBottom + gap + btnH > containerH
                    ? activeSticker.y * DESIGN_PREVIEW_SCALE - gap - btnH
                    : displayBottom + gap;
                  return (
                    <div
                      className="design__stickerControls"
                      style={{ left: displayCenterX, top }}
                    >
                      <button
                        type="button"
                        className="design__stickerCtrlBtn design__stickerCtrlBtn--confirm"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => {
                          setCommittedStickers((prev) => [...prev, activeSticker]);
                          setActiveSticker(null);
                        }}
                      >✓</button>
                      <button
                        type="button"
                        className="design__stickerCtrlBtn design__stickerCtrlBtn--delete"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => setActiveSticker(null)}
                      >✕</button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Sticker 팔레트 */}
          <p className="design__sectionLabel design__stickerLabel">Sticker</p>
          <div className="design__stickerPalette">
            {STICKER_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                className={`design__stickerPaletteBtn ${activeSticker?.src === opt.src ? "design__stickerPaletteBtn--selected" : ""}`}
                onClick={() => {
                  setActiveSticker({
                    src: opt.src,
                    w: opt.w,
                    h: opt.h,
                    x: (287 - opt.w) / 2,
                    y: (432 - opt.h) / 2,
                  });
                }}
              >
                <img src={asset(opt.src)} alt="" className="design__stickerPaletteIcon" />
              </button>
            ))}
          </div>

          {/* Colour 팔레트 */}
          <p className="design__sectionLabel design__colourLabel">Colour</p>
          <div className="design__colourPalette">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`design__colourBtn ${designColor === opt.key ? "design__colourBtn--selected" : ""}`}
                onClick={() => setDesignColor(opt.key)}
              >
                <div className="design__colourCircle" style={{ backgroundColor: opt.bgColor }} />
              </button>
            ))}
          </div>

          {/* 내비 버튼 */}
          <button
            type="button"
            className="btnQuantityPrev"
            onClick={() => {
              setCommittedStickers([]);
              setActiveSticker(null);
              setStep("SELECT");
            }}
          >이전</button>
          <button
            type="button"
            className="btnQuantityNext"
            disabled={!designColor || (committedStickers.length === 0 && !activeSticker)}
            onClick={() => void startJob(designColor, committedStickers, activeSticker)}
          >인쇄 진행</button>
        </>
      )}

      {(step === "LOADING" || step === "AC_TRANSFORMING") && (
        <div style={{ position: "absolute", inset: 0, background: isAnimalCrossingFrame(frameId) ? "#52C482" : "#f3f3f6", borderRadius: "30px" }}>
          <h1 className="loadingTitle">Loading...</h1>
          {!isAnimalCrossingFrame(frameId) && <p className="loadingSub">차의대의 새로운 마스코트! 병헌이와 비오!</p>}
          <p className="loadingSub2">{loadingText}</p>
          <p className="loadingProgress">진행률: {job?.progress ?? 0}%</p>
        </div>
      )}

      {step === "AC_RESULT" && transformedImageUrl && (
        <>
          <div className="acResultCard">
            <img src={transformedImageUrl} alt="변환 결과" className="acResultImage" />
            <img src={asset("animal-crossing/logo.png")} alt="" className="acResultLogo" />
          </div>
          <div className="acResultActions">
            <button type="button" className="acResultPrint" onClick={() => void startAcPrintJob()}>인쇄</button>
          </div>
        </>
      )}

      {step === "PRINTING" && (
        <div style={{ position: "absolute", inset: 0, background: "#f3f3f6", borderRadius: "30px" }}>
          <h1 className="loadingTitle">Printing...</h1>
          <p className="loadingSub">차의대의 새로운 마스코트! 병헌이와 비오!</p>
              {job?.status === "FAILED_PRINT" && (
            <p className="errorText printingError">
              {job.errorMessage?.startsWith("SHOT_NOT_FOUND")
                ? "선택한 사진을 찾을 수 없습니다. 다시 촬영 후 시도해 주세요."
                : job.errorMessage === "FINAL_IMAGE_NOT_CREATED"
                  ? "합성 이미지 생성에 실패했습니다. 운영자를 불러 주세요."
                  : job.errorMessage === "SUPABASE_NOT_CONFIGURED"
                    ? "Supabase가 설정되지 않았습니다. 환경 변수를 확인해 주세요."
                    : job.errorMessage ?? "인쇄 오류입니다. 운영자를 불러 주세요."}
            </p>
          )}
        </div>
      )}

      {step === "END" && (
        <>
          <h1 className="endTitle">DONE!</h1>
          <p className="endSub">인쇄가 완료되었습니다!<br />이용해주셔서 감사합니다</p>
          <button type="button" className="btnEnd" onClick={resetFlow}>처음으로</button>
        </>
      )}

    </main>
      {operatorOpen && (
        <section className="overlay">
          <div className="overlayCard">
            <h3>운영자 패널</h3>
            {!operatorUnlocked && (
              <>
                <p>PIN을 입력하세요.</p>
                <input
                  type="password"
                  value={operatorPinInput}
                  onChange={(event) => setOperatorPinInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void submitOperatorPin();
                    }
                  }}
                />
                {operatorError && <p className="errorText">{operatorError}</p>}
                <div className="row">
                  <button onClick={() => void submitOperatorPin()}>잠금 해제</button>
                  <button onClick={closeOperatorPanel}>닫기</button>
                </div>
              </>
            )}

            {operatorUnlocked && (
              <>
                {!window.kioskApi && (
                  <p className="errorText">
                    프린터·디스플레이·재시작 등 운영 기능은 Electron 데스크톱 앱에서만 사용할 수 있습니다.
                  </p>
                )}

                {/* ── Supabase 연결 설정 (웹 모드 전용) ── */}
                <hr style={{ margin: "8px 0", borderColor: "#ddd" }} />
                <h4 style={{ margin: "4px 0 8px" }}>Supabase 연결 설정</h4>
                <p style={{ fontSize: "12px", color: "#888", margin: "0 0 6px" }}>
                  Project URL과 anon public key를 입력하세요.<br />
                  저장 후 앱이 자동으로 재시작됩니다.
                </p>
                <label style={{ fontSize: "13px", display: "block", marginBottom: "2px" }}>Project URL</label>
                <input
                  type="text"
                  placeholder="https://xxxx.supabase.co"
                  value={sbUrlInput}
                  onChange={(e) => setSbUrlInput(e.target.value)}
                  style={{ width: "100%", marginBottom: "6px", padding: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
                <label style={{ fontSize: "13px", display: "block", marginBottom: "2px" }}>Anon Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGci..."
                  value={sbKeyInput}
                  onChange={(e) => setSbKeyInput(e.target.value)}
                  style={{ width: "100%", marginBottom: "6px", padding: "6px", fontSize: "13px", boxSizing: "border-box" }}
                />
                <div className="row">
                  <button
                    disabled={!sbUrlInput.trim() || !sbKeyInput.trim()}
                    onClick={() => {
                      saveSupabaseConfig(sbUrlInput, sbKeyInput);
                      setSbSaveMsg("저장 완료! 재시작합니다...");
                      setTimeout(() => window.location.reload(), 1000);
                    }}
                  >
                    저장 &amp; 재시작
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm("Supabase 설정을 초기화하시겠습니까?")) return;
                      localStorage.removeItem("kiosk_supabase_url");
                      localStorage.removeItem("kiosk_supabase_anon_key");
                      setSbUrlInput("");
                      setSbKeyInput("");
                      setSbSaveMsg("초기화 완료. 재시작합니다...");
                      setTimeout(() => window.location.reload(), 1000);
                    }}
                  >
                    초기화
                  </button>
                </div>
                {sbSaveMsg && <p style={{ color: "#2a6", fontSize: "13px", margin: "4px 0 0" }}>{sbSaveMsg}</p>}
                <hr style={{ margin: "12px 0", borderColor: "#ddd" }} />

                <p>환경: {opsStatus?.appEnv ?? "-"}</p>
                <p>프린터: {opsStatus?.printerDeviceName ?? "-"}</p>
                <p>SKIP_PRINT: {String(opsStatus?.skipPrint ?? false)}</p>
                <div className="row">
                  <select
                    value={selectedPrinter}
                    onChange={(event) => setSelectedPrinter(event.target.value)}
                    disabled={!window.kioskApi}
                  >
                    {printers.length === 0 && <option value="">프린터 없음</option>}
                    {printers.map((printer) => (
                      <option key={printer.name} value={printer.name}>
                        {printer.name}
                        {printer.isDefault ? " (기본)" : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={!selectedPrinter || !window.kioskApi}
                    onClick={async () => {
                      if (!window.kioskApi?.setPrinter) {
                        return;
                      }
                      const result = await window.kioskApi.setPrinter({
                        deviceName: selectedPrinter
                      });
                      if (result.ok) {
                        setOpsStatus((prev) =>
                          prev
                            ? { ...prev, printerDeviceName: result.printerDeviceName }
                            : {
                                appEnv: "-",
                                skipPrint: false,
                                printerDeviceName: result.printerDeviceName
                              }
                        );
                        setOpsMessage(`프린터 설정 저장: ${result.printerDeviceName}`);
                      }
                    }}
                  >
                    프린터 적용
                  </button>
                </div>
                <div className="row">
                  <button
                    disabled={!window.kioskApi}
                    onClick={async () => {
                      if (!window.kioskApi?.testPrint) {
                        return;
                      }
                      setOpsMessage("테스트 인쇄 중...");
                      const result = await window.kioskApi.testPrint();
                      setOpsMessage(result.ok ? "테스트 인쇄 완료" : "테스트 인쇄 실패");
                    }}
                  >
                    테스트 인쇄
                  </button>
                  <button
                    disabled={!window.kioskApi}
                    onClick={async () => {
                      await refreshFailedJobs();
                      setOpsMessage("실패 세션 목록을 갱신했습니다.");
                    }}
                  >
                    실패 목록 새로고침
                  </button>
                </div>
                {opsMessage && <p>{opsMessage}</p>}
                <div className="failedList">
                  <h4>실패 세션</h4>
                  {failedJobs.length === 0 && <p>없음</p>}
                  {failedJobs.map((item) => (
                    <div key={item.uuid} className="failedItem">
                      <div>
                        <strong>{item.uuid}</strong>
                        <p>{item.errorMessage}</p>
                        <p>{item.updatedAt}</p>
                      </div>
                      <button
                        disabled={!window.kioskApi}
                        onClick={async () => {
                          if (!window.kioskApi?.retryFailedJob) {
                            return;
                          }
                          const result = await window.kioskApi.retryFailedJob({ uuid: item.uuid });
                          if (result.ok) {
                            setOpsMessage(`재시도 시작: ${item.uuid}`);
                            await refreshFailedJobs();
                          } else {
                            setOpsMessage(`재시도 실패: ${result.message ?? "UNKNOWN"}`);
                          }
                        }}
                      >
                        재시도
                      </button>
                    </div>
                  ))}
                </div>
                <hr style={{ margin: "12px 0", borderColor: "#ddd" }} />
                <h4 style={{ margin: "8px 0 4px" }}>화면 설정</h4>
                <div className="row">
                  <select
                    value={selectedDisplay}
                    onChange={(e) => setSelectedDisplay(Number(e.target.value))}
                    disabled={!window.kioskApi}
                  >
                    {displays.length === 0 && <option value={0}>디스플레이 정보 없음</option>}
                    {displays.map((d) => (
                      <option key={d.index} value={d.index}>{d.label}</option>
                    ))}
                  </select>
                  <button
                    disabled={displays.length === 0 || !window.kioskApi}
                    onClick={async () => {
                      if (!window.kioskApi?.setDisplay) {
                        return;
                      }
                      const result = await window.kioskApi.setDisplay({ displayIndex: selectedDisplay });
                      setOpsMessage(result.ok ? `디스플레이 ${selectedDisplay + 1}번으로 이동 완료` : `이동 실패: ${result.message ?? "오류"}`);
                    }}
                  >
                    모니터 적용
                  </button>
                </div>
                <div className="row">
                  <button
                    disabled={!window.kioskApi}
                    onClick={async () => {
                      if (!window.kioskApi?.setFullscreen) {
                        return;
                      }
                      const next = !isFullscreen;
                      await window.kioskApi.setFullscreen({ fullscreen: next });
                      setIsFullscreen(next);
                      setOpsMessage(next ? "전체화면으로 전환" : "창 모드로 전환");
                    }}
                  >
                    {isFullscreen ? "창 모드로 전환" : "전체화면으로 전환"}
                  </button>
                  <span style={{ fontSize: "13px", color: "#888" }}>또는 Alt+Enter</span>
                </div>
                <hr style={{ margin: "12px 0", borderColor: "#ddd" }} />
                <div className="row">
                  <button
                    onClick={() => {
                      closeOperatorPanel();
                      resetFlow();
                    }}
                  >
                    강제 홈 복귀
                  </button>
                  <button
                    onClick={() => {
                      if (window.kioskApi?.restartApp) {
                        void window.kioskApi.restartApp();
                      } else {
                        window.location.reload();
                      }
                    }}
                  >
                    앱 재시작
                  </button>
                  <button onClick={closeOperatorPanel}>닫기</button>
                </div>

                {/* ── 업데이트 노트 ── */}
                <hr style={{ margin: "12px 0", borderColor: "#ddd" }} />
                <button
                  onClick={() => setChangelogOpen((v) => !v)}
                  style={{ width: "100%", textAlign: "left", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "6px", padding: "8px 12px", cursor: "pointer", fontSize: "14px", fontWeight: 700 }}
                >
                  {changelogOpen ? "▲" : "▼"} 업데이트 노트
                </button>
                {changelogOpen && (
                  <div style={{ marginTop: "8px", fontSize: "13px", lineHeight: "1.7", color: "#333", background: "#fafafa", border: "1px solid #ddd", borderRadius: "6px", padding: "12px", maxHeight: "320px", overflowY: "auto" }}>
                    <strong>v0.95a</strong>
                    <ul style={{ margin: "4px 0 12px 16px", padding: 0 }}>
                      <li>메인화면 2열 그리드 레이아웃 적용</li>
                      <li>BH Bio Frame 버튼 좌측 대형 이미지로 교체</li>
                      <li>BASIC / DESIGNED 촬영 횟수 9 → 6으로 변경</li>
                      <li>SELECT 화면 샷 그리드 실제 인쇄 슬롯 크기(240×260px)로 변경</li>
                      <li>촬영 남은횟수 표시 잘림 버그 수정</li>
                      <li>찍힌 사진 좌우 반전 수정 (canvas scaleX -1 적용)</li>
                      <li>전체 폰트 Cafe24 Ssurround OTF 우선 적용</li>
                      <li>기기별 Supabase 연결 설정 기능 추가 (운영자 패널)</li>
                    </ul>
                    <strong>v0.92a</strong>
                    <ul style={{ margin: "4px 0 12px 16px", padding: 0 }}>
                      <li>BH Bio Frame 카드 Coming Soon 처리</li>
                      <li>운영자 패널 PIN 인증, 프린터·디스플레이 설정</li>
                      <li>동물의 숲 모드 추가</li>
                    </ul>
                    <strong>v0.90a</strong>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      <li>최초 릴리즈</li>
                      <li>BASIC / DESIGNED / BH Bio Frame 기본 플로우</li>
                      <li>Supabase 연동 인쇄 파이프라인</li>
                    </ul>
                  </div>
                )}
              
              </>
            )}
          </div>
        </section>
      )}
    </div>
    </div>
  );
}
