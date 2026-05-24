const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// 1) design/assets -> public/design-assets
const src = path.join(root, "design", "assets");
const dest = path.join(root, "public", "design-assets");

if (!fs.existsSync(src)) {
  console.warn("[copy-assets] design/assets not found, skipping");
} else {
  fs.mkdirSync(dest, { recursive: true });
  function copyDir(from, to) {
    const entries = fs.readdirSync(from, { withFileTypes: true });
    for (const e of entries) {
      const s = path.join(from, e.name);
      const t = path.join(to, e.name);
      if (e.isDirectory()) {
        fs.mkdirSync(t, { recursive: true });
        copyDir(s, t);
      } else {
        fs.copyFileSync(s, t);
      }
    }
  }
  copyDir(src, dest);
  console.log("[copy-assets] copied design/assets -> public/design-assets");
}

// 2) design/tsx design/2_2 Designed Frame/source -> public/design-assets/designed-frame (이름 매핑)
const source22 = path.join(root, "design", "tsx design", "2_2 Designed Frame", "source");
const root22 = path.join(root, "design", "tsx design", "2_2 Designed Frame");
const dest22 = path.join(root, "public", "design-assets", "designed-frame");

const nameMapSource = {
  "Photo AIdata-1.png": "photo-aidata-1.png",
  "Photo AIdata.png": "photo-aidata-1-1.png",
  "Photo Frame_DK.png": "photo-frame-DK-1.png",
  "Photo Frame_MC.png": "photo-frame-MC-1.png",
  "Photo Frame_Nurse.png": "photo-frame-nurse-1.png",
};

const nameMapRoot = {
  "Photo AIdata 1.png": "photo-aidata-1.png",
  "Photo Digital Health.png": "photo-frame-DH-1.png",
  "Photo Frame_DK 1.png": "photo-frame-DK-1.png",
  "Photo Frame_MC 1.png": "photo-frame-MC-1.png",
  "Photo Frame_Nurse 1.png": "photo-frame-nurse-1.png",
};

function copyWithMap(fromDir, toDir, map) {
  const entries = fs.readdirSync(fromDir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith(".png")) continue;
    const targetName = map[e.name] || e.name;
    fs.copyFileSync(path.join(fromDir, e.name), path.join(toDir, targetName));
  }
}

if (fs.existsSync(source22)) {
  fs.mkdirSync(dest22, { recursive: true });
  copyWithMap(source22, dest22, nameMapSource);
  console.log("[copy-assets] copied 2_2 Designed Frame/source -> public/design-assets/designed-frame");
}

// 3) design/tsx design/2_1 Basic Frame/*.png -> public/design-assets/
const src21 = path.join(root, "design", "tsx design", "2_1 Basic Frame");
const dest21 = dest; // public/design-assets
if (fs.existsSync(src21)) {
  for (const name of ["basic-frame-black.png", "basic-frame-white.png"]) {
    const s = path.join(src21, name);
    if (fs.existsSync(s)) fs.copyFileSync(s, path.join(dest21, name));
  }
  console.log("[copy-assets] copied 2_1 Basic Frame PNGs -> public/design-assets");
}

if (fs.existsSync(root22)) {
  fs.mkdirSync(dest22, { recursive: true });
  copyWithMap(root22, dest22, nameMapRoot);
  // 2_2 썸네일 이미지(image-124 ~ image-133) 복사 (공백 → 하이픈 정규화)
  const entries22 = fs.readdirSync(root22, { withFileTypes: true });
  for (const e of entries22) {
    if (!e.isFile() || !e.name.endsWith(".png")) continue;
    if (!/^image[\s-]\d+\.png$/.test(e.name)) continue;
    const normalized = e.name.replace(/\s+/g, "-");
    fs.copyFileSync(path.join(root22, e.name), path.join(dest22, normalized));
  }
  console.log("[copy-assets] copied 2_2 Designed Frame (root) -> public/design-assets/designed-frame");
}

// 4) design/tsx design/1_main/*.png -> public/design-assets/main/
const src1main = path.join(root, "design", "tsx design", "1_main");
const dest1main = path.join(dest, "main");
if (fs.existsSync(src1main)) {
  fs.mkdirSync(dest1main, { recursive: true });
  const entries1m = fs.readdirSync(src1main, { withFileTypes: true });
  for (const e of entries1m) {
    if (!e.isFile() || !e.name.endsWith(".png")) continue;
    fs.copyFileSync(path.join(src1main, e.name), path.join(dest1main, e.name));
  }
  console.log("[copy-assets] copied 1_main PNGs -> public/design-assets/main");
}

// 5) Photo Frame icons -> public/design-assets/frame-icons/
const frameIconMap = [
  { folder: "Photo Frame_경영학과",        files: [["경영1.png", "biz-1.png"],         ["경영2.png", "biz-2.png"]] },
  { folder: "Photo Frame_AI의료데이터",     files: [["AI2.png", "ai-1.png"],            ["AI1.png", "ai-2.png"]] },
  { folder: "Photo Frame_디지털보건의료",   files: [["디보1.png", "dh-1.png"],          ["디보2.png", "dh-2.png"]] },
  { folder: "Photo Frame_간호학과",         files: [["간호1.png", "nurse-1.png"],       ["간호2.png", "nurse-2.png"]] },
  { folder: "Photo Frame_미디어커뮤니케이션", files: [["미컴1.png", "media-1.png"],     ["미컴2.png", "media-2.png"]] },
  { folder: "Photo Frame_상담심리학과",     files: [["상심1.png", "counseling-1.png"], ["상심2.png", "counseling-2.png"]] },
  { folder: "Photo Frame_약학",             files: [["약학1.png", "pharm-1.png"],       ["약학2.png", "pharm-2.png"]] },
  { folder: "Photo Frame_바이오식의약학",   files: [["바식1.png", "bio-1.png"],         ["바식2.png", "bio-2.png"]] },
  { folder: "Photo Frame_세포유전자",       files: [["세유1.png", "cell-1.png"],        ["세유2.png", "cell-2.png"]] },
  { folder: "Photo Frame_시스템생명과학",   files: [["시스템1.png", "sys-1.png"],       ["시스템2.png", "sys-2.png"]] },
];
const destIcons = path.join(dest, "frame-icons");
fs.mkdirSync(destIcons, { recursive: true });
for (const { folder, files } of frameIconMap) {
  const srcFolder = path.join(root, "design", "tsx design", folder);
  for (const [srcName, destName] of files) {
    const srcFile = path.join(srcFolder, srcName);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(destIcons, destName));
    } else {
      console.warn(`[copy-assets] missing icon: ${folder}/${srcName}`);
    }
  }
}
console.log("[copy-assets] copied Photo Frame icons -> public/design-assets/frame-icons");

