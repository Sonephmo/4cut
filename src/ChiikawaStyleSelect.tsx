import { asset } from "./design/asset";
import type { ChiikawaStyle } from "./shared/types";

type Props = {
  onSelect: (style: ChiikawaStyle) => void;
};

/** Figma E_1 Style Select (463:440), in the kiosk's 1080 × 1920 coordinates. */
export function ChiikawaStyleSelect({ onSelect }: Props) {
  return (
    <section className="chiikawaStyleSelect" aria-label="차의카와 스타일 선택">
      <img className="chiikawaStyleSelect__title" src={asset("chiikawa/style-select-title.png")} alt="스타일을 선택해주세요" />
      <button type="button" className="chiikawaStyleSelect__option chiikawaStyleSelect__option--human" aria-label="인간형 스타일 선택" onClick={() => onSelect("human")}>
        <span className="chiikawaStyleSelect__sample">
          <img src={asset("chiikawa/sample-1.png")} alt="" />
        </span>
        <img className="chiikawaStyleSelect__humanLabel" src={asset("chiikawa/style-human-label.png")} alt="사람형" />
      </button>
      <button type="button" className="chiikawaStyleSelect__option chiikawaStyleSelect__option--animal" aria-label="동물형 스타일 선택" onClick={() => onSelect("animal")}>
        <span className="chiikawaStyleSelect__sample">
          <img src={asset("chiikawa/sample-3.png")} alt="" />
        </span>
        <img className="chiikawaStyleSelect__animalLabel" src={asset("chiikawa/style-animal-label.png")} alt="동물형" />
      </button>
    </section>
  );
}
