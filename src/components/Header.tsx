import React, { useState, useEffect } from 'react';

interface HeaderProps {
  title?: string;
  logoSrc?: string;
  backgroundColor?: string;
  showDateTime?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Header: React.FC<HeaderProps> = ({
  title = "스마트 건강관리",
  logoSrc = "/assets/icon/logo.png",
  backgroundColor = "#214882",
  showDateTime = true,
  className,
  style
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // 현재 날짜/시간 업데이트
  useEffect(() => {
    if (!showDateTime) return;

    const updateDateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '-').replace('.', '');
      
      const time = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      setCurrentDate(date);
      setCurrentTime(time);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, [showDateTime]);

  const defaultStyle: React.CSSProperties = {
    width: '1080px',
    height: '150px',
    background: backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#FFFFFF',
    fontFamily: 'Pretendard, system-ui, -apple-system, "Noto Sans KR", sans-serif',
    ...style
  };

  return (
    <div className={className} style={defaultStyle}>
      {/* 로고 */}
      <img
        src={logoSrc}
        width="154"
        height="113"
        alt="로고"
        style={{ flexShrink: 0 }}
      />

      {/* 중앙 타이틀 */}
      <div
        style={{
          color: 'white',
          fontSize: '60px',
          fontFamily: 'Jalnan2, system-ui',
          fontWeight: '400',
          textAlign: 'center',
          flex: 1
        }}
      >
        {title}
      </div>

      {/* 날짜/시간 */}
      {showDateTime && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '32px',
            flexShrink: 0
          }}
        >
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'normal',
              color: 'white',
              fontFamily: 'Pretendard, system-ui'
            }}
          >
            {currentDate}
          </div>
          <div
            style={{
              fontSize: '36px',
              fontWeight: 'normal',
              color: 'white',
              fontFamily: 'Pretendard, system-ui'
            }}
          >
            {currentTime}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;