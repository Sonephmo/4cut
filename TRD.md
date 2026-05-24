TRD: 해솔네컷 키오스크 포토부스 (v1.0)
1) 기술 목표

현장 무인 운영 안정성 최우선: 인쇄 실패/네트워크 불안정/앱 크래시 시에도 최소한 “인쇄”는 성공시키고 운영자가 복구 가능하게 한다.

인쇄 품질 일관성: 4×6 출력물의 레이아웃, 여백, 프레임 오버레이가 PC/드라이버 차이로 흔들리지 않게 한다.

클라우드 전달(QR) 자동화: Supabase에 저장, UUID 기반 Viewer 링크 생성, QR 표시까지 “Job 기반 상태머신”으로 제어한다.

2) 권장 기술 스택(확정안)
2.1 런타임/앱

Electron (키오스크 쉘 + 무인 인쇄 + 로컬 파일 I/O + IPC)

Vite + React + TypeScript (Renderer/UI)

패키징: electron-builder (Windows 설치/포터블 선택)

2.2 이미지/출력/QR

이미지 합성: sharp (권장: 빠르고 안정적)

QR 생성: qrcode(node)

(선택) 프린트 전용 HTML 렌더링: Renderer가 아닌 PrintWindow(숨김 BrowserWindow)

2.3 로컬 저장/로그(복구용)

SQLite (better-sqlite3): 세션/잡 상태, 로컬 파일 경로, 업로드 재시도 큐 저장

로그: pino 또는 winston + 파일 로그

2.4 Supabase / Viewer

Supabase: @supabase/supabase-js

보안 권장 구조: 키오스크에는 anon key만 두고, Storage 업로드/서명 URL 발급/만료검사는 Edge Function을 통해 수행
(단, Edge Function 구현이 어려우면 v1에서는 service role을 키오스크에 두는 “운영 단순 모드”도 허용)

Viewer: Vercel(Next.js 또는 정적+서버리스), /p/{uuid}에서 만료체크 후 이미지 표시

3) 시스템 아키텍처
3.1 프로세스 구성

Renderer(UI): 촬영(웹캠), 10장 썸네일, 4장 선택, 로딩/완료(QR) 표시

Main(Orchestrator): 세션 생성/상태머신, 로컬 저장, 합성(sharp), 인쇄(Print Adapter), Supabase 업로드, Viewer URL 생성/반환

Print Adapter(숨김 PrintWindow): 최종 이미지 1장을 출력용 HTML에 로드 후 silent print 수행

중요 맥락: 별도 로컬 HTTP 백엔드(Fastify 등)를 띄울 수도 있으나, v1은 프로세스 수를 줄여 안정성을 높이기 위해 IPC 중심으로 구현한다.

3.2 데이터 흐름(요약)

Renderer: session 시작 → Main: session.create

Renderer: 10장 촬영(Blob) → Main: shots.save(index)로 로컬 저장

Renderer: 4장 선택 확정 → Main: job.start({selectedIndexes, frameId, copies})

Main: 합성 → 인쇄(성공) → 업로드(재시도 가능) → 완료 시 viewerUrl 반환

Renderer: 로딩 폴링(job.status) → 완료 시 QR 표시

4) 폴더 구조(권장)
/electron
  main.ts
  preload.ts
  printWindow.ts
  jobRunner.ts
  supabaseClient.ts
  db.ts
  storageLocal.ts
  logger.ts
/src
  /ui (사용자 제작 UI)
  /features
    camera/
    select/
    loading/
    done/
  /shared
    types.ts
    templates/
      postcard_4x6_2x2.json
/assets
  frames/
    basic/
    designed/
/viewer (별도 repo 권장: Vercel 배포)

5) 핵심 스펙: 출력/템플릿
5.1 출력 이미지 규격

결과물: 4×6 2×2 레이아웃

내부 처리 표준: 가로 1800×1200px(명목 300dpi 기준)

각 슬롯은 cover crop(비율 유지 + 중앙 크롭)

안전영역(safe area) 포함: 프레임/텍스트/주요 피사체가 가장자리에서 잘리지 않게 템플릿에 여백 반영

중요 맥락: 무테(borderless)에서 드라이버가 약간 확대/크롭하는 경우가 있어, 안전영역은 필수다.

5.2 템플릿 JSON 스키마(공유 스펙)

postcard_4x6_2x2.json

{
  "id": "postcard_4x6_2x2_v1",
  "canvas": { "w": 1800, "h": 1200 },
  "safeMargin": { "x": 60, "y": 60 },
  "slots": [
    { "id": "TL", "x": 90,  "y": 90,  "w": 780, "h": 510, "radius": 24 },
    { "id": "TR", "x": 930, "y": 90,  "w": 780, "h": 510, "radius": 24 },
    { "id": "BL", "x": 90,  "y": 600, "w": 780, "h": 510, "radius": 24 },
    { "id": "BR", "x": 930, "y": 600, "w": 780, "h": 510, "radius": 24 }
  ],
  "fillOrder": ["TL", "TR", "BL", "BR"],
  "background": { "type": "solid", "color": "#0B0B0F" }
}

