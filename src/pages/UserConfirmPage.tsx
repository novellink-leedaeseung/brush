import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from "../components/Header.tsx";
import HomeComponent from "../components/HomeComponent.tsx";

const UserConfirmPage: React.FC = () => {
    const navigate = useNavigate()
    const [userName, setUserName] = useState<string>('')

    useEffect(() => {

        const maskMiddleWithO = (raw: string) => {
            const chars = Array.from(raw.trim());
            const n = chars.length;
            if (n === 0) return '';
            if (n === 1) return 'O';
            if (n === 2) return chars[0] + 'O';

            if (n % 2 === 1) {
                const mid = (n - 1) / 2;
                chars[mid] = 'O';
            } else {
                const midL = n / 2 - 1;
                const midR = n / 2;
                chars[midL] = 'O';
                chars[midR] = 'O';
            }
            return chars.join('');
        };
        // localStorage에서 사용자 이름 가져오기

        const storedName = localStorage.getItem("name");
        if (storedName && storedName.trim()) {
            setUserName(`${maskMiddleWithO(storedName)} 님`);
        } else {
            // todo 버그
            setUserName('노블링크 님');
        }

    }, [])

    const handleYesClick = () => {
        navigate('/kiosk/camera')
    }

    const handleNoClick = () => {
        localStorage.clear();
        navigate('/kiosk/user-find');
    }

    return (
        <div style={{
            width: '1080px', height: '1920px',
            background: 'linear-gradient(180deg, white 0%, #D4E1F3 100%)'
        }}>
            {/* 상단 헤더 */}
            {/* 기존 헤더 코드를 Header 컴포넌트로 교체 */}
            <Header/>
            <HomeComponent right={"0"} bottom={"0"} onClick={undefined}/>


            {/* 메인 컨텐츠 */}
            <div style={{
                marginLeft: '75px',
                marginTop: '160px',
                width: '930px',
                height: '1380px',
                background: 'white',
                boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
                borderRadius: '50px'
            }}>
                {/* 사용자 확인 메시지 */}
                <div style={{
                    width: '575px',
                    height: '300px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '30px',
                    display: 'inline-flex',
                    marginTop: '125px',
                    marginLeft: '190px'
                }}>
                    <div style={{
                        alignSelf: 'stretch',
                        textAlign: 'center',
                        color: '#004F99',
                        fontSize: '94px',
                        fontFamily: 'Pretendard',
                        fontWeight: 700,
                        lineHeight: '131.60px',
                        wordWrap: 'break-word'
                    }}>
                        {userName}
                    </div>
                    <div style={{
                        alignSelf: 'stretch',
                        textAlign: 'center',
                        color: '#4B4948',
                        fontSize: '72px',
                        fontFamily: 'Pretendard',
                        fontWeight: 600,
                        lineHeight: '100.80px',
                        wordWrap: 'break-word'
                    }}>
                        본인이 맞으십니까?
                    </div>
                </div>

                {/* 네, 맞습니다 버튼 */}
                <div
                    onClick={handleYesClick}
                    style={{
                        width: '760px',
                        height: '210px',
                        background: '#004F99',
                        boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
                        borderRadius: '16px',
                        marginTop: '173px',
                        marginLeft: '85px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        height: '210px',
                        textAlign: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: 'white',
                        fontSize: '60px',
                        fontFamily: 'Pretendard',
                        fontWeight: 700,
                        lineHeight: '56px',
                        wordWrap: 'break-word'
                    }}>
                        네, 맞습니다
                    </div>
                </div>

                {/* 아닙니다 버튼 */}
                <div
                    onClick={handleNoClick}
                    style={{
                        width: '760px',
                        height: '210px',
                        background: '#E7EAF3',
                        boxShadow: '0px 4px 2px rgba(0, 0, 0, 0.09)',
                        borderRadius: '16px',
                        marginTop: '100px',
                        marginLeft: '85px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{
                        height: '210px',
                        textAlign: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#595757',
                        fontSize: '60px',
                        fontFamily: 'Pretendard',
                        fontWeight: 700,
                        lineHeight: '56px',
                        wordWrap: 'break-word'
                    }}>
                        아닙니다
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserConfirmPage