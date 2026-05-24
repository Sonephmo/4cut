/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** 동숲 변환 fal.ai API 키 — 없으면 mock(지연 후 원본 유지) */
  readonly VITE_FAL_KEY?: string;
}

declare global {
  interface Window {
    /** Electron preload에서만 주입. 브라우저(Vercel)에서는 없음 */
    kioskApi?: {
      createSession: (payload: { frameId: string; copies: number }) => Promise<{
        uuid: string;
        frameId: string;
        copies: number;
        createdAt: string;
      }>;
      getSession: (uuid: string) => Promise<{
        uuid: string;
        frameId: string;
        copies: number;
        createdAt: string;
      } | null>;
      saveShot: (payload: {
        uuid: string;
        index: number;
        mime: string;
        bytes: number[];
      }) => Promise<{ ok: boolean; localPath: string }>;
      listShots: (payload: { uuid: string }) => Promise<{
        shots: Array<{ index: number; localPath: string }>;
      }>;
      startJob: (payload: {
        uuid: string;
        selectedIndexes: number[];
        copies: number;
      }) => Promise<{ jobId: string }>;
      getJobStatus: (payload: { uuid: string }) => Promise<{
        uuid: string;
        status: "QUEUED" | "COMPOSING" | "PRINTING" | "DONE" | "FAILED_PRINT";
        progress: number;
        errorMessage?: string;
      } | null>;
      verifyOperatorPin: (payload: { pin: string }) => Promise<{ ok: boolean }>;
      getOpsStatus: () => Promise<{
        printerDeviceName: string;
        skipPrint: boolean;
        appEnv: string;
      }>;
      getPrinters: () => Promise<{
        printers: Array<{ name: string; isDefault: boolean }>;
      }>;
      setPrinter: (payload: { deviceName: string }) => Promise<{
        ok: boolean;
        printerDeviceName: string;
      }>;
      testPrint: () => Promise<{ ok: boolean }>;
      listFailedJobs: () => Promise<{
        jobs: Array<{
          uuid: string;
          frameId: string;
          selectedIndexes: number[];
          copies: number;
          errorMessage: string;
          updatedAt: string;
        }>;
      }>;
      retryFailedJob: (payload: { uuid: string }) => Promise<{
        ok: boolean;
        message?: string;
      }>;
      restartApp: () => Promise<{ ok: boolean }>;
      getDisplays: () => Promise<{
        displays: Array<{ index: number; label: string; width: number; height: number }>;
        currentIndex: number;
      }>;
      setDisplay: (payload: { displayIndex: number }) => Promise<{ ok: boolean; message?: string }>;
      setFullscreen: (payload: { fullscreen: boolean }) => Promise<{ ok: boolean; fullscreen: boolean }>;
    };
  }
}

export {};
