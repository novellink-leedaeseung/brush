import React from "react";

type Props = {
  onClick: () => void;
  // 위치/크기 커스터마이즈 옵션 (선택)
  right?: number;    // px
  bottom?: number;   // px
  size?: number;     // px (정사각)
  zIndex?: number;
};

export const TransparentHotspotButton: React.FC<Props> = ({
  onClick,
  zIndex = 9999,
}) => {
  const style: React.CSSProperties = {
    position: "fixed",
    width: "230px",
    height: "130px",
      left: "840px",
      top: "10px",
    // background: "transparent",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    opacity: 0,            // 완전 투명
    zIndex,
    outline: "none",
  };

  return (
    <button
      type="button"
      aria-label="transparent hotspot"
      style={style}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()} // 포커스 테두리 방지
    />
  );
};
