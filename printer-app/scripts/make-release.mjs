import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const exeName = "haesol-4cut-printer.exe";
const srcExe = path.join(root, "dist-pkg", exeName);
const outDir = path.join(root, "release", "haesol-4cut-printer");

await fs.mkdir(outDir, { recursive: true });
await fs.copyFile(srcExe, path.join(outDir, exeName));
await fs.copyFile(path.join(root, ".env.example"), path.join(outDir, ".env.example"));

const readme = [
  "해솔네컷 프린터 데몬 (포터블)",
  "",
  "1) 이 폴더에 .env.example 을 복사해 이름을 .env 로 바꿉니다.",
  "2) .env 에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PRINTER_DEVICE_NAME 등을 입력합니다.",
  "3) haesol-4cut-printer.exe 를 실행합니다. (Node.js 별도 설치 불필요)",
  "",
  "※ .env 는 반드시 EXE 와 같은 폴더에 두세요.",
  "※ 시작 프로그램/바로가기로 실행해도 위 폴더의 .env 를 읽습니다.",
].join("\r\n");

await fs.writeFile(path.join(outDir, "사용방법.txt"), readme, "utf8");
console.log(`Release folder: ${outDir}`);
