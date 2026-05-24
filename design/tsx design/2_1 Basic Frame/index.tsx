import basicFrameBlack from "./basic-frame-black.png";
import basicFrameWhite from "./basic-frame-white.png";
import "./style.css";

export const ElementBasicFrame = (): JSX.Element => {
    return (
        <div className="element-basic-frame">
            <div className="text-wrapper">BASIC FRAME</div>

            <img
                className="basic-frame-black"
                alt="Basic frame black"
                src={basicFrameBlack}
            />

            <img
                className="basic-frame-white"
                alt="Basic frame white"
                src={basicFrameWhite}
            />
        </div>
    );
};
