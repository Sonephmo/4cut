import "./style.css";

export const ElementQuantity = (): JSX.Element => {
    return (
        <div className="element-quantity">
            <div className="print-quantity">인쇄 갯수</div>

            <div className="quantity">2</div>

            <div className="button-next">
                <div className="rectangle" />

                <div className="text-wrapper">다음</div>
            </div>

            <div className="button-prev">
                <div className="div" />

                <div className="text-wrapper">이전</div>
            </div>

            <div className="button-quantity">-</div>

            <div className="button-quantity-plus">+</div>
        </div>
    );
};
