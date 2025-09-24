// pages/UserFindPage.tsx
import React, {useCallback, useState} from 'react';
import {findUser} from "@/api/UserFind.ts";
import {useNavigate} from 'react-router-dom';
import axios from "axios";

import Header from "@/components/Header.tsx";
import {HomeComponent} from "@/components/HomeComponent.tsx";
import ToothbrushModal from "@/components/userFind/ToothbrushModal.tsx";

import NotificationModal from "@/components/userFind/NotificationModal.tsx";
import NumberKeypad from "@/components/userFind/NumberKeypad.tsx";
import MaskedPhoneDisplay, {maskPhoneNumber} from "@/components/userFind/MaskedPhoneDisplay.tsx";
import {flushSync} from "react-dom";
import NetworkNotificationModal from "@/components/userFind/NetworkNotificationModal.tsx";

const UserFindPage: React.FC = () => {
    const navigate = useNavigate();
    const [inputNumber, setInputNumber] = useState<string>('');
    const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
    const [showNetworkNotificationModal, setNetworkNotificationModal] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("일치하는 회원 정보가 없습니다.");
    const [showSuccessModalName, setShowSuccessModalName] = useState<string>('테스트');

    // 입력 처리 (기존 로직 그대로)
    const handlePress = useCallback((value: number | 'clear' | 'backspace') => {
        // 입력 상태 갱신을 즉시 플러시
        flushSync(() => {
            setInputNumber(prev => {
                if (typeof value === 'number') {
                    return prev.length < 11 ? prev + value : prev;
                }
                if (value === 'clear') return '';
                if (value === 'backspace') return prev.slice(0, -1);
                return prev;
            });
        });
    }, []);


    // 확인 버튼 클릭 (기존 로직 그대로)
    const handleConfirm = async () => {
        const n = inputNumber.trim();
        if (!n) return;

        try {
            const kioskUser = await findUser(n);
            if (!kioskUser.resultCode) {
                setNotificationMessage("일치하는 회원 정보가 없습니다.");
                setShowNotificationModal(true);
                return;
            }
            setShowSuccessModalName(kioskUser.resultData.username);
        } catch (err) {
            setNetworkNotificationModal(true);
            return;
        }

        try {
            await axios.get(`http://localhost:3001/api/members/${n}`);
            localStorage.setItem("inputNumber", n);
            setTimeout(() => navigate("/kiosk/user-confirm"), 1000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                if (status === 404) {
                    setShowSuccessModal(true);
                } else {
                    setNotificationMessage("구강인증 서버 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
                }
            } else {
                setNotificationMessage("구강인증 조회 중 알 수 없는 오류가 발생했습니다.");
            }
            // setShowNotificationModal(true); // 기존 주석 유지
        }
    };

    return (
        <div style={{width: '1080px', height: '1920px', background: 'linear-gradient(180deg, white 0%, #D4E1F3 100%)'}}>
            <Header/>
            <HomeComponent onClick={undefined}/>

            {/* 안내문 (그대로) */}
            <div style={{
                width: '900px',
                height: '120px',
                marginTop: '179px',
                marginLeft: '90px',
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{width: '841px', height: '68px', marginLeft: '39px'}}>
                    <div
                        style={{
                            textAlign: "center",
                            justifyContent: "center",
                        }}
                    >
        <span
            style={{
                color: "#111111",
                fontSize: 52,
                fontFamily: "Pretendard",
                fontWeight: 700,
                lineHeight: "67.6px",
                wordWrap: "break-word",
            }}
        >
          사용자 번호
        </span>
                        <span
                            style={{
                                color: "#111111",
                                fontSize: 40,
                                fontFamily: "Pretendard",
                                fontWeight: 600,
                                lineHeight: "52px",
                                wordWrap: "break-word",
                            }}
                        >
          {" "}
        </span>
                        <span
                            style={{
                                color: "#595757",
                                fontSize: 42,
                                fontFamily: "Pretendard",
                                fontWeight: 400,
                                lineHeight: "54.6px",
                                wordWrap: "break-word",
                            }}
                        >
          또는
        </span>
                        <span
                            style={{
                                color: "#111111",
                                fontSize: 40,
                                fontFamily: "Pretendard",
                                fontWeight: 400,
                                lineHeight: "52px",
                                wordWrap: "break-word",
                            }}
                        >
          {" "}
        </span>
                        <span
                            style={{
                                color: "#111111",
                                fontSize: 52,
                                fontFamily: "Pretendard",
                                fontWeight: 700,
                                lineHeight: "67.6px",
                                wordWrap: "break-word",
                            }}
                        >
          휴대폰 번호
        </span>
                        <span
                            style={{
                                color: "#595757",
                                fontSize: 42,
                                fontFamily: "Pretendard",
                                fontWeight: 400,
                                lineHeight: "54.6px",
                                wordWrap: "break-word",
                            }}
                        >
          를 입력해주세요.
        </span>
                    </div>
                </div>
            </div>

            {/* 입력 표시 컴포넌트 */
            }
            <MaskedPhoneDisplay value={inputNumber}/>

            {/* 키패드 컴포넌트 */
            }
            <NumberKeypad onPress={handlePress}/>

            {/* 확인 버튼 (그대로) */
            }
            <div
                onClick={handleConfirm}
                style={{
                    width: '630px', height: '120px', background: '#004F99', borderRadius: '16px',
                    boxShadow: '0px 4px 2px rgba(0,0,0,0.09)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', marginLeft: '225px', marginTop: '65px', cursor: 'pointer'
                }}
            >
        <span style={{color: '#ffffff', fontSize: '44px', fontWeight: 600, lineHeight: 1.27, textAlign: 'center'}}>
          확인
        </span>
            </div>

            {/* 성공(양치) 모달 & 알림 모달 */
            }
            <ToothbrushModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                autoShow={false}
                name={showSuccessModalName}
            />
            <NotificationModal
                isVisible={showNotificationModal}
                message={notificationMessage}
                maskedPhoneText={maskPhoneNumber(inputNumber)}
                // onConfirm={() => setShowNotificationModal(false)} // 필요하면 이렇게 닫기만
            />
            <NetworkNotificationModal isVisible={showNetworkNotificationModal} message={""}/>
        </div>
    )
        ;
};

export default UserFindPage;
