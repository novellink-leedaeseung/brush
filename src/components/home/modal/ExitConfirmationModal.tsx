import React, {useState, useEffect, CSSProperties} from 'react';
const { ipcRenderer } = window.require('electron');

interface ExitConfirmationModalProps {
    isOpen: boolean;
    onClose?: () => void;
    autoShow?: boolean;
}

const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         autoShow = false
                                                                     }) => {
    const [showModal, setShowModal] = useState<boolean>(false);

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
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showModal) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showModal]);

    const handleClose = (): void => {
        setShowModal(false);
        if (onClose) {
            onClose();
        }
    };

    const handleConfirm = (): void => {
        ipcRenderer.invoke('app:quit');
        setShowModal(false);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!showModal) return null;

    const modalContainerStyle: CSSProperties = {
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

    const backgroundOverlayStyle: CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(49, 49, 49, 0.6)',
        zIndex: 1
    };

    // 피그마 원본 크기: 932px width, 500px height
    const modalStyle: CSSProperties = {
        position: 'relative',
        width: '932px',
        height: '500px',
        background: '#FFFFFF',
        borderRadius: '50px',
        boxShadow: '2px 2px 2px 0px rgba(0, 79, 153, 0.09)',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'modalFadeIn 0.3s ease-out',
        padding: 0
    };

    // 제목 텍스트: 피그마 기준 x=109, y=82, width=714, height=131.93
    const modalTitleStyle: CSSProperties = {
        position: 'absolute',
        top: '82px',
        left: '109px',
        width: '714px',
        height: '131.93px',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        fontWeight: 700,
        fontSize: '64px',
        lineHeight: '1.4',
        letterSpacing: '-0.025em',
        textAlign: 'center',
        color: '#4B4948',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
    };

    // 버튼 컨테이너: 피그마 기준 x=52, y=298, width=828, height=120
    const buttonContainerStyle: CSSProperties = {
        position: 'absolute',
        top: '298px',
        left: '52px',
        width: '828px',
        height: '120px',
        display: 'flex',
        flexDirection: 'row',
        gap: '28px' // 428px - 400px = 28px gap
    };

    // 아니요 버튼: 피그마 기준 width=400, height=120
    const cancelButtonStyle: CSSProperties = {
        width: '400px',
        height: '120px',
        background: '#E7EAF3',
        border: '1px solid #EAECF0',
        borderRadius: '8px',
        fontFamily: 'Pretendard, sans-serif',
        fontWeight: 700,
        fontSize: '40px',
        lineHeight: '1.6',
        textAlign: 'center',
        color: '#595757',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.2s ease',
        padding: '12px 24px'
    };

    // 예 버튼: 피그마 기준 width=400, height=120
    const confirmButtonStyle: CSSProperties = {
        width: '400px',
        height: '120px',
        background: '#004F99',
        border: '1px solid transparent',
        borderImage: 'linear-gradient(45deg, rgba(41, 112, 255, 1) 0%, rgba(0, 64, 193, 1) 100%) 1',
        borderRadius: '8px',
        fontFamily: 'Pretendard, sans-serif',
        fontWeight: 700,
        fontSize: '40px',
        lineHeight: '1.6',
        textAlign: 'center',
        color: '#FFFFFF',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.2s ease',
        padding: '12px 24px'
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
                    {/* Modal Title */}
                    <div style={modalTitleStyle}>종료 하시겠습니까?</div>

                    {/* Button Container */}
                    <div style={buttonContainerStyle}>
                        {/* Cancel Button */}
                        <button
                            style={cancelButtonStyle}
                            onClick={handleClose}
                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
                                (e.target as HTMLButtonElement).style.background = '#d1d6e4'
                            }
                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
                                (e.target as HTMLButtonElement).style.background = '#E7EAF3'
                            }
                        >
                            아니요
                        </button>

                        {/* Confirm Button */}
                        <button
                            style={confirmButtonStyle}
                            onClick={handleConfirm}
                            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
                                (e.target as HTMLButtonElement).style.background = '#003d7a'
                            }
                            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
                                (e.target as HTMLButtonElement).style.background = '#004F99'
                            }
                        >
                            예
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExitConfirmationModal;