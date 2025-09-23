// components/userFind/NumberKeypad.tsx
import React, { memo, useState } from "react";

export type KeyValue = number | "clear" | "backspace";

interface NumberKeypadProps {
  onPress: (value: KeyValue) => void;
}

const NumberKeypad: React.FC<NumberKeypadProps> = ({ onPress }) => {
  const [activeKey, setActiveKey] = useState<number | "clear" | "backspace" | null>(null);

  const keypadButtonStyle: React.CSSProperties = {
    width: "310px",
    height: "140px",
    background: "transparent",
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontFamily: "Pretendard, Arial, sans-serif",
    fontWeight: 700,
    fontSize: "60px",
    lineHeight: "0.93em",
    textAlign: "center",
    color: "#111111",
    outline: "none",
    WebkitTapHighlightColor: "transparent" as any,
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    appearance: "none" as any,
    WebkitAppearance: "none" as any,
    touchAction: "none",
  };

  const containerStyle: React.CSSProperties = {
    width: "970px",
    height: "590px",
    marginLeft: "55px",
    marginTop: "95px",
    position: "relative",
    touchAction: "none",
  };

  const makePointerHandlers = (value: KeyValue) => ({
    onPointerDown: (e: React.PointerEvent) => {
      setActiveKey(value);
      if (e.pointerType === "mouse" || e.pointerType === "pen") {
        onPress(value);
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      setActiveKey(null);
      if (e.pointerType === "touch") {
        onPress(value);
      }
    },
    onPointerLeave: () => setActiveKey(null),
  });

  const renderNumButton = (num: number) => (
    <button
      key={num}
      type="button"
      aria-label={String(num)}
      style={keypadButtonStyle}
      {...makePointerHandlers(num)}
    >
      <span style={{ color: activeKey === num ? "#FFFFFF" : "#111111" }}>{num}</span>
    </button>
  );

  return (
    <div style={containerStyle}>
      {/* 1줄: 1 2 3 */}
      <div
        style={{
          position: "absolute",
          top: "0px",
          left: "0px",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {renderNumButton(1)}
        {renderNumButton(2)}
        {renderNumButton(3)}
      </div>

      {/* 2줄: 4 5 6 */}
      <div
        style={{
          position: "absolute",
          top: "150px",
          left: "0px",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {renderNumButton(4)}
        {renderNumButton(5)}
        {renderNumButton(6)}
      </div>

      {/* 3줄: 7 8 9 */}
      <div
        style={{
          position: "absolute",
          top: "300px",
          left: "0px",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {renderNumButton(7)}
        {renderNumButton(8)}
        {renderNumButton(9)}
      </div>

      {/* 4줄: 전체삭제 0 삭제 */}
      <div
        style={{
          position: "absolute",
          top: "450px",
          left: "0px",
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {/* 전체삭제 */}
        <button
          type="button"
          aria-label="전체삭제"
          style={{ ...keypadButtonStyle, fontSize: "38px", lineHeight: "1.47em" }}
          {...makePointerHandlers("clear")}
        >
          <span style={{ color: activeKey === "clear" ? "#FFFFFF" : "#111111" }}>전체삭제</span>
        </button>

        {renderNumButton(0)}

        {/* 삭제 */}
        <button
          type="button"
          aria-label="삭제"
          style={{
            width: "310px",
            height: "140px",
            background: "transparent",
            border: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent" as any,
            userSelect: "none",
            WebkitUserSelect: "none" as any,
            MozUserSelect: "none",
            msUserSelect: "none",
            appearance: "none" as any,
            WebkitAppearance: "none" as any,
            touchAction: "none",
          }}
          {...makePointerHandlers("backspace")}
        >
          <div
            style={{
              width: "88.82px",
              height: "56px",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={
                activeKey === "backspace"
                  ? "/assets/icon/backspace_active.svg"
                  : "/assets/icon/backspace.svg"
              }
              alt="삭제"
              draggable={false}
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default memo(NumberKeypad);
