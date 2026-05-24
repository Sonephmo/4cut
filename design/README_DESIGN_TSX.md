# 디자인 TSX 추천 방식

디자인을 **TSX + CSS**로 넘길 때 아래 구조를 추천합니다.

---

## 1. 폴더 구조

```
src/
  design/                    ← 디자인 전용 (Vite가 그대로 컴파일)
    asset.ts                 ← 이미지 경로 헬퍼 (한 번만 정의)
    ElementMain.tsx           ← MAIN 화면
    ElementMain.css
    ElementQuantity.tsx
    ElementQuantity.css
    ... (화면별 1 TSX + 1 CSS)

design/
  assets/                    ← 이미지 원본 (Figma 내보내기)
    image_Logo.png
    Image_Basic frame.png
    ...
```

- **디자인 TSX는 `src/design/`** 에 두면 별도 설정 없이 import 가능합니다.
- 이미지는 계속 **`design/assets/`** 에 두고, 빌드 시 `public/design-assets` 로 복사하는 기존 방식 유지합니다.

---

## 2. 이미지 참조 방식

**공통 헬퍼 한 곳에 두기**

- `src/design/asset.ts` 에서 `asset("Image_Basic frame.png")` → `/design-assets/Image_Basic%20frame.png` 처럼 **인코딩된 경로**를 반환하도록 합니다.
- 각 디자인 TSX에서는 `import { asset } from "./asset";` 후 `<img src={asset("파일명.png")} />` 만 쓰면 됩니다.
- Figma에서 내보낸 **파일명 그대로** 문자열로 넘기면 됩니다 (공백·한글 포함).

---

## 3. 스타일 (CSS)

- **화면당 CSS 한 파일** (`ElementMain.css`, `ElementQuantity.css` …) 을 두고, 해당 TSX에서만 `import "./ElementMain.css"` 하도록 추천합니다.
- Figma에서 나온 **position / size / color** 를 그대로 px, 색상값으로 넣으면 됩니다.
- 클래스명은 **Figma 레이어와 1:1** 로 맞추면 나중에 수정할 때 찾기 쉽습니다 (예: `.frame-designed-frame`, `.button-setting`).

---

## 4. App 연동

- **디자인 컴포넌트는 “보여주기만”** 하도록 두고, `App.tsx` 에서만 상태와 플로우를 관리하는 방식을 추천합니다.
- 예: MAIN 화면

  - `App` 이 `step === "MAIN"` 일 때 `<ElementMain onSelectFrame={...} onNext={...} onOpenSettings={...} />` 렌더
  - `ElementMain` 은 `props` 로 받은 콜백만 호출 (예: 카드 클릭 시 `onSelectFrame("basic_001")`, 다음 버튼 클릭 시 `onNext()`).

- 이렇게 하면 **디자인 TSX는 Figma 구조 그대로**, **플로우/API는 App 한 곳**에서만 수정하면 됩니다.

---

## 5. 정리

| 항목       | 추천 방식 |
|------------|-----------|
| TSX 위치   | `src/design/` (화면별 `Element*.tsx`) |
| 이미지     | `design/assets/` 유지, 참조는 `asset("파일명")` |
| CSS        | 화면당 `Element*.css` 한 파일, 해당 TSX에서만 import |
| 상호작용   | 디자인 컴포넌트는 props 콜백만 호출, 상태는 App에서만 |

이렇게 주시면 그대로 붙이기 쉽고, 나중에 디자인만 바꿀 때도 `src/design/` 만 보면 됩니다.
