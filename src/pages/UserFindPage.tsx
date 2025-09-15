import React, {useState} from 'react';
import {findUser} from "../api/UserFind.ts";
import {useNavigate} from 'react-router-dom';

import Header from "../components/Header.tsx";


interface UserFindPageProps {
}

const UserFindPage: React.FC<UserFindPageProps> = () => {
    const navigate = useNavigate();
    const [inputNumber, setInputNumber] = useState<string>('');

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
    const handleConfirm = () => {
        if (inputNumber.trim()) {
            console.log('입력된 번호:', inputNumber);
            // API 호출 로직 추가
            let getUser = findUser(inputNumber);
            // 사용자 이름을 가져오지 못할 경우 에러창

            if(getUser != null) {
             setTimeout(() => {
                navigate("/kiosk/user-confirm")
            }, 1000);
            }

        }
    };

    // 키패드 버튼 스타일
    const keypadButtonStyle: React.CSSProperties = {
        padding: 0,
        width: '70px',
        height: '70px',
        background: 'transparent',
        border: 'none',
        fontSize: '60px',
        fontWeight: '700',
        color: '#111',
        cursor: 'pointer',
        lineHeight: '60px'
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
                    marginTop:'159px', marginLeft: '90px'
                }}
            >
                <div style={{width:'822px',height:'120px', marginLeft: '39px'}}>
                    <span
                    style={{color: '#111111', fontSize: 46, fontFamily: 'Pretendard', fontWeight: '700'}}>&nbsp; 사용자 번호</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '600'}}> </span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>또는</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}> </span><span
                    style={{color: '#111111', fontSize: 46, fontFamily: 'Pretendard', fontWeight: '700'}}>휴대폰 번호</span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>를 입력해주시거나<br/></span><span
                    style={{color: '#111111', fontSize: 46, fontFamily: 'Pretendard', fontWeight: '700'}}>사용자 바코드</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '600'}}> </span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>또는</span><span
                    style={{color: '#111111', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '600'}}> </span><span
                    style={{color: '#111111', fontSize: 46, fontFamily: 'Pretendard', fontWeight: '700'}}>QR코드</span><span
                    style={{color: '#595757', fontSize: 40, fontFamily: 'Pretendard', fontWeight: '400'}}>를 리더기에 대주세요.</span>
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
                    width: '320px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    rowGap: '80px',
                    columnGap: '256px',
                    alignItems: 'center',
                    justifyItems: 'center',
                    marginLeft: '175px',
                    marginTop: '130px',
                    marginRight: '175px'
                }}
            >
                {/* 숫자 키패드 1-9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handlePress(num)}
                        aria-label={num.toString()}
                        style={keypadButtonStyle}
                    >
                        {num}
                    </button>
                ))}

                {/* 전체삭제 */}
                <button
                    onClick={() => handlePress('clear')}
                    aria-label="전체삭제"
                    style={{
                        justifySelf: 'start',
                        width: '100px',
                        height: '40px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111',
                        cursor: 'pointer',
                        lineHeight: '40px'
                    }}
                >
                    전체삭제
                </button>

                {/* 0 */}
                <button
                    onClick={() => handlePress(0)}
                    aria-label="0"
                    style={{
                        width: '100px',
                        height: '100px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '60px',
                        fontWeight: '600',
                        color: '#111',
                        cursor: 'pointer',
                        lineHeight: '60px'
                    }}
                >
                    0
                </button>

                {/* 삭제 (X) */}
                <button
                    onClick={() => handlePress('backspace')}
                    aria-label="삭제"
                    style={{
                        justifySelf: 'end',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '56px',
                        height: '32px',
                        background: '#9FB4D2',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: '800',
                        cursor: 'pointer'
                    }}
                >
                    ×
                </button>
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
        </div>
    );
};

export default UserFindPage;