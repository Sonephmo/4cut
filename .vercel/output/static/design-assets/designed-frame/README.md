# 2_2 Designed Frame 파이프라인 에셋

프레임 확인(Designed) 화면에서 쓰는 프레임 미리보기 이미지입니다.

**에셋 위치 (둘 다 사용):**
- `design/tsx design/2_2 Designed Frame/source/` — 기존 파일명
- `design/tsx design/2_2 Designed Frame/` 루트 — 변경된 파일명 (PNG만 복사)

`npm run build` / `predev` 시 `scripts/copy-assets.cjs` 가 두 위치를 읽어 `public/design-assets/designed-frame/` 로 복사합니다. 루트 파일이 있으면 같은 대상 이름으로 덮어씁니다.

| source 또는 루트 파일명 | 앱 참조 이름 | 화면 라벨 |
|-------------------------|--------------|-----------|
| `Photo Frame_DK.png` / `Photo Frame_DK 1.png` | photo-frame-DK-1.png | 경영학과 |
| `Photo AIdata-1.png` / `Photo AIdata 1.png` | photo-aidata-1.png | AI의료데이터 |
| `Photo AIdata.png` | photo-aidata-1-1.png | 디지털보건의료 |
| `Photo Frame_Nurse.png` / `Photo Frame_Nurse 1.png` | photo-frame-nurse-1.png | 간호학과 |
| `Photo Frame_MC.png` / `Photo Frame_MC 1.png` | photo-frame-MC-1.png | 미디어커뮤니케이션 |
| `Photo Digital Health.png` | photo-frame-DH-1.png | 디지털헬스케어 |
