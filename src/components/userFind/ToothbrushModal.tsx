import React, {useState, useEffect} from 'react';
import {config} from '@/config.ts';

const ToothbrushModal = ({isOpen, onClose, autoShow = true, name = '테스트'}) => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (autoShow) {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setShowModal(isOpen);
        }
    }, [isOpen, autoShow]);

    useEffect(() => {
        const handleKeyDown = (event : KeyboardEvent) => {
            if (event.key === 'Escape' && showModal) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    // ⬇️ 이 블록 하나만 추가 (기존 useEffect들 아래에)
    useEffect(() => {
        if (!showModal) return;

        const timer = setTimeout(() => {
            // 라우터 안 쓴다고 했으니 브라우저 이동
            window.location.replace('/'); // 필요하면 경로 바꿔줘요
        }, config.toothbrushModalTimeout); // 3초

        return () => clearTimeout(timer); // 닫기/언마운트 시 정리
    }, [showModal]);


    const handleClose = () => {
        setShowModal(false);
        if (onClose) {
            onClose();
        }
    };

    const handleOverlayClick = (e : React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!showModal) return null;

    const modalContainerStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const backgroundOverlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(49, 49, 49, 0.6)',
        zIndex: 1
    };

    // 피그마 원본 크기: 932px width, 675px height
    const modalStyle: React.CSSProperties = {
        position: 'relative',
        width: '932px',
        height: '675px',
        background: '#FFFFFF',
        borderRadius: '41px',
        boxShadow: '2px 2px 2px 0px rgba(42, 73, 148, 0.09)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'modalFadeIn 0.3s ease-out',
        padding: 0
    };

// 텍스트 컨테이너: 피그마 기준 x=126, y=270, width=680
    const modalContentStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        width: '680px',
        paddingLeft: '126px',
        paddingRight: '126px',
        marginTop: '80px' // 아이콘과 텍스트 사이 간격 조정
    };

    // 피그마 기준: font-size 72px, height 90px
    const modalTitleStyle: React.CSSProperties = {
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontWeight: 700,
        fontSize: '72px',
        lineHeight: '1.4',
        letterSpacing: '-0.025em',
        textAlign: 'center',
        color: '#004F99',
        margin: 0,
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    // 피그마 기준: font-size 68px, height 90px
    const modalSubtitleStyle: React.CSSProperties = {
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontWeight: 700,
        fontSize: '68px',
        lineHeight: '1.4',
        letterSpacing: '-0.025em',
        textAlign: 'center',
        color: '#F9B657',
        margin: 0,
        height: '90px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <>
            <style>
                {`
          @keyframes modalFadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
            </style>
            <div style={modalContainerStyle}>
                {/* Background Overlay */}
                <div
                    style={backgroundOverlayStyle}
                    onClick={handleOverlayClick}
                />

                {/* Modal */}
                <div style={modalStyle}>
                    {/* Smile Icon */}
                    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg"
                         style={{marginTop: "60px"}}>
                        <g clip-path="url(#clip0_178_95)">
                            <path
                                d="M80.34 79.495C75.9949 82.9983 70.5815 84.9087 65 84.9087C59.4185 84.9087 54.0052 82.9983 49.66 79.495C48.3326 78.3917 46.6213 77.8609 44.9025 78.0193C43.1837 78.1778 41.5983 79.0126 40.495 80.34C39.3917 81.6674 38.8609 83.3787 39.0194 85.0975C39.1779 86.8162 40.0126 88.4017 41.34 89.505C47.9787 95.0469 56.3522 98.0826 65 98.0826C73.6479 98.0826 82.0213 95.0469 88.66 89.505C89.9874 88.4017 90.8222 86.8162 90.9806 85.0975C91.1391 83.3787 90.6083 81.6674 89.505 80.34C88.9587 79.6827 88.2883 79.1395 87.5321 78.7413C86.7758 78.3431 85.9486 78.0978 85.0975 78.0193C83.3787 77.8609 81.6674 78.3917 80.34 79.495ZM46.865 55.51C48.0829 56.7206 49.7303 57.4001 51.4475 57.4001C53.1647 57.4001 54.8122 56.7206 56.03 55.51C57.2407 54.2921 57.9202 52.6447 57.9202 50.9275C57.9202 49.2103 57.2407 47.5628 56.03 46.345C52.3102 42.8154 47.3779 40.8478 42.25 40.8478C37.1222 40.8478 32.1898 42.8154 28.47 46.345C27.7896 46.9277 27.237 47.6448 26.8468 48.4512C26.4567 49.2576 26.2374 50.136 26.2028 51.0311C26.1683 51.9263 26.3191 52.819 26.6459 53.6531C26.9727 54.4872 27.4683 55.2448 28.1018 55.8782C28.7352 56.5117 29.4928 57.0073 30.3269 57.3341C31.161 57.6609 32.0537 57.8118 32.9489 57.7772C33.844 57.7426 34.7224 57.5233 35.5288 57.1332C36.3352 56.743 37.0523 56.1904 37.635 55.51C38.2393 54.9007 38.9582 54.4172 39.7503 54.0872C40.5424 53.7572 41.3919 53.5873 42.25 53.5873C43.1081 53.5873 43.9577 53.7572 44.7498 54.0872C45.5419 54.4172 46.2608 54.9007 46.865 55.51ZM101.53 46.345C97.8102 42.8154 92.8778 40.8478 87.75 40.8478C82.6222 40.8478 77.6898 42.8154 73.97 46.345C72.9051 47.5884 72.3487 49.1879 72.4119 50.8238C72.4751 52.4597 73.1532 54.0115 74.3109 55.1691C75.4685 56.3268 77.0203 57.0049 78.6562 57.0681C80.2921 57.1313 81.8916 56.5749 83.135 55.51C83.7393 54.9007 84.4582 54.4172 85.2503 54.0872C86.0424 53.7572 86.8919 53.5873 87.75 53.5873C88.6081 53.5873 89.4577 53.7572 90.2498 54.0872C91.0418 54.4172 91.7607 54.9007 92.365 55.51C93.5829 56.7206 95.2303 57.4001 96.9475 57.4001C98.6647 57.4001 100.312 56.7206 101.53 55.51C102.741 54.2921 103.42 52.6447 103.42 50.9275C103.42 49.2103 102.741 47.5628 101.53 46.345ZM65 0C52.1442 0 39.5771 3.81218 28.888 10.9545C18.1988 18.0968 9.86755 28.2484 4.94786 40.1256C0.0281635 52.0028 -1.25905 65.0721 1.24899 77.6808C3.75702 90.2896 9.94767 101.871 19.0381 110.962C28.1285 120.052 39.7104 126.243 52.3191 128.751C64.9279 131.259 77.9972 129.972 89.8744 125.052C101.752 120.132 111.903 111.801 119.046 101.112C126.188 90.4228 130 77.8558 130 65C130 56.4641 128.319 48.0117 125.052 40.1256C121.786 32.2394 116.998 25.0739 110.962 19.0381C104.926 13.0022 97.7606 8.21438 89.8744 4.94783C81.9883 1.68127 73.5359 0 65 0ZM65 117C54.7154 117 44.6617 113.95 36.1104 108.236C27.559 102.523 20.894 94.4013 16.9583 84.8995C13.0225 75.3978 11.9928 64.9423 13.9992 54.8553C16.0056 44.7683 20.9581 35.5028 28.2305 28.2304C35.5028 20.9581 44.7683 16.0056 54.8553 13.9992C64.9423 11.9927 75.3978 13.0225 84.8996 16.9583C94.4013 20.894 102.523 27.559 108.236 36.1103C113.95 44.6617 117 54.7154 117 65C117 78.7912 111.521 92.0176 101.77 101.77C92.0177 111.521 78.7913 117 65 117Z"
                                fill="#F9B657"/>
                        </g>
                        <defs>
                            <clipPath id="clip0_178_95">
                                <rect width="130" height="130" fill="white"/>
                            </clipPath>
                        </defs>
                    </svg>

                    <div style={modalContentStyle}>
                        <div style={modalTitleStyle}>{name}님 양치 인증 완료!</div>
                        <div style={modalSubtitleStyle}>잘하셨어요!</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ToothbrushModal;