5.3 채움 규칙(확정)

Renderer에서 사용자가 선택한 4장의 순서를 selected[0..3]로 확정

Main 합성 시 fillOrder에 맞게:

TL=selected[0], TR=selected[1], BL=selected[2], BR=selected[3]

6) 촬영/선택 파이프라인(Renderer)
6.1 촬영

getUserMedia({ video })로 프리뷰

촬영은 총 10회

각 촬영은 Canvas 캡처 후 Blob(JPEG 권장, 품질 0.9 내외) 생성

생성된 Blob은 즉시 Main으로 전송하여 로컬 저장(메모리 누수 방지)

6.2 선택

10장 썸네일 표시(로컬 경로 또는 data URL)

선택 수 4장 제한

선택 완료 시 선택 순서대로 프리뷰 템플릿 좌상부터 채움

7) IPC 인터페이스(중요)

중요 맥락: Renderer ↔ Main 통신 규약을 고정해야 UI가 바뀌어도 백엔드가 안정적으로 동작한다.

7.1 IPC 채널 목록(권장)

session:create → { frameCategory, frameId, copies } → { uuid, createdAt, expiresAt }

shots:save → { uuid, index, mime, bytes } → { ok, localPath }

shots:list → { uuid } → { shots: [{ index, localPath, thumbPath? }] }

job:start → { uuid, selectedIndexes[4], frameId, templateId, copies } → { jobId }

job:status → { uuid } → { status, progress, errorCode?, errorMessage?, viewerUrl? }

job:cancel(운영자) → { uuid }

ops:getDevices(운영자) → 프린터 목록/카메라 목록

ops:setPrinter(운영자) → deviceName 저장

ops:testPrint(운영자)

7.2 전송 데이터 형태

이미지 전송은 base64 금지(과부하)
→ Renderer에서 Blob.arrayBuffer() → Uint8Array로 변환해 IPC 전달

8) Job 상태머신(필수)
8.1 상태 정의

CREATED

CAPTURING / CAPTURED (10장 저장 완료)

SELECTED (4장 확정)

COMPOSING

PRINTING

UPLOADING

DONE

실패 분기:

FAILED_COMPOSE

FAILED_PRINT

FAILED_UPLOAD (인쇄는 성공했을 수도 있음)

8.2 정책(권장)

인쇄 성공을 1차 성공으로 간주

업로드 실패는 FAILED_UPLOAD로 남기되, 백그라운드 재시도 큐로 전환 가능

UI 로딩은 job:status 폴링(예: 300~500ms)로 진행 상태를 표시

9) 합성 파이프라인(Main, sharp)
9.1 입력

선택된 4장의 로컬 파일 경로

프레임 PNG(알파 포함) 경로

템플릿 JSON

9.2 처리(권장 알고리즘)

템플릿 캔버스 생성(배경색 fill)

각 슬롯에 대해:

원본을 슬롯 크기에 맞게 cover crop 리사이즈

radius가 있다면 마스크 적용(rounded)

모든 슬롯 합성 후, 프레임 PNG를 최상단 overlay

결과를 JPEG 또는 PNG로 저장

인쇄 품질/속도 균형: JPEG(quality 90~95) 추천

프레임이 얇고 그라데이션/텍스트가 많으면 PNG도 가능(파일 커짐)

9.3 출력 파일

local/session/{uuid}/final/print.jpg

(옵션) local/session/{uuid}/final/print_thumb.jpg

10) 무인 인쇄 파이프라인(Main + PrintWindow)
10.1 개요

Main이 숨김 PrintWindow를 생성

PrintWindow는 로컬 파일(print.jpg)을 포함한 매우 단순한 HTML을 로드

webContents.print({ silent: true, printBackground: true, deviceName })

10.2 PrintWindow HTML 규칙

페이지 여백 0, 이미지 100%로 맞춤

스케일링은 HTML에서 고정(예: CSS로 contain/cover가 아니라 “정확히 페이지 채움”)

프린터 설정(방향/무테)은 운영 PC에서 기본값을 고정(운영자 체크리스트로 관리)

10.3 인쇄 장수

copies 값만큼 반복 print 호출

중복 인쇄 방지:

PRINTING 상태에서 재호출 방지(락)

실패 시 운영자 확인 후 수동 재시도(정책)

중요 맥락: “자동 재시도”는 같은 사진이 여러 장 중복 출력되는 사고를 낳기 쉬워, v1은 운영자 개입 기반 재시도가 안전하다.

