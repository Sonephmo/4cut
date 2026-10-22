import { asset } from "./design/asset";
import { getPocheonFrame, POCHEON_FRAMES } from "./shared/pocheonFrames";

export function PocheonBackdrop() {
  return <div className="pocheonBackdrop" aria-hidden="true" />;
}

export function PocheonFrame({ frameId, photos = [] }: { frameId: string; photos?: readonly (string | null)[] }) {
  const frame = getPocheonFrame(frameId);
  return <div className="pocheonFrame" aria-label={frame.name}>
    <img className="pocheonFrame__art" src={asset(frame.src)} alt="" />
    {/* Photos cover the supplied openings, including their residual translucent pixels. */}
    {frame.slots.map((slot, i) => <div key={i} className="pocheonFrame__photo" style={{
      left: `${slot.x / frame.width * 100}%`, top: `${slot.y / frame.height * 100}%`,
      width: `${slot.w / frame.width * 100}%`, height: `${slot.h / frame.height * 100}%`,
      borderRadius: `${slot.r / slot.w * 100}% / ${slot.r / slot.h * 100}%`,
    }}>{photos[i] ? <img src={photos[i]!} alt={`선택 사진 ${i + 1}`} /> : <span>{i + 1}</span>}</div>)}
  </div>;
}

export function PocheonStyleSelect({ onSelect }: { onSelect: (id: string) => void }) {
  return <section className="pocheonStyleSelect" aria-label="포천네것 프레임 선택">
    <PocheonBackdrop />
    <h1>포천네것</h1>
    <p>마음에 드는 프레임을 골라주세요</p>
    <div className="pocheonStyleSelect__cards">{POCHEON_FRAMES.map(frame =>
      <button type="button" key={frame.id} onClick={() => onSelect(frame.id)} aria-label={frame.name}>
        <img src={asset(frame.example)} alt={`${frame.name} 촬영 예시`} />
        <span>{frame.name.replace("포천네것 · ", "")}</span>
      </button>
    )}</div>
    <p className="pocheonStyleSelect__guide">6장 촬영 후 마음에 드는 사진 4장을 선택해요</p>
  </section>;
}
