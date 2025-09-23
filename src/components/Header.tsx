import React, {useState, useEffect} from 'react';
import '@/index.css';

import {config} from '@/config';


interface HeaderProps {
    title?: string;
    logoSrc?: string;
    backgroundColor?: string;
    showDateTime?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const Header: React.FC<HeaderProps> = ({
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
                width: '220px',
                height: '130px',
                marginTop: '10px',
                marginLeft: '10px',
            }
            }>
                <img
                    src={"/assets/logo/" + config.logo}
                    width="177"
                    height="130"
                    alt="로고"
                    style={{flexShrink: 0, marginLeft: '22px'}}
                /></div>

            {/* 중앙 타이틀 */}
            <div style={{
                width: '600px',
                height: '130px',
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: '10px',
            }}>
                <div
                    style={{
                        color: 'white',
                        fontSize: '60px',
                        fontFamily: 'Jalnan2, system-ui',
                        fontWeight: '400',
                        textAlign: 'center',

                    }}
                >
                    <div style={{
                        width: '600px',
                        height: "70px",
                    }}>{config.titleText}</div>
                </div>
            </div>

            {/* 날짜/시간 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '130px',
                alignItems: 'center',
                width: '230px',
                marginTop: "10px",
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: "'Pretendard', sans-serif",
                    fontWeight: 400,
                    height: '100px',
                    justifyContent: 'center',
                    lineHeight: 1.3,
                    fontStyle: 'normal',
                    flexShrink: 0,
                    fontSize: '36px',
                    color: 'white',
                    letterSpacing: '-0.9px',
                    width: '200px',
                    textAlign: 'center'
                }}>
                    <p style={{marginBottom: 0}}>{currentDate}</p>
                    <p style={{margin: 0}}>{currentTime}</p>
                </div>
            </div>
        </div>
    );
};

export default Header;