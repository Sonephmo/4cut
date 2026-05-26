import "dotenv/config";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { silentPrintImage } from "./print.js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const printerName = process.env.PRINTER_DEVICE_NAME ?? "Canon SELPHY CP1500";
const skipPrint = (process.env.SKIP_PRINT ?? "false").toLowerCase() === "true";
const landscapeEnv = (process.env.LANDSCAPE ?? "").toLowerCase();
const landscape: boolean | undefined =
  landscapeEnv === "true"  ? true  :
  landscapeEnv === "false" ? false :
  undefined;

if (!url || !serviceKey) {
  console.error("SUPABASE_URL 및 SUPABASE_SERVICE_ROLE_KEY 를 .env 에 설정하세요.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

type PrintJobRow = {
  id: string;
  file_path: string;
  copies: number;
  status: string;
};

let processing = false;
const queue: PrintJobRow[] = [];

async function downloadToTemp(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("photos").download(filePath);
  if (error || !data) {
    throw new Error(`STORAGE_DOWNLOAD: ${error?.message ?? "no blob"}`);
  }
  const buf = Buffer.from(await data.arrayBuffer());
  const tmp = path.join(os.tmpdir(), `haesol_job_${Date.now()}_${path.basename(filePath)}`);
  await fs.writeFile(tmp, buf);
  return tmp;
}

async function processJob(row: PrintJobRow): Promise<void> {
  const { id, file_path: filePath, copies } = row;
  const n = Math.min(Math.max(copies, 1), 99);

  const { data: claimed } = await supabase
    .from("print_jobs")
    .update({ status: "printing", error_message: null })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (!claimed) {
    console.log(`[job] skip (not pending or claimed): ${id}`);
    return;
  }

  let localPath: string | null = null;
  try {
    localPath = await downloadToTemp(filePath);

    if (skipPrint) {
      console.log(`[job] SKIP_PRINT=true → 인쇄 생략: ${filePath}`);
    } else {
      for (let i = 0; i < n; i++) {
        console.log(`[job] print ${i + 1}/${n} → ${printerName}`);
        await silentPrintImage({ imagePath: localPath, deviceName: printerName, landscape });
      }
    }

    await supabase
      .from("print_jobs")
      .update({ status: "done", error_message: null })
      .eq("id", id);
    console.log(`[job] done ${id}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[job] failed ${id}`, msg);
    await supabase.from("print_jobs").update({ status: "failed", error_message: msg }).eq("id", id);
  } finally {
    if (localPath) {
      await fs.unlink(localPath).catch(() => undefined);
    }
  }
}

async function drainQueue(): Promise<void> {
  if (processing) {
    return;
  }
  processing = true;
  try {
    while (queue.length > 0) {
      const row = queue.shift();
      if (row) {
        await processJob(row);
      }
    }
  } finally {
    processing = false;
  }
}

function enqueue(row: PrintJobRow): void {
  queue.push(row);
  void drainQueue();
}

async function loadPending(): Promise<void> {
  const { data, error } = await supabase
    .from("print_jobs")
    .select("id, file_path, copies, status")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("loadPending", error);
    return;
  }
  for (const row of data ?? []) {
    enqueue(row as PrintJobRow);
  }
}

const landscapeLabel = landscape === true ? "forced-landscape" : landscape === false ? "forced-portrait" : "auto";
console.log(`[printer-app] device=${printerName} skipPrint=${skipPrint} landscape=${landscapeLabel}`);

await loadPending();

supabase
  .channel("print_jobs_inserts")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "print_jobs" },
    (payload) => {
      const row = payload.new as PrintJobRow;
      if (row.status === "pending") {
        enqueue(row);
      }
    }
  )
  .subscribe((status) => {
    console.log("[realtime]", status);
  });

process.on("SIGINT", () => {
  console.log("종료");
  process.exit(0);
});