// 6-a) 해솔 캐릭터 스티커 -> public/design-assets/haesol/
const srcHaesol = path.join(root, "design", "해솔");
const destHaesol = path.join(dest, "haesol");
if (fs.existsSync(srcHaesol)) {
  fs.mkdirSync(destHaesol, { recursive: true });
  // PNG 파일 (직접 하위)
  const hEntries = fs.readdirSync(srcHaesol, { withFileTypes: true });
  for (const e of hEntries) {
    if (!e.isFile()) continue;
    fs.copyFileSync(path.join(srcHaesol, e.name), path.join(destHaesol, e.name));
  }
  // SVG 파일 (해솔 svg 하위 폴더)
  const srcHaesolSvg = path.join(srcHaesol, "해솔 svg");
  if (fs.existsSync(srcHaesolSvg)) {
    const svgEntries = fs.readdirSync(srcHaesolSvg, { withFileTypes: true });
    for (const e of svgEntries) {
      if (!e.isFile() || !e.name.endsWith(".svg")) continue;
      fs.copyFileSync(path.join(srcHaesolSvg, e.name), path.join(destHaesol, e.name));
    }
    console.log("[copy-assets] copied 해솔 SVG 스티커 -> public/design-assets/haesol");
  }
  console.log("[copy-assets] copied 해솔 캐릭터 스티커 -> public/design-assets/haesol");
} else {
  console.warn("[copy-assets] design/해솔 폴더가 없습니다.");
}

// 6-b) 폰트 파일 -> public/design-assets/Eulyoo_font_201204/, public/design-assets/
const srcFont = path.join(root, "design", "Eulyoo_font_201204");
const destFont = path.join(dest, "Eulyoo_font_201204");
if (fs.existsSync(srcFont)) {
  fs.mkdirSync(destFont, { recursive: true });
  for (const fname of ["Eulyoo1945-Regular.otf", "Eulyoo1945-SemiBold.otf"]) {
    const s = path.join(srcFont, fname);
    if (fs.existsSync(s)) fs.copyFileSync(s, path.join(destFont, fname));
  }
  console.log("[copy-assets] copied Eulyoo1945 폰트 -> public/design-assets/Eulyoo_font_201204");
}
const srcGowun = path.join(root, "design", "GowunDodum-Regular.ttf");
if (fs.existsSync(srcGowun)) {
  fs.copyFileSync(srcGowun, path.join(dest, "GowunDodum-Regular.ttf"));
  console.log("[copy-assets] copied GowunDodum-Regular.ttf -> public/design-assets");
}

// 7) 촬영 사운드 MP3 -> public/design-assets/sounds/
const srcSounds = path.join(root, "design", "tsx design", "4_3 Shooting");
const destSounds = path.join(dest, "sounds");
if (fs.existsSync(srcSounds)) {
  fs.mkdirSync(destSounds, { recursive: true });
  const soundFiles = fs.readdirSync(srcSounds).filter(f => f.endsWith(".mp3"));
  for (const f of soundFiles) {
    fs.copyFileSync(path.join(srcSounds, f), path.join(destSounds, f));
  }
  if (soundFiles.length > 0) {
    console.log(`[copy-assets] copied ${soundFiles.length}개 MP3 -> public/design-assets/sounds`);
  } else {
    console.warn("[copy-assets] 4_3 Shooting 폴더에 MP3 파일이 없습니다.");
  }
} else {
  console.warn("[copy-assets] 4_3 Shooting 폴더가 없습니다.");
}

// 7-b) 동물의 숲: 카운트다운 전용 사운드, 폰트, 프레임 PNG/SVG(design/animal-crossing)
fs.mkdirSync(destSounds, { recursive: true });
const acMp3 = path.join(root, "design", "동숲.mp3");
if (fs.existsSync(acMp3)) {
  fs.copyFileSync(acMp3, path.join(destSounds, "ac-countdown.mp3"));
  console.log("[copy-assets] design/동숲.mp3 -> sounds/ac-countdown.mp3");
}
const hunhwa = path.join(root, "design", "훈화양연화R.ttf");
if (fs.existsSync(hunhwa)) {
  fs.copyFileSync(hunhwa, path.join(dest, "훈화양연화R.ttf"));
  console.log("[copy-assets] copied 훈화양연화R.ttf -> public/design-assets");
}
const srcAcDir = path.join(root, "design", "animal-crossing");
const destAcDir = path.join(dest, "animal-crossing");
if (fs.existsSync(srcAcDir)) {
  fs.mkdirSync(destAcDir, { recursive: true });
  fs.cpSync(srcAcDir, destAcDir, { recursive: true });
  console.log("[copy-assets] design/animal-crossing -> public/design-assets/animal-crossing");
}
