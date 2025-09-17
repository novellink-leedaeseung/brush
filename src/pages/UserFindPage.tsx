// UserFindPage.tsx
import React, {useState} from 'react';
import {findUser} from "../api/UserFind.ts";
import {useNavigate} from 'react-router-dom';

import Header from "../components/Header.tsx";
import {HomeComponent} from "../components/HomeComponent.tsx";


const UserFindPage: React.FC<UserFindPageProps> = () => {
    const navigate = useNavigate();
    const [inputNumber, setInputNumber] = useState<string>('');
    const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

    // ⬇️ 추가: 현재 눌리고 있는 숫자 키 상태 (눌린 동안만 숫자 흰색)
    const [activeKey, setActiveKey] = useState<number | 'clear' | null>(null)


    // 알림창 닫기 함수
    const closeNotificationModal = () => {
        setShowNotificationModal(false);
    };

    // 알림창 컴포넌트
    const NotificationModal = ({isVisible, onClose}: { isVisible: boolean; onClose: () => void }) => {
        if (!isVisible) return null;

        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(49, 49, 49, 0.6)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    width: '932px',
                    height: '675px',
                    background: '#FFFFFF',
                    borderRadius: '50px',
                    boxShadow: '2px 2px 2px 0px rgba(0, 79, 153, 0.09)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxSizing: 'border-box'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: '1',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: '130px',
                            height: '130px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px'
                        }}>
                            <img src="/public/assets/icon/warning.svg" alt=""/>
                        </div>

                        <div style={{
                            width: '714px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <span style={{
                                fontFamily: 'Pretendard, Arial, sans-serif',
                                fontWeight: '700',
                                fontSize: '38px',
                                lineHeight: '1.4em',
                                letterSpacing: '-2.5%',
                                textAlign: 'center',
                                color: '#4B4948'
                            }}>
                                일치하는 회원 정보가 없습니다.
                            </span>
                        </div>

                        <div style={{
                            width: '560px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '18px'
                        }}>
                            <span style={{
                                color: "#004F99",
                                textAlign: "center",
                                fontFeatureSettings: "'liga' off, 'clig' off",
                                fontFamily: "Jalnan2",
                                fontSize: "74px",
                                fontStyle: "normal",
                                fontWeight: 400,
                                lineHeight: "56px", // 75.676%
                                letterSpacing: "-1.85px",
                            }}>
                                {maskPhoneNumber(inputNumber)}
                            </span>
                        </div>

                        <div style={{
                            width: '800px',
                            height: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                                <span
                                    style={{
                                        color: '#111111',
                                        fontSize: 44,
                                        fontFamily: 'Pretendard',
                                        fontWeight: '500',
                                        lineHeight: 61.60,
                                        wordWrap: 'break-word'
                                    }}>보건실에서</span><span
                            style={{
                                color: '#111111',
                                fontSize: 44,
                                fontFamily: 'Pretendard',
                                fontWeight: '700',
                                lineHeight: 61.60,
                                wordWrap: 'break-word'
                            }}> </span><span
                            style={{
                                color: '#004F99',
                                fontSize: 44,
                                fontFamily: 'Pretendard',
                                fontWeight: '700',
                                lineHeight: 61.60,
                                wordWrap: 'break-word'
                            }}>&nbsp; 보건선생님의 도움</span><span
                            style={{
                                color: '#111111',
                                fontSize: 44,
                                fontFamily: 'Pretendard',
                                fontWeight: '500',
                                lineHeight: 61.60,
                                wordWrap: 'break-word'
                            }}>을 받아 주세요.</span>
                        </div>
                    </div>

                    <div
                        onClick={onClose}
                        style={{
                            width: '630px',
                            height: '120px',
                            background: '#004F99',
                            borderRadius: '16px',
                            boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginBottom: '50px',
                            marginLeft: '151px',
                        }}
                    >
                        <span style={{
                            fontFamily: 'Pretendard, Arial, sans-serif',
                            fontWeight: '600',
                            fontSize: '44px',
                            lineHeight: '1.27em',
                            textAlign: 'center',
                            color: '#FFFFFF'
                        }}>
                            확인
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // 핸드폰번호 마스킹 함수 (010 입력 즉시 하이픈 추가, 오른쪽부터 마스킹)
    const maskPhoneNumber = (number: string): string => {
        if (number.startsWith('010')) {
            if (number.length <= 3) return number;
            else if (number.length <= 7) {
                const part1 = number.slice(0, 3);
                const part2 = number.slice(3);
                return `${part1}-${part2}`;
            } else if (number.length <= 11) {
                const part1 = number.slice(0, 3);
                const part2 = number.slice(3, 7);
                const part3 = number.slice(7);
                const maskedPart = '*'.repeat(part3.length);
                return `${part1}-${part2}-${maskedPart}`;
            }
        }
        if (number.length <= 7) return number;
        const visiblePart = number.slice(0, 7);
        const maskedPart = '*'.repeat(number.length - 7);
        return visiblePart + maskedPart;
    };

    // 키패드 입력 처리
    const handlePress = (value: number | string) => {
        if (typeof value === 'number') {
            if (inputNumber.length < 11) {
                setInputNumber(prev => prev + value);
            }
        } else if (value === 'clear') {
            setInputNumber('');
        } else if (value === 'backspace') {
            setInputNumber(prev => prev.slice(0, -1));
        }
    };

    // 확인 버튼 클릭 처리
    const handleConfirm = async () => {
        if (inputNumber.trim()) {
            try {
                const getUser = await findUser(inputNumber);
                if (getUser != null) {
                    localStorage.setItem('inputNumber', inputNumber);
                    setTimeout(() => navigate("/kiosk/user-confirm"), 1000);
                } else {
                    setShowNotificationModal(true);
                }
            } catch (error) {
                console.error('사용자 조회 실패:', error);
                setShowNotificationModal(true);
            }
        }
    };

    // 키패드 버튼 스타일
    const keypadButtonStyle: React.CSSProperties = {
        width: '310px',
        height: '140px',
        background: 'transparent',
        border: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: 'Pretendard, Arial, sans-serif',
        fontWeight: '700',
        fontSize: '60px',
        lineHeight: '0.93em',
        textAlign: 'center',
        color: '#111111',
        // 하이라이트/포커스 제거용
        outline: 'none',
        WebkitTapHighlightColor: 'transparent' as any,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        appearance: 'none' as any,
        WebkitAppearance: 'none' as any,
    };

    // ⬇️ 추가: 숫자 버튼 렌더링 헬퍼 (눌리는 동안만 숫자 흰색)
    const renderNumButton = (num: number) => (
        <button
            key={num}
            type="button"
            aria-label={String(num)}
            style={keypadButtonStyle}
            onMouseDown={() => setActiveKey(num)}
            onMouseUp={() => setActiveKey(null)}
            onMouseLeave={() => setActiveKey(null)}
            onTouchStart={() => setActiveKey(num)}
            onTouchEnd={() => setActiveKey(null)}
            onClick={() => handlePress(num)}
        >
            <span style={{color: activeKey === num ? '#FFFFFF' : '#111111'}}>
                {num}
            </span>
        </button>
    );
    const clearActive = () => setActiveKey(null)

    return (

        <div
            style={{
                width: '1080px', height: '1920px', background: 'linear-gradient(180deg, white 0%, #D4E1F3 100%)',
            }}
        >
            {/* 기존 헤더 코드를 Header 컴포넌트로 교체 */}
            <Header/>
            <HomeComponent right={0} bottom={0} onClick={undefined}/>

            {/* 안내문 */}
            <div
                style={{
                    width: '900px',
                    height: '120px',
                    marginTop: '159px', marginLeft: '90px'
                }}
            >
                <div style={{width: '822px', height: '120px', marginLeft: '39px'}}>
                    <span
                        style={{color: '#111111', fontSize: 46, fontFamily: 'Pretendard', fontWeight: '700'}}>&nbsp; 사용자 번호</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '600'}}> </span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>또는</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}> </span><span
                    style={{
                        color: '#111111',
                        fontSize: 46,
                        fontFamily: 'Pretendard',
                        fontWeight: '700'
                    }}>휴대폰 번호</span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>를 입력해주시거나<br/></span><span
                    style={{color: '#111111', fontSize: 46, fontFamily: 'Pretendard', fontWeight: '700'}}>사용자 바코드</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '600'}}> </span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>또는</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '600'}}> </span><span
                    style={{
                        color: '#111111',
                        fontSize: 46,
                        fontFamily: 'Pretendard',
                        fontWeight: '700'
                    }}>QR코드</span><span
                    style={{
                        color: '#595757',
                        fontSize: 40,
                        fontFamily: 'Pretendard',
                        fontWeight: '400'
                    }}>를 리더기에 대주세요.</span>
                </div>
            </div>

            {/* 입력 필드 */}
            <div
                style={{
                    width: '860px',
                    height: '170px',
                    background: 'white',
                    boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
                    borderRadius: '16px',
                    marginLeft: '110px',
                    marginTop: '140px'
                }}
            >
                <div
                    style={{
                        height: '170px',
                        textAlign: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {inputNumber === '' ? (
                        <span style={{
                            color: '#B5B5B6',
                            fontSize: '44px',
                            fontWeight: '600',
                            lineHeight: '56px'
                        }}>
                            사용자 번호 또는 휴대폰 번호
                        </span>
                    ) : (
                        <span style={{
                            color: "#111111",
                            fontSize: 68,
                            fontFamily: "Jalnan2",
                            fontWeight: 400,
                            lineHeight: "56px",
                            wordWrap: "break-word",
                        }}>
                            {maskPhoneNumber(inputNumber)}
                        </span>
                    )}
                </div>
            </div>

            {/* 키패드 */}
            <div
                style={{
                    width: '970px',
                    height: '590px',
                    marginLeft: '55px',
                    marginTop: '95px',
                    position: 'relative'
                }}
            >
                {/* 첫 번째 줄: 1, 2, 3 */}
                <div style={{
                    position: 'absolute',
                    top: '0px',
                    left: '0px',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    {renderNumButton(1)}
                    {renderNumButton(2)}
                    {renderNumButton(3)}
                </div>

                {/* 두 번째 줄: 4, 5, 6 */}
                <div style={{
                    position: 'absolute',
                    top: '150px',
                    left: '0px',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    {renderNumButton(4)}
                    {renderNumButton(5)}
                    {renderNumButton(6)}
                </div>

                {/* 세 번째 줄: 7, 8, 9 */}
                <div style={{
                    position: 'absolute',
                    top: '300px',
                    left: '0px',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    {renderNumButton(7)}
                    {renderNumButton(8)}
                    {renderNumButton(9)}
                </div>

                {/* 네 번째 줄: 전체삭제, 0, 삭제 */}
                <div style={{
                    position: 'absolute',
                    top: '450px',
                    left: '0px',
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'space-between'
                }}>
                    <button
                        type="button"
                        aria-label="전체삭제"
                        style={{...keypadButtonStyle, fontSize: '38px', lineHeight: '1.47em'}}
                        onPointerDown={() => setActiveKey('clear')}
                        onPointerUp={clearActive}
                        onPointerCancel={clearActive}
                        onPointerLeave={clearActive}
                        onFocus={(e) => e.currentTarget.blur()}
                        onClick={() => handlePress('clear')}
                    >
  <span style={{color: activeKey === 'clear' ? '#FFFFFF' : '#111111'}}>
    전체삭제
  </span>
                    </button>


                    {renderNumButton(0)}

                    <button
                        onClick={() => handlePress('backspace')}
                        aria-label="삭제"
                        style={{
                            width: '310px',
                            height: '140px',
                            background: 'transparent',
                            border: 'none',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            cursor: 'pointer',
                            outline: 'none',
                            WebkitTapHighlightColor: 'transparent' as any,
                            userSelect: 'none',
                            WebkitUserSelect: 'none' as any,
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            appearance: 'none' as any,
                            WebkitAppearance: 'none' as any,
                            touchAction: 'manipulation',
                        }}
                    >
                        <div style={{
                            width: '88.82px',
                            height: '56px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <img src="/public/assets/icon/backspace.svg" alt=""/>
                        </div>
                    </button>
                </div>
            </div>

            {/* 확인 버튼 */}
            <div
                onClick={handleConfirm}
                style={{
                    width: '630px',
                    height: '120px',
                    background: '#004F99',
                    borderRadius: '16px',
                    boxShadow: '0px 4px 2px rgba(0,0,0,0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '225px',
                    marginTop: '65px',
                    cursor: 'pointer'
                }}
            >
                <span
                    style={{
                        color: '#ffffff',
                        fontSize: '44px',
                        fontWeight: '600',
                        lineHeight: 1.27,
                        textAlign: 'center'
                    }}
                >
                    확인
                </span>
            </div>

            {/* 바코드/QR코드 영역 */}
            <div
                style={{
                    width: '900px',
                    height: '120px',
                    background: '#383839',
                    boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    marginTop: '189px',
                    marginLeft: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        color: 'white',
                        fontSize: '44px',
                        fontWeight: '600',
                        lineHeight: '56px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <img
                        src="/assets/icon/barcode_location.svg"
                        alt=""
                        width="40"
                        height="34"
                        style={{marginRight: '30px'}}
                    />
                    바코드 / QR 코드 대는 곳
                </div>
            </div>

            {/* 알림창 */}
            <NotificationModal
                isVisible={showNotificationModal}
                onClose={closeNotificationModal}
            />
        </div>
    );
};

export default UserFindPage;
