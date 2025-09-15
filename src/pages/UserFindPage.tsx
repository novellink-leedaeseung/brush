import React, {useState} from 'react';
import {findUser} from "../api/UserFind.ts";
import {useNavigate} from 'react-router-dom';

import Header from "../components/Header.tsx";


interface UserFindPageProps {
}

const UserFindPage: React.FC<UserFindPageProps> = () => {
    const navigate = useNavigate();
    const [inputNumber, setInputNumber] = useState<string>('');
    const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

    // 알림창 닫기 함수
    const closeNotificationModal = () => {
        setShowNotificationModal(false);
        // 키패드 화면으로 이동 (현재 화면 유지이므로 특별한 처리 없음)
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
                    // alignItems: 'center',
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
        // 010으로 시작하는 핸드폰 번호인 경우
        if (number.startsWith('010')) {
            if (number.length <= 3) {
                // 010까지만 입력된 경우
                return number;
            } else if (number.length <= 7) {
                // 010 + 중간번호 입력 중: 010-1234
                const part1 = number.slice(0, 3);   // 010
                const part2 = number.slice(3);      // 중간번호
                return `${part1}-${part2}`;
            } else if (number.length <= 11) {
                // 8자리 이상: 010-1234-**** 형태로 마스킹
                const part1 = number.slice(0, 3);   // 010
                const part2 = number.slice(3, 7);   // 중간번호 (4자리)
                const part3 = number.slice(7);      // 뒷번호 실제 입력된 부분

                // 뒷번호는 입력된 만큼만 *로 마스킹
                const maskedPart = '*'.repeat(part3.length);
                return `${part1}-${part2}-${maskedPart}`;
            }
        }

        // 010이 아닌 경우 기존 로직
        if (number.length <= 7) {
            return number;
        }
        const visiblePart = number.slice(0, 7);
        const maskedPart = '*'.repeat(number.length - 7);
        return visiblePart + maskedPart;
    };

    // 키패드 입력 처리
    const handlePress = (value: number | string) => {
        if (typeof value === 'number') {
            // 숫자는 최대 11자리까지만 입력 가능
            if (inputNumber.length < 11) {
                setInputNumber(prev => prev + value);
            }
        } else if (value === 'clear') {
            // 전체 삭제
            setInputNumber('');
        } else if (value === 'backspace') {
            // 마지막 숫자 삭제
            setInputNumber(prev => prev.slice(0, -1));
        }
    };

    // 확인 버튼 클릭 처리
    const handleConfirm = async () => {
        if (inputNumber.trim()) {
            console.log('입력된 번호:', inputNumber);
            try {
                // API 호출 로직 추가
                let getUser = await findUser(inputNumber);

                // 사용자 이름을 가져오지 못할 경우 에러창
                if (getUser != null) {
                    setTimeout(() => {
                        navigate("/kiosk/user-confirm");
                    }, 1000);
                } else {
                    // 알림창 표시
                    setShowNotificationModal(true);
                }
            } catch (error) {
                console.error('사용자 조회 실패:', error);
                // 알림창 표시
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
        color: '#111111'
    };

    return (

        <div
            style={{
                width: '1080px', height: '1920px', background: 'linear-gradient(180deg, white 0%, #D4E1F3 100%)',
            }}
        >
            {/* 기존 헤더 코드를 Header 컴포넌트로 교체 */}
            <Header/>

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
                        flexDirection: 'column',
                        color: inputNumber === '' ? '#B5B5B6' : '#111111',
                        fontSize: '44px',
                        fontWeight: '600',
                        lineHeight: '56px'
                    }}
                >
                    {inputNumber === '' ? '사용자 번호 또는 휴대폰 번호' : maskPhoneNumber(inputNumber)}
                </div>
            </div>

            {/* 키패드 */}
            <div
                style={{
                    width: '970px',
                    height: '590px',
                    marginLeft: '55px',
                    marginTop: '130px',
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
                    <button
                        onClick={() => handlePress(1)}
                        aria-label="1"
                        style={keypadButtonStyle}
                    >
                        1
                    </button>
                    <button
                        onClick={() => handlePress(2)}
                        aria-label="2"
                        style={keypadButtonStyle}
                    >
                        2
                    </button>
                    <button
                        onClick={() => handlePress(3)}
                        aria-label="3"
                        style={keypadButtonStyle}
                    >
                        3
                    </button>
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
                    <button
                        onClick={() => handlePress(4)}
                        aria-label="4"
                        style={keypadButtonStyle}
                    >
                        4
                    </button>
                    <button
                        onClick={() => handlePress(5)}
                        aria-label="5"
                        style={keypadButtonStyle}
                    >
                        5
                    </button>
                    <button
                        onClick={() => handlePress(6)}
                        aria-label="6"
                        style={keypadButtonStyle}
                    >
                        6
                    </button>
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
                    <button
                        onClick={() => handlePress(7)}
                        aria-label="7"
                        style={keypadButtonStyle}
                    >
                        7
                    </button>
                    <button
                        onClick={() => handlePress(8)}
                        aria-label="8"
                        style={keypadButtonStyle}
                    >
                        8
                    </button>
                    <button
                        onClick={() => handlePress(9)}
                        aria-label="9"
                        style={keypadButtonStyle}
                    >
                        9
                    </button>
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
                        onClick={() => handlePress('clear')}
                        aria-label="전체삭제"
                        style={{
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
                            fontSize: '38px',
                            lineHeight: '1.47em',
                            textAlign: 'center',
                            color: '#111111'
                        }}
                    >
                        전체삭제
                    </button>
                    <button
                        onClick={() => handlePress(0)}
                        aria-label="0"
                        style={keypadButtonStyle}
                    >
                        0
                    </button>
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
                            cursor: 'pointer'
                        }}
                    >
                        {/* 삭제 버튼 배경 */}
                        <div style={{
                            width: '88.82px',
                            height: '56px',
                            background: '#8C9AB7',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {/* X 아이콘 */}
                            <div style={{
                                width: '28.68px',
                                height: '28.66px',
                                background: '#FFFFFF',
                                borderRadius: '50%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontSize: '18px',
                                fontWeight: '800',
                                color: '#8C9AB7'
                            }}>
                                ×
                            </div>
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
                    marginTop: '100px',
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