11) Supabase 업로드/만료/Viewer 연동
11.1 DB 스키마(권장)

테이블: sessions

uuid (PK, text)

created_at (timestamptz)

expires_at (timestamptz) = created_at + 30 days

status (text)

frame_id (text)

template_id (text)

copies (int)

selected_indexes (int[]) // 길이 4

raw_count (int) = 10

raw_paths (text[]) // storage paths

final_path (text)

viewer_url (text)

error_code (text, nullable)

error_message (text, nullable)

printed_at (timestamptz, nullable)

uploaded_at (timestamptz, nullable)

(선택) 테이블: session_events

상태 전이 로그(운영 분석/디버깅)

11.2 Storage 경로 규칙

버킷: haesol-necut

sessions/{uuid}/raw/00.jpg … 09.jpg

sessions/{uuid}/final/print.jpg

sessions/{uuid}/meta.json

11.3 보안 모드(권장: Edge Function)

키오스크에 service role을 두지 않고:

Edge Function create_session: uuid/expires 생성 + DB insert

Edge Function get_upload_urls(또는 업로드 프록시): 업로드 권한 제공

Edge Function finalize_session: final_path 저장, viewer_url 생성

Viewer는 Edge Function 또는 서버리스에서 expires_at 검사 후 signed download URL 발급

중요 맥락: “1개월 유효”는 DB의 expires_at + signed URL 조합이 가장 예측 가능하다.

11.4 오프라인/불안정 대응(필수)

업로드 실패 시:

로컬에 final/print.jpg를 유지

FAILED_UPLOAD로 상태 기록

백그라운드 업로더가 일정 주기로 재시도(예: 10s, 30s, 2m, 10m…)

인쇄는 업로드와 무관하게 진행(정책상 1차 성공)

12) 로컬 파일/개인정보 삭제 정책

세션 종료 후 N분(예: 5분) 또는 완료 화면 종료 시점에:

raw/는 즉시 삭제(선택 정책)

final/은 업로드 성공 후 삭제(또는 운영 정책에 따라 당일 일괄 삭제)

강제 종료/크래시 대비:

부팅 시 “만료된 로컬 세션” 정리 작업 수행(예: 24시간 지난 폴더 삭제)

13) 운영자 패널(옵션 오버레이) 기술 요구

잠금 해제 방식: 핫키 + PIN(예: Ctrl+Alt+O)

기능:

프린터 디바이스 목록 조회 및 선택(저장)

테스트 인쇄

인터넷/ Supabase 연결 체크

카메라 장치 확인

로컬 큐(FAILED_UPLOAD) 재시도/현황 보기

14) 환경 변수(.env) 명세

키오스크 앱(로컬):

APP_ENV=production|staging

SUPABASE_URL=...

SUPABASE_ANON_KEY=...

(운영 단순 모드일 때만) SUPABASE_SERVICE_ROLE_KEY=... (권장하지 않음)

VIEWER_BASE_URL=https://... (Vercel)

PRINTER_DEVICE_NAME=Canon SELPHY CP1500 (운영자 패널에서 덮어쓰기 가능)

LOCAL_DATA_DIR=... (기본: %APPDATA%/HaesolNecut)

Viewer(Vercel):

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY (서버리스에서 사용 가능)

BUCKET_NAME=haesol-necut

15) 빌드/배포(현장 운영)

결과물: Windows 실행 패키지(Installer 또는 portable)

시작 프로그램 등록(자동 실행)

키오스크 모드:

Electron kiosk: true, autoHideMenuBar: true

운영자만 종료 가능(핫키)

16) 테스트 계획(필수 케이스)
16.1 정상 플로우

10장 촬영 → 4장 선택 → 2×2 합성 → silent print → 업로드 → QR 표시

16.2 프린터 장애

용지 없음/커버 열림/연결 끊김 시 FAILED_PRINT 전환 및 사용자 안내

16.3 네트워크 장애

업로드 실패 시에도 인쇄 성공 및 FAILED_UPLOAD 큐 적재, 재시도 성공 확인

16.4 크래시 복구

인쇄 중/업로드 중 강제 종료 후 재실행 시 로컬 DB 기반으로 상태 복구 또는 안전 종료

16.5 출력 품질

무테에서 가장자리 잘림 여부 확인(안전영역 적용 검증)

17) 구현 작업 분해(커서 작업 단위)

Electron 기본 틀 + preload + IPC 브리지

세션/로컬 파일 저장소(storageLocal)

촬영 저장 IPC(shots:save)

템플릿 JSON 로더 + 합성(sharp)

PrintWindow + silent print adapter

JobRunner(상태머신, 락, 재시도 정책)

Supabase 연동(최소: DB insert + Storage upload + viewer url)

Viewer(만료 체크 + signed URL)

운영자 패널(프린터 선택/테스트)

로컬 정리/복구/로그