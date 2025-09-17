// Home28Component.jsx
import React from 'react';

/**
 * Home28Component - 재사용 가능한 홈 아이콘 컴포넌트
 *
 * @param {Object} props - 컴포넌트 props
 * @param {number} props.size - 컴포넌트 크기 (기본: 80px)
 * @param {string} props.position - CSS position 값 ('fixed' | 'relative' | 'absolute' | 'static')
 * @param {string} props.top - top 위치 값 (예: '20px', '50%')
 * @param {string} props.left - left 위치 값 (예: '20px', '50%')
 * @param {string} props.right - right 위치 값 (예: '20px', '50%')
 * @param {string} props.bottom - bottom 위치 값 (예: '20px', '50%')
 * @param {number} props.zIndex - z-index 값 (기본: 1000)
 * @param {function} props.onClick - 클릭 이벤트 핸들러
 * @param {string} props.className - 추가 CSS 클래스
 * @param {Object} props.style - 추가 인라인 스타일
 * @param {boolean} props.disabled - 비활성화 상태
 * @param {boolean} props.showTooltip - 툴팁 표시 여부
 * @param {string} props.tooltipText - 툴팁 텍스트
 */
const HomeComponent = ({
                           size = 80,
                           position = 'fixed',
                           top = '186px',
                           left = '36px',
                           right,
                           bottom,
                           zIndex = 1000,
                           onClick,
                           className = '',
                           style = {},
                           disabled = false,
                           showTooltip = false,
                           tooltipText = '홈으로 이동'
                       }) => {
    // 홈 아이콘 이미지 경로
    const homeIconSrc = "/public/assets/icon/home.svg";

    // 위치 스타일 계산
    const positionStyle = position === 'fixed' || position === 'absolute' ? {
        position: position,
        top: bottom ? 'auto' : top,
        left: right ? 'auto' : left,
        right: right || 'auto',
        bottom: bottom || 'auto',
        zIndex: zIndex
    } : {
        position: position
    };

    // 최종 스타일 병합
    const finalStyle = {
        width: `${size}px`,
        height: `${size}px`,
        ...positionStyle,
        ...style
    };

    // 클릭 핸들러
    const handleClick = (e) => {
        if (!disabled && onClick) {
            onClick(e);
        }
    };

    return (
        <div
            className={`
        bg-[#e7eaf3] 
        rounded-full 
        cursor-pointer 
        transition-all 
        duration-200 
        hover:scale-110 
        hover:shadow-lg
        select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `.trim()}
            style={finalStyle}
            onClick={() => window.location.href = '/'}
            data-name="home-28"
            data-node-id="131:201"
            title={showTooltip ? tooltipText : undefined}
        >
            <div className="absolute inset-[22.5%_22.5%_23.68%_21.25%]">
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#E7EAF3', borderRadius: 9999
                }}><img
                    style={{
                        marginLeft: '20px',
                        marginTop: '20px',
                    }}
                    alt="Home icon"
                    className="block max-w-none size-full"
                    src={homeIconSrc}
                    draggable={false}
                    width="38" height="41"
                /></div>
            </div>
        </div>
    );
};

// Named Export
export {HomeComponent};

// Default Export
export default HomeComponent;