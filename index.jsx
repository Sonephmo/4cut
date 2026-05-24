
import buttonSetting from "./button-setting.png";
import image87 from "./image-87.png";
import image88 from "./image-88.png";
import image114 from "./image-114.png";
import image115 from "./image-115.png";
import image116 from "./image-116.png";
import image117 from "./image-117.png";
import image118 from "./image-118.png";
import image119 from "./image-119.png";
import image120 from "./image-120.png";
import image121 from "./image-121.png";
import image122 from "./image-122.png";
import image123 from "./image-123.png";
import imageBasicFrame from "./image-basic-frame.png";
import mc3 from "./mc-3.png";
import nurse3 from "./nurse-3.png";
import "./style.css";

export const ElementMain = () => {
    return (
        <div className="element-MAIN">
            <img
                className="button-setting"
                alt="Button setting"
                src={buttonSetting}
            />

            <div className="frame-designed-frame">
                <div className="frame-desinged-frame" />

                <p className="context-designed">
                    차의대의 마스코트 “해솔이”와 함께 촬영합니다
                    <br />
                    원하는 해솔이 캐릭터를 직접 선택 할 수 있습니다
                </p>

                <div className="text-designed-frame">DESIGNED FRAME</div>

                <img className="image" alt="Image" src={image116} />

                <img className="img" alt="Image" src={image121} />

                <img className="image-2" alt="Image" src={image114} />

                <img className="image-3" alt="Image" src={image123} />

                <img className="image-4" alt="Image" src={image120} />

                <img className="image-5" alt="Image" src={image122} />

                <img className="image-6" alt="Image" src={image119} />

                <img className="image-7" alt="Image" src={image118} />

                <img className="image-8" alt="Image" src={image117} />

                <img className="image-9" alt="Image" src={image115} />

                <img className="nurse" alt="Nurse" src={nurse3} />

                <img className="image-10" alt="Image" src={image87} />

                <img className="mc" alt="Mc" src={mc3} />
            </div>

            <div className="frame-basic-frame">
                <div className="div" />

                <div className="text-wrapper">BASIC FRAME</div>

                <div className="context-basic-frame">
                    기본적인 4컷형태의 프레임입니다
                    <br />
                    4*6사이즈로 제공됩니다
                </div>

                <img
                    className="image-basic-frame"
                    alt="Image basic frame"
                    src={imageBasicFrame}
                />

                <img className="image-11" alt="Image" src={image88} />
            </div>

            <div className="group-coming-soon">
                <div className="rectangle" />

                <div className="text-wrapper-2">?</div>

                <div className="text-wrapper-3">COMMING SOON</div>
            </div>
        </div>
    );
};

