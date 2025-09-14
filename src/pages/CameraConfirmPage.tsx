import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from "../components/Header.tsx";

const CameraConfirmPage: React.FC = () => {
    const navigate = useNavigate()
    const [capturedImage, setCapturedImage] = useState<string>('')
    const [showLunchModal, setShowLunchModal] = useState(false)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const confirmationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // 컴포넌트가 마운트될 때 저장된 이미지 불러오기
    useEffect(() => {
        const CAPTURED_PHOTO_KEY = 'camara.capturedPhoto'
        const savedImage = sessionStorage.getItem(CAPTURED_PHOTO_KEY)
        if (savedImage) {
            setCapturedImage(savedImage)
        }
    }, [])

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowLunchModal(false)
                setShowConfirmationModal(false)
                document.body.style.overflow = 'auto'
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            if (confirmationTimeoutRef.current) {
                clearTimeout(confirmationTimeoutRef.current)
            }
        }
    }, [])

    // 현재 시간 표시를 위한 상태
    const [currentTime, setCurrentTime] = useState(() => {
        const now = new Date()
        return {
            date: now.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\. /g, '-').replace('.', ''),
            time: now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        }
    })

    // 1분마다 시간 업데이트
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            setCurrentTime({
                date: now.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\. /g, '-').replace('.', ''),
                time: now.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
            })
        }, 60000)

        return () => clearInterval(timer)
    }, [])

    // 점심시간 체크 (예시: 12:00 ~ 13:00)
    const isLunchTime = () => {
        const now = new Date()
        const hour = now.getHours()
        return hour >= 12 && hour < 13
    }

    // 재촬영 버튼 클릭
    const handleRetake = () => {
        navigate('/kiosk/camera')
    }

    // 홈으로 버튼 클릭
    const handleHome = () => {
        navigate('/')
    }

    // 등록 버튼 클릭
    const handleRegister = () => {
        if (!isLunchTime()) {
            setShowLunchModal(true)
            document.body.style.overflow = 'hidden'
        } else {
            // 점심시간이면 바로 등록
            showRegistrationComplete()
        }
    }

    // 등록 완료 모달 표시
    const showRegistrationComplete = () => {
        setShowLunchModal(false)
        setShowConfirmationModal(true)
        document.body.style.overflow = 'hidden'

        // 3초 후 자동으로 모달 닫기
        confirmationTimeoutRef.current = setTimeout(() => {
            setShowConfirmationModal(false)
            document.body.style.overflow = 'auto'
            // 홈으로 이동
            navigate('/')
        }, 3000)
    }

    // 점심시간 모달 - 아니요 클릭
    const handleLunchModalNo = () => {
        setShowLunchModal(false)
        document.body.style.overflow = 'auto'
    }

    // 점심시간 모달 - 등록 클릭
    const handleLunchModalRegister = () => {
        showRegistrationComplete()
    }

    // 점심시간 모달 닫기
    const closeLunchModal = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            setShowLunchModal(false)
            document.body.style.overflow = 'auto'
        }
    }

    // 확인 모달 닫기
    const closeConfirmationModal = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            setShowConfirmationModal(false)
            document.body.style.overflow = 'auto'
            if (confirmationTimeoutRef.current) {
                clearTimeout(confirmationTimeoutRef.current)
            }
        }
    }

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* 스타일 정의 */}
            <style>{`
        /* 알림창 트리거 버튼 */
        .lunch-false-trigger-button {
          display: block;
          margin: 50px auto;
          padding: 15px 30px;
          background: #004f99;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .lunch-false-trigger-button:hover {
          background: #003d7a;
        }

        /* 모달 오버레이 */
        .lunch-false-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(49, 49, 49, 0.6);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: lunch-false-fade-in 0.3s ease;
        }

        /* 알림창 컨테이너 */
        .lunch-false-container {
          position: relative;
          width: 932px;
          max-width: 90vw;
          height: 675px;
          max-height: 80vh;
          border-radius: 41px;
          box-shadow: 2px 2px 2px 0px rgba(42, 73, 148, 0.09);
          animation: lunch-false-slide-up 0.3s ease;
        }

        .lunch-false-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 50px;
          box-shadow: 2px 2px 2px 0px rgba(0, 79, 153, 0.09);
        }

        /* 시계 컨테이너 */
        .lunch-false-clock-container {
          position: absolute;
          left: 50%;
          top: 60px;
          width: 130px;
          height: 130px;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .lunch-false-main-message {
          position: absolute;
          left: 50%;
          top: 200px;
          width: 80%;
          height: 130px;
          transform: translateX(-50%);
          font-weight: 700;
          font-size: 64px;
          line-height: 1.4;
          letter-spacing: -1.6px;
          text-align: center;
          color: #4b4948;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lunch-false-secondary-message {
          position: absolute;
          left: 50%;
          top: 330px;
          width: 80%;
          height: 130px;
          transform: translateX(-50%);
          font-weight: 500;
          font-size: 64px;
          line-height: 1.4;
          letter-spacing: -1.6px;
          text-align: center;
          color: #004f99;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lunch-false-buttons-container {
          position: absolute;
          left: 50%;
          top: 505px;
          width: 828px;
          max-width: 90%;
          height: 120px;
          transform: translateX(-50%);
          display: flex;
          gap: 28px;
        }

        .lunch-false-button {
          height: 120px;
          flex: 1;
          border-radius: 8px;
          border: none;
          font-family: 'Pretendard', sans-serif;
          font-weight: 700;
          font-size: 40px;
          line-height: 1.6;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          box-sizing: border-box;
        }

        .lunch-false-button-secondary {
          background: #e7eaf3;
          color: #595757;
          border: 1px solid #eaecf0;
        }

        .lunch-false-button-secondary:hover {
          background: #dde1ec;
          transform: translateY(-1px);
        }

        .lunch-false-button-primary {
          background: linear-gradient(45deg, #2970ff 0%, #0040c1 100%);
          color: #ffffff;
          border: 1px solid transparent;
        }

        .lunch-false-button-primary:hover {
          background: linear-gradient(45deg, #1e5fff 0%, #0037a8 100%);
          transform: translateY(-1px);
        }

        .lunch-false-button:active {
          transform: translateY(1px);
        }

        /* 확인 모달 스타일 */
        .confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(49, 49, 49, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .confirmation-container {
          position: relative;
          width: 740px;
          height: 475px;
          border-radius: 41px;
          box-shadow: 2px 2px 2px 0px rgba(42, 73, 148, 0.09);
          transform: scale(1);
          transition: transform 0.3s ease;
        }

        .confirmation-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: white;
          border-radius: 50px;
          box-shadow: 2px 2px 2px 0px rgba(0, 79, 153, 0.09);
        }

        .tick-icon {
          position: absolute;
          left: 305px;
          top: 60px;
          width: 130px;
          height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .confirmation-text {
          position: absolute;
          left: 87px;
          top: 265px;
          width: 570px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Pretendard', sans-serif;
          font-weight: 700;
          font-size: 64px;
          line-height: 1.4;
          letter-spacing: -1.6px;
          color: #004f99;
          text-align: center;
        }

        /* 버튼 호버 효과 */
        .btn-container {
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .btn-container:hover {
          transform: translateY(-2px);
        }

        .btn-container:active {
          transform: translateY(0);
        }

        @keyframes lunch-false-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes lunch-false-slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

            <div id="app-viewport">
                <Header />

                {/* 촬영된 이미지 */}
                {capturedImage && (
                    <img
                        id="capturedImg"
                        alt="촬영 이미지"
                        width="798"
                        height="1418"
                        style={{ marginLeft: '141px' }}
                        src={capturedImage}
                    />
                )}

                {/* 버튼 영역 */}
                <div
                    style={{
                        width: '1080px',
                        height: '352px',
                        backgroundColor: 'white',
                        display: 'flex',
                    }}
                >
                    {/* 재촬영 버튼 */}
                    <div
                        className="btn-container"
                        onClick={handleRetake}
                        style={{
                            marginTop: '26px',
                            marginLeft: '31px',
                            marginRight: '24px',
                            width: '300px',
                            height: '320px',
                            background: 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                        }}
                    >
                        <div
                            style={{
                                marginTop: '55px',
                                width: '250px',
                                height: '190px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '36px',
                                display: 'inline-flex',
                            }}
                        >
                            <div style={{ width: '110px', height: '110.84px' }}>
                                <img src="/public/assets/icon/retake.svg" alt="재촬영" />
                            </div>
                            <div
                                style={{
                                    alignSelf: 'stretch',
                                    height: '43px',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    color: '#004F99',
                                    fontSize: '36px',
                                    fontFamily: 'Pretendard',
                                    fontWeight: 600,
                                    lineHeight: '56px',
                                    wordWrap: 'break-word',
                                }}
                            >
                                재촬영
                            </div>
                        </div>
                    </div>

                    {/* 처음화면 버튼 */}
                    <div
                        className="btn-container"
                        onClick={handleHome}
                        style={{
                            marginTop: '26px',
                            marginRight: '24px',
                            width: '300px',
                            height: '320px',
                            background: 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                        }}
                    >
                        <div
                            style={{
                                marginTop: '55px',
                                width: '250px',
                                height: '190px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '36px',
                                display: 'inline-flex',
                            }}
                        >
                            <div style={{ width: '110px', height: '110.84px' }}>
                                <img src="/public/assets/icon/home.svg" alt="홈" />
                            </div>
                            <div
                                style={{
                                    alignSelf: 'stretch',
                                    height: '43px',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    color: '#004F99',
                                    fontSize: '36px',
                                    fontFamily: 'Pretendard',
                                    fontWeight: 600,
                                    lineHeight: '56px',
                                    wordWrap: 'break-word',
                                }}
                            >
                                처음화면
                            </div>
                        </div>
                    </div>

                    {/* 등록 버튼 */}
                    <div
                        className="btn-container"
                        onClick={handleRegister}
                        style={{
                            marginTop: '26px',
                            width: '300px',
                            height: '320px',
                            background: 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                        }}
                    >
                        <div
                            style={{
                                marginTop: '55px',
                                width: '250px',
                                height: '190px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '36px',
                                display: 'inline-flex',
                            }}
                        >
                            <div style={{ width: '110px', height: '110.84px' }}>
                                <img src="/public/assets/icon/toothbrush.svg" alt="양치" />
                            </div>
                            <div
                                style={{
                                    alignSelf: 'stretch',
                                    height: '43px',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    color: '#004F99',
                                    fontSize: '36px',
                                    fontFamily: 'Pretendard',
                                    fontWeight: 600,
                                    lineHeight: '56px',
                                    wordWrap: 'break-word',
                                }}
                            >
                                등록
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 점심시간 확인 모달 */}
            {showLunchModal && (
                <div className="lunch-false-modal-overlay" onClick={closeLunchModal}>
                    <div className="lunch-false-container" onClick={(e) => e.stopPropagation()}>
                        {/* 배경 */}
                        <div className="lunch-false-background"></div>

                        {/* 시계 아이콘 */}
                        <div className="lunch-false-clock-container">
                            <img src="/public/assets/icon/time.svg" alt="시계" />
                        </div>

                        {/* 메인 메시지 */}
                        <div className="lunch-false-main-message">지금은 점심 시간이 아닙니다</div>

                        {/* 보조 메시지 */}
                        <div className="lunch-false-secondary-message">그래도 등록 할까요?</div>

                        {/* 버튼 컨테이너 */}
                        <div className="lunch-false-buttons-container">
                            {/* 아니요 버튼 */}
                            <button
                                className="lunch-false-button lunch-false-button-secondary"
                                onClick={handleLunchModalNo}
                            >
                                아니요
                            </button>

                            {/* 등록 버튼 */}
                            <button
                                className="lunch-false-button lunch-false-button-primary"
                                onClick={handleLunchModalRegister}
                            >
                                등록
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 양치 인증 완료 모달 */}
            {showConfirmationModal && (
                <div className="confirmation-modal" onClick={closeConfirmationModal}>
                    <div className="confirmation-container">
                        <div className="confirmation-background"></div>

                        <div className="tick-icon">
                            <img src="/public/assets/icon/ticktick.svg" alt="완료" />
                        </div>

                        <div className="confirmation-text">양치 인증 완료!</div>
                    </div>
                </div>
            )}

            {/* 테스트용 점심시간 알림창 트리거 버튼 (개발 환경에서만 표시) */}
            {process.env.NODE_ENV === 'development' && (
                <button
                    className="lunch-false-trigger-button"
                    onClick={() => {
                        setShowLunchModal(true)
                        document.body.style.overflow = 'hidden'
                    }}
                >
                    점심시간 확인 알림창 열기 (개발용)
                </button>
            )}
        </div>
    )
}

export default CameraConfirmPage