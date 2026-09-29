import { asset } from "./design/asset";
import { getHomecomingFrame, HOMECOMING_FRAMES } from "./shared/homecomingFrames";
import type { Shot } from "./shared/types";

export function HomecomingBackdrop({ selection = false }: { selection?: boolean }) {
  return <div className={`homecomingBackdrop ${selection ? "homecomingBackdrop--selection" : ""}`} aria-hidden="true">
    <div className="homecomingBackdrop__ribbon"><img src={asset("homecoming/ribbon.png")} alt="" /></div>
    <img className="homecomingBackdrop__paper" src={asset("homecoming/background.png")} alt="" />
    <div className="homecomingBackdrop__stamp"><img src={asset("homecoming/stamp.png")} alt="" /></div>
  </div>;
}

export function HomecomingFrame({ frameId, photos = [] }: { frameId: string; photos?: readonly (string | null)[] }) {
  const frame = getHomecomingFrame(frameId);
  return <div className="homecomingFrame" aria-label={frame.name}>
    {frame.slots.map((slot, i) => <div key={i} className="homecomingFrame__photo" style={{
      left: `${slot.x / frame.width * 100}%`, top: `${slot.y / frame.height * 100}%`,
      width: `${slot.w / frame.width * 100}%`, height: `${slot.h / frame.height * 100}%`,
    }}>{photos[i] && <img src={photos[i]!} alt={`선택 사진 ${i + 1}`} />}</div>)}
    <img className="homecomingFrame__overlay" src={asset(frame.src)} alt="" />
  </div>;
}

export function HomecomingStyleSelect({ onSelect }: { onSelect: (id: string) => void }) {
  return <section className="homecomingStyleSelect" aria-label="의미있는 밤 프레임 선택">
    <HomecomingBackdrop selection />
    {HOMECOMING_FRAMES.map((frame, index) => <button type="button" key={frame.id}
      className={`homecomingStyleSelect__card homecomingStyleSelect__card--${index + 1}`}
      onClick={() => onSelect(frame.id)} aria-label={frame.name}>
      <HomecomingFrame frameId={frame.id} />
    </button>)}
  </section>;
}

export function HomecomingPhotoSelect({ frameId, shots, selectedShots, onToggle, onBack, onPrint }: {
  frameId: string; shots: Shot[]; selectedShots: Shot[]; onToggle: (index: number) => void;
  onBack: () => void; onPrint: () => void;
}) {
  return <>
    <h1 className="homecomingSelect__title">Select</h1>
    <p className="homecomingSelect__hint">마음에 드는 사진을 네 장 골라주세요</p>
    <div className="homecomingSelect__preview"><HomecomingFrame frameId={frameId} photos={selectedShots.map(s => s.previewUrl)} /></div>
    <div className="homecomingSelect__grid">{shots.map(shot => <button type="button" key={shot.index}
      className={`shotCard ${shot.selectedOrder !== null ? "selected" : ""}`} aria-pressed={shot.selectedOrder !== null}
      aria-label={`사진 ${shot.index + 1}${shot.selectedOrder !== null ? `, ${shot.selectedOrder}번째 선택` : ""}`}
      onClick={() => onToggle(shot.index)} disabled={!shot.captured}>
      {shot.previewUrl && <img src={shot.previewUrl} alt="" />}
      {shot.selectedOrder !== null && <span className="shotCard__order">{shot.selectedOrder}</span>}
    </button>)}</div>
    <button type="button" className="homecomingSelect__prev homecomingButton" onClick={onBack}>이전</button>
    <button type="button" className="homecomingSelect__next homecomingButton" disabled={selectedShots.length !== 4} onClick={onPrint}>다음</button>
  </>;
}
