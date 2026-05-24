import group8 from "./group-8.png";
import "./style.css";

export const ElementCamera = (): JSX.Element => {
    return (
        <div className="element-camera">
            <img className="group" alt="Group" src={group8} />

            <p className="text-wrapper">
                잠시 후 촬영이 시작됩니다
                <br />
                마음에드는 포즈를&nbsp;&nbsp;미리 생각해두세요!!
            </p>

            <div className="div">촬영은 총 9번 진행됩니다</div>
        </div>
    );
};
