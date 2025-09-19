// TransparentOverlayButton.tsx
import React from 'react';

type Props = {
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
  width?: number;   // 기본 1080
  height?: number;  // 기본 500
  top?: number;     // 기본 0
  left?: number;    // 기본 0
};

const TransparentOverlayButton: React.FC<Props> = ({
  onClick,
  ariaLabel,
  disabled,
  width = 230,
  height = 130,
  top = 10,
  left = 840,
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    onClick={onClick}
    disabled={disabled}
    tabIndex={-1}
    onMouseDown={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    style={{
      position: 'absolute',
      top, left,
      width, height,
      background: 'transparent',
      border: 'none',
      padding: 0,
      cursor: disabled ? 'default' : 'pointer',
      zIndex: 10,
      outline: 'none',
      WebkitTapHighlightColor: 'transparent' as any,
      userSelect: 'none',
      WebkitUserSelect: 'none' as any,
      MozUserSelect: 'none',
      msUserSelect: 'none',
      appearance: 'none' as any,
      WebkitAppearance: 'none' as any,
      touchAction: 'manipulation',
    }}
  />
);

export default TransparentOverlayButton;
