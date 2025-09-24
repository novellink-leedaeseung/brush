import React from "react";

interface NetworkNotificationModalProps {
    isVisible: boolean;
    message: string;
    onConfirm?: () => void;   // 확인 버튼 클릭 시
}

const NetworkNotificationModal: React.FC<NetworkNotificationModalProps> = ({
                                                                               isVisible,
                                                                               message,
                                                                               onConfirm,
                                                                           }) => {
    if (!isVisible) return null;

    setTimeout(() => window.location.href = window.location.origin + window.location.pathname + "#/", 3000)

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            backgroundColor: 'rgba(49, 49, 49, 0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                width: '932px', height: '675px', background: '#FFFFFF',
                borderRadius: '50px', boxShadow: '2px 2px 2px 0px rgba(0, 79, 153, 0.09)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box'
            }}>
                <div style={{
                    alignItems: 'center',
                    flex: 1,
                }}>
                    <div style={{
                        width: '130px', height: '130px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: '401px', marginTop: '60px',
                    }}>
                        <img src="/assets/icon/warning.svg" alt=""/>
                    </div>

                    <div style={{
                        width: '840px',
                        height: '190px',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 10,
                        display: 'inline-flex',
                        marginTop: '80px',
                        marginLeft: '46px',
                    }}>
                        <div style={{
                            width: 840,
                            height: 90,
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#004F99',
                            fontSize: 64,
                            fontFamily: 'Pretendard',
                            fontWeight: '700',
                            lineHeight: 89.60,
                            wordWrap: 'break-word'
                        }}>네트워크 연결이 불안정합니다.
                        </div>
                        <div style={{
                            alignSelf: 'stretch',
                            height: 90,
                            textAlign: 'center',
                            justifyContent: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#4B4948',
                            fontSize: 68,
                            fontFamily: 'Pretendard',
                            fontWeight: '500',
                            lineHeight: 95.20,
                            wordWrap: 'break-word'
                        }}>관리자에게 문의해주세요.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkNotificationModal;
