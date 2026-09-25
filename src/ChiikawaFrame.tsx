import { asset } from "./design/asset";
import { CHIIKAWA_FRAME as frame } from "./shared/chiikawaFrame";

export function ChiikawaFrame({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="acResultCard" style={{ width: frame.width, height: frame.height, background: frame.background }}>
      <img src={imageUrl} alt="치이카와 스타일 변환 결과" className="acResultImage"
        style={{ left: frame.photo.x, top: frame.photo.y, width: frame.photo.w, height: frame.photo.h }} />
      {frame.decorations.map((item) => (
        <img key={item.src} src={asset(item.src)} alt={item.alt} className="acResultLogo"
          style={{ left: item.x, top: item.y, width: item.w, height: item.h }} />
      ))}
    </div>
  );
}
