// components/userFind/MaskedPhoneDisplay.tsx
import React from "react";

export const maskPhoneNumber = (number: string): string => {
  if (number.startsWith('010')) {
    if (number.length <= 3) return number;
    else if (number.length <= 7) {
      const part1 = number.slice(0, 3);
      const part2 = number.slice(3);
      return `${part1}-${part2}`;
    } else if (number.length <= 11) {
      const part1 = number.slice(0, 3);
      const part2 = number.slice(3, 7);
      const part3 = number.slice(7);
      if (part3.length <= 1) return `${part1}-${part2}-${part3}`;
      const maskedPart = '*'.repeat(part3.length - 1) + part3.slice(-1);
      return `${part1}-${part2}-${maskedPart}`;
    }
  }
  if (number.length <= 7) return number;
  const visiblePart = number.slice(0, 7);
  const rest = number.slice(7);
  if (rest.length <= 1) return visiblePart + rest;
  const maskedPart = '*'.repeat(rest.length - 1) + rest.slice(-1);
  return visiblePart + maskedPart;
};

interface MaskedPhoneDisplayProps {
  value: string;
}

const MaskedPhoneDisplay: React.FC<MaskedPhoneDisplayProps> = ({ value }) => {
  return (
    <div
      style={{
        width: '860px',
        height: '170px',
        background: 'white',
        boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
        borderRadius: '16px',
        marginLeft: '110px',
        marginTop: '140px'
      }}
    >
      <div
        style={{
          height: '170px',
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {value === '' ? (
          <span style={{
            color: '#B5B5B6',
            fontSize: '44px',
            fontWeight: 600,
            lineHeight: '56px'
          }}>
            사용자 번호 또는 휴대폰 번호
          </span>
        ) : (
          <span style={{
            color: "#111111",
            fontSize: 68,
            fontFamily: "Jalnan2",
            fontWeight: 400,
            lineHeight: "56px",
            wordWrap: "break-word",
          }}>
            {maskPhoneNumber(value)}
          </span>
        )}
      </div>
    </div>
  );
};

export default MaskedPhoneDisplay;
