# 디자인 컴포넌트

Figma → TSX/CSS로 넘긴 화면들을 여기에 두세요.

- **이미지**: `import { asset } from "./asset";` 후 `src={asset("파일명.png")}`
- **스타일**: 화면별 `Element*.css` 에 Figma 수치 그대로
- **연동**: App에서 step에 맞게 import 후, 콜백만 props로 전달

자세한 규칙은 `design/README_DESIGN_TSX.md` 참고.
