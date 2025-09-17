import React, {useState} from 'react';

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
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,                  // inset-0
                    backgroundColor: "#31313199", // bg-black + bg-opacity-60 (자식 흐려지지 않게 opacity 대신 RGBA)
                    zIndex: 9999,             // z-[9999]
                    display: "flex",          // flex
                    alignItems: "center",     // items-center
                    justifyContent: "center", // justify-center
                    width: '100vw',
                    height: '100vh',
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
                        backgroundColor: "white",
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
                    <img src="/public/assets/icon/warning.svg" alt="" width="130" height="130" style={{
                        marginTop: '60px',
                        marginLeft: '401px',
                    }}/>

                    {/* Frame 363 - 텍스트 컨테이너 (margin으로 위치 설정) */}
                    <div
                        style={{
                            marginLeft: '126px',  // absolute position을 margin으로 변경
                            marginTop: showIcon ? '80px' : '270px', // 아이콘 있을 때는 간격 조정, 없을 때는 270px
                            width: '680px', // 피그마 width: 680
                            height: '190px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            gap: '10px'     // 피그마 gap: 10px
                        }}
                        data-name="frame-363"
                        data-node-id="134:365"
                    >
                        {/* 주요 메시지 - "시간이 초과되었습니다." */}
                        <div
                            style={{
                                // 시간이 초과되었습니다.
                                color: '#004F99',
                                fontSize: "72px",
                                fontFamily: 'Pretendard',
                                fontWeight: '700',
                                lineHeight: "140%",
                                letterSpacing: '-1.8px',
                                wordWrap: 'break-word',
                                height: '90px',
                                width: '680px',
                                textAlign: 'center',
                            }}
                            data-node-id="134:366"
                        >
                            {primaryMessage}
                        </div>

                        {/* 부가 메시지 - "대기화면으로 이동합니다." */}
                        <div
                            style={{
                                // 대기화면으로 이동합니다.
                                width: '680px',
                                height: '90px',
                                color: '#4B4948',
                                fontSize: "68px",
                                fontFamily: 'Pretendard',
                                fontWeight: '500',
                                lineHeight: "140%",
                                letterSpacing: '-1.7px',
                                wordWrap: 'break-word',
                                textAlign: 'center',

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