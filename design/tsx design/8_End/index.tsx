import "./style.css";

export const ElementEnd = (): JSX.Element => {
    return (
        <div className="element-end">
            <div className="text-wrapper">DONE!</div>

            <div className="div">
                인쇄가 완료되었습니다!
                <br />
                이용해주셔서 감사합니다
            </div>
        </div>
    );
};
