# HAESOL 4CUT 현장 검증 런북

## 1) 사전 준비
1. `.env.example`를 `.env`로 복사한다.
2. `OPERATOR_PIN`, `PRINTER_DEVICE_NAME`를 현장 값으로 수정한다.
3. 첫 검증은 `SKIP_PRINT=true`로 시작한다.
4. 의존성 설치:
   - `npm install`

## 2) 앱 실행
1. 렌더러 개발 서버 실행:
   - `npm run dev`
2. Electron 메인 빌드:
   - `npm run build:main`
3. Electron 실행(로컬 명령 환경에 맞춰):
   - `electron dist-electron/main.js`

## 3) 기능 검증 순서
1. 메인 화면에서 프레임 선택, 장수 선택 진행.
2. 촬영 10회 자동 진행 확인:
   - 카운트다운 10초
   - 샷 간 공백 2초
3. 선택 화면에서 4장 선택:
   - 선택 순번(1~4) 재정렬 동작 확인
4. 로딩/프린팅 화면 분리 전환 확인:
   - `LOADING` -> `PRINTING` -> `END`

## 4) 운영자 패널 검증
1. `Ctrl + Alt + O`로 운영자 패널 열기.
2. PIN 검증 확인.
3. 프린터 목록 조회/프린터 적용 확인.
4. 테스트 인쇄 버튼 실행:
   - `SKIP_PRINT=true`일 때 성공 응답만 확인
   - `SKIP_PRINT=false`일 때 실제 출력 확인
5. 실패 세션 목록 새로고침 및 재시도 동작 확인.

## 5) 실제 프린터 검증(내일)
1. `.env`에서 `SKIP_PRINT=false`로 변경.
2. CP1500 용지/리본 장착 및 드라이버 상태 확인.
3. 테스트 인쇄 1회 수행.
4. 실제 플로우 인쇄 1회 수행.
5. 출력물 확인:
   - 레이아웃(2x2)
   - 모서리 크롭/여백
   - 프레임 오버레이 위치

## 6) 장애 검증
1. 프린터 전원/연결 차단 후 인쇄 시도.
2. `FAILED_PRINT` 전환 및 운영자 패널 실패 세션 등록 확인.
3. 프린터 복구 후 실패 세션 재시도 확인.

## 7) 로그/데이터 확인 위치
1. 세션 이미지:
   - `%APPDATA%/HaesolNecut/sessions/{uuid}/raw`
   - `%APPDATA%/HaesolNecut/sessions/{uuid}/final`
2. 실패 큐:
   - `%APPDATA%/HaesolNecut/queue/failed-jobs.json`
3. 설정:
   - `%APPDATA%/HaesolNecut/settings.json`
