# 해솔네컷 프린터 데몬 (Supabase)

웹앱이 `upload` + `print_jobs` insert 후, 이 프로세스가 Realtime으로 감지하여 로컬 프린터로 인쇄합니다.

## 다른 PC에 포터블로 두기 (권장)

별도 Node.js 설치 없이 **EXE만으로** 동작합니다.

1. 개발 PC에서 `npm install` 후 `npm run package:release` 실행.
2. 생성된 `release/haesol-4cut-printer` 폴더 전체를 USB 등으로 복사해 대상 PC에 둡니다.
3. 대상 PC에서 `.env.example`을 복사해 이름을 `.env`로 바꾸고 값을 채운 뒤 `haesol-4cut-printer.exe`를 실행합니다.

`.env`는 **반드시 EXE와 같은 폴더**에 둡니다. (바로가기/시작 프로그램으로 실행해도 EXE 옆의 `.env`를 읽습니다.)

EXE만 빌드할 때: `npm run package:exe` → `dist-pkg/haesol-4cut-printer.exe`

## 설정 (개발)

1. `.env.example`을 `.env`로 복사하고 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`를 채웁니다.
2. Supabase 대시보드에서 **Database > Replication**에 `print_jobs` 테이블이 활성화되어 있는지 확인합니다.
3. `printer-app` 폴더에서:

```bash
npm install
npm run dev
```

## 운영 (소스에서 실행)

- `npm run build` 후 `npm start`로 `dist/index.js` 실행.

## 환경 변수

| 변수 | 설명 |
|------|------|
| `SUPABASE_URL` | 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 키 (RLS 우회, Storage 다운로드) |
| `PRINTER_DEVICE_NAME` | Windows 프린터 이름 |
| `SKIP_PRINT` | `true`면 다운로드만 하고 인쇄 스킵 (테스트) |
