import React, { useState } from 'react';

// Timeout - 시간 초과 경고 모달 컴포넌트
export const Timeout = ({
  primaryMessage = "시간이 초과되었습니다.",
  secondaryMessage = "대기화면으로 이동합니다.",
  showIcon = true,
  iconSrc = "/public/assets/icon/warning.svg",
  onClose,
  className = '',
  style = {},
  isVisible = true,
  autoCloseDelay = 0
}) => {
  // 자동 닫기 기능
  React.useEffect(() => {
    if (autoCloseDelay > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoCloseDelay, onClose]);

  // 모달이 보이지 않으면 렌더링하지 않음
  if (!isVisible) return null;

  return (
    <>
      {/* 모달 배경 오버레이 - 완전한 화면 중앙 정렬 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999
        }}
        onClick={onClose} // 배경 클릭시 닫기
      >
        {/* Frame 336 - 피그마 최상위 컨테이너 */}
        <div
          className={`
            relative
            ${className}
          `.trim()}
          style={{
            width: '932px',
            height: '675px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            borderRadius: '41px',
            boxShadow: '2px 2px 2px 0px rgba(42, 73, 148, 0.09)',
            ...style
          }}
          onClick={(e) => e.stopPropagation()} // 모달 내부 클릭시 전파 중단
          data-name="frame-336"
          data-node-id="134:363"
        >
          {/* Rectangle 15 - 메인 배경 (피그마와 정확히 일치) */}
          <div
            className="absolute bg-white"
            style={{
              left: '0px',
              top: '0px',
              width: '932px',
              borderRadius: '50px',
              boxShadow: '2px 2px 2px 0px rgba(0, 79, 153, 0.09)'
            }}
            data-name="rectangle-15"
            data-node-id="134:364"
          />

          {/* 아이콘 Frame - margin으로 위치 설정 */}
            <img src="/public/assets/icon/warning.svg" alt=""/>

          {/* Frame 363 - 텍스트 컨테이너 (margin으로 위치 설정) */}
          <div
            style={{
              marginLeft: '126px',  // absolute position을 margin으로 변경
              marginTop: showIcon ? '80px' : '270px', // 아이콘 있을 때는 간격 조정, 없을 때는 270px
              width: '680px', // 피그마 width: 680
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'     // 피그마 gap: 10px
            }}
            data-name="frame-363"
            data-node-id="134:365"
          >
            {/* 주요 메시지 - "시간이 초과되었습니다." */}
            <div
              style={{
                width: '100%',
                height: '90px',  // 피그마 height: 90
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '700',      // 피그마 Bold
                fontSize: '72px',       // 피그마 72px
                lineHeight: '1.4',      // 피그마 lineHeight: 1.4em
                letterSpacing: '-2.5%', // 피그마 letterSpacing: -2.5%
                textAlign: 'center',
                color: '#004F99'        // 피그마 fill: #004F99
              }}
              data-node-id="134:366"
            >
              {primaryMessage}
            </div>

            {/* 부가 메시지 - "대기화면으로 이동합니다." */}
            <div
              style={{
                width: '100%',
                height: '90px',  // 피그마 height: 90
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '500',      // 피그마 Medium
                fontSize: '68px',       // 피그마 68px
                lineHeight: '1.4',      // 피그마 lineHeight: 1.4em
                letterSpacing: '-2.5%', // 피그마 letterSpacing: -2.5%
                textAlign: 'center',
                color: '#4B4948'        // 피그마 fill: #4B4948
              }}
              data-node-id="134:367"
            >
              {secondaryMessage}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};