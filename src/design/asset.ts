/**
 * design/assets 이미지 경로 (public/design-assets로 복사됨)
 * 공백·한글 등은 URL 인코딩됨
 */
export function asset(path: string): string {
  const encoded = path
    .split("/")
    .map((p) => encodeURIComponent(p))
    .join("/");
  return `/design-assets/${encoded}`;
}
