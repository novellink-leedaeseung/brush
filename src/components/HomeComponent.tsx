// Home28Component.jsx
import React, {type CSSProperties} from 'react';

interface HomeComponentProps {
    size?: number;
    position?: 'fixed' | 'relative' | 'absolute' | 'static';
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    zIndex?: number;
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    style?: CSSProperties;
    disabled?: boolean;
    showTooltip?: boolean;
    tooltipText?: string;
}

/**
 * Home28Component - 재사용 가능한 홈 아이콘 컴포넌트
 */
const HomeComponent: React.FC<HomeComponentProps> = ({
                                                         size = 80,
                                                         position = 'fixed',
                                                         top = '186px',
                                                         left = '36px',
                                                         right,
                                                         bottom,
                                                         zIndex = 1000,
                                                         className = '',
                                                         style = {},
                                                         disabled = false,
                                                         showTooltip = false,
                                                         tooltipText = '홈으로 이동'
                                                     }) => {
    // 홈 아이콘 이미지 경로
    const homeIconSrc = "/public/assets/icon/home.svg";

    // 위치 스타일 계산
    const positionStyle: CSSProperties = position === 'fixed' || position === 'absolute' ? {
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
    const finalStyle: CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        ...positionStyle,
        ...style
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
                        marginLeft: '17px',
                        marginTop: '18px',
                    }}
                    alt="Home icon"
                    className="block max-w-none size-full"
                    src={homeIconSrc}
                    draggable={false}
                    width="45" height="43"
                /></div>
            </div>
        </div>
    );
};

// Named Export
export {HomeComponent};

// Default Export
export default HomeComponent;