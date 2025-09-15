import React, {useState, useEffect} from 'react';
import '../Fonts/font.css';

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
        display: 'flex',
        background: backgroundColor,
        color: '#FFFFFF',
        fontFamily: 'Pretendard, system-ui, -apple-system, "Noto Sans KR", sans-serif',
        ...style
    };

    return (
        <div className={className} style={defaultStyle}>
            {/* 로고 */}
            <div style={{
                width: '177px',
                height: '130px',
                marginLeft: '32px',
            }
            }>
                <img
                    src={logoSrc}
                    width="220"
                    height="130"
                    alt="로고"
                    style={{flexShrink: 0, marginLeft: '22px'}}
                /></div>

            {/* 중앙 타이틀 */}
            <div style={{
                width: '600px',
                height: '130px',
                marginTop: '10px',
            }}>
                <div
                    style={{
                        color: 'white',
                        fontSize: '60px',
                        fontFamily: 'Jalnan2, system-ui',
                        fontWeight: '400',
                        marginTop: '30px',
                        marginLeft: '100px',
                    }}
                >
                    {title}
                </div>
            </div>

            {/* 날짜/시간 */}
            <div
      className="flex flex-col gap-2.5 items-center justify-center bg-blue-800 text-white p-4 rounded-lg"
      style={{
        width: '230px',
        height: '130px',
        backgroundColor: '#27468A', // 피그마에서 가져온 정확한 색상
      }}
      data-name="Header date container"
    >
      <div
        className="flex flex-col justify-center leading-relaxed text-center"
        style={{
          fontFamily: 'Pretendard, sans-serif',
          fontSize: '36px',
          fontWeight: '400',
          lineHeight: '1.3',
          letterSpacing: '-2.5%',
          width: '190px',
          height: '100px',
        }}
      >
        <p className="mb-0 text-white">{currentDate}</p>
        <p className="mb-0 text-white">{currentTime}</p>
      </div>
    </div>
        </div>
    );
};

export default Header;