# 프레임 오버레이 에셋

최종 인쇄 이미지 위에 겹치는 프레임 PNG를 넣으려면 아래 파일들을 이 폴더에 두세요.

| 파일명 | 사용 시점 |
|--------|-----------|
| `Image_Basic frame.png` | 프레임이 "basic" 일 때 (기본 프레임) |
| `Image frame_Desined Frame.png` | 프레임이 "designed" 일 때 (디자인 프레임) |

- Figma에서 해당 레이어/컴포넌트를 **PNG로 내보내기** 한 뒤, 위 이름 그대로 저장하면 됩니다.
- 파일이 없어도 앱은 동작하며, 프레임 없이 4칸 합성 이미지만 인쇄됩니다.

## 해솔네컷 프레임 데코 에셋

- `해솔네컷/` — Frame_DK (data_1.png ~ data_8.png)
- `해솔네컷 (1)/` — Frame_MC (mc_1.png ~ mc_8.png)
- `해솔네컷 (2)/` — Frame_Nurse (nurse_1.png ~ nurse_8.png)
- `해솔네컷 (3)/` — AI (AI_1.png ~ AI_8.png)
- `해솔네컷 (4)/` — DH (DH_1.png ~ DH_8.png)

앱에서 `asset("해솔네컷/data_1.png")` 형태로 참조하면 됩니다. 빌드 시 `public/design-assets`로 복사됩니다.

## 2_2 Designed Frame (프레임 확인 화면)

- 에셋은 **`design/tsx design/2_2 Designed Frame/source/`** 에 두면 됩니다.
- 빌드/개발 시 `copy-assets.cjs` 가 여기서 읽어 `public/design-assets/designed-frame/` 로 복사합니다 (파일명 자동 매핑).
- 자세한 매핑은 `designed-frame/README.md` 참고.
