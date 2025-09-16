import React, {useEffect, useState, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from "../components/Header.tsx"
import RegistrationButton from '../components/RegistrationButton'

// 양치 인증 완료 모달 컴포넌트
const CompleteModal = ({isVisible, onClose}: { isVisible: boolean; onClose: () => void }) => {
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
            zIndex: 2000
        }}>
            <div style={{
                width: '740px',
                height: '475px',
                background: '#FFFFFF',
                borderRadius: '50px',
                boxShadow: '2px 2px 2px 0px rgba(42, 73, 148, 0.09), 2px 2px 2px 0px rgba(0, 79, 153, 0.09)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0'
            }}>
                {/* 체크 아이콘 */}
                <div style={{
                    marginBottom: '75px'
                }}>
                    <img src="/public/assets/icon/ticktick.svg" alt="완료" style={{
                        width: '130px',
                        height: '130px',
                        objectFit: 'contain'
                    }}/>
                </div>

                {/* 완료 메시지 */}
                <h1 style={{
                    fontFamily: 'Pretendard, Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: '64px',
                    lineHeight: '1.4em',
                    letterSpacing: '-2.5%',
                    textAlign: 'center',
                    color: '#004F99',
                    margin: 0
                }}>
                    양치 인증 완료!
                </h1>
            </div>
        </div>
    );
};

const CameraConfirmPage: React.FC = () => {
    const navigate = useNavigate()
    const [capturedImage, setCapturedImage] = useState<string>('')
    const [showLunchModal, setShowLunchModal] = useState(false)
    const [showCompleteModal, setShowCompleteModal] = useState(false)

    // 컴포넌트가 마운트될 때 저장된 이미지 불러오기
    useEffect(() => {
        // 여러 가능한 키 이름으로 시도
        const possibleKeys = ['capturedImage', 'camara.capturedPhoto', 'captured-photo']

        let savedImage = null
        for (const key of possibleKeys) {
            savedImage = sessionStorage.getItem(key)
            if (savedImage) {
                console.log(`이미지를 찾았습니다. 키: ${key}`)
                setCapturedImage(savedImage)
                break
            }
        }

        if (!savedImage) {
            console.log('세션 스토리지에서 이미지를 찾을 수 없습니다.')
            // 세션 스토리지의 모든 키를 출력해서 디버깅
            console.log('세션 스토리지의 모든 키들:', Object.keys(sessionStorage))
        }
    }, [])

    // 이미지가 없을 때 placeholder 표시를 위한 디버깅
    useEffect(() => {
        console.log('현재 capturedImage 상태:', capturedImage ? '이미지 있음' : '이미지 없음')
    }, [capturedImage])

    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowLunchModal(false)
                document.body.style.overflow = 'auto'
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    // 이미지 다운로드 함수
    const downloadImage = () => {
        const possibleKeys = ['capturedImage', 'camara.capturedPhoto', 'captured-photo']
        let imageData = null

        // 세션 스토리지에서 이미지 데이터 찾기
        for (const key of possibleKeys) {
            imageData = sessionStorage.getItem(key)
            if (imageData) {
                console.log(`다운로드할 이미지 키: ${key}`)
                break
            }
        }

        if (!imageData) {
            console.error('다운로드할 이미지가 없습니다.')
            alert('저장된 이미지가 없습니다.')
            return
        }

        try {
            // 현재 날짜/시간으로 파일명 생성
            const now = new Date()
            const dateStr = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_')
            let name = localStorage.getItem("name");
            let phone = localStorage.getItem("phone");
            const fileName = `${dateStr}-${phone}-${name}.jpg`

            // 가상의 다운로드 링크 생성
            const link = document.createElement('a')
            link.href = imageData
            link.download = fileName
            link.style.display = 'none'

            // DOM에 추가하고 클릭한 후 제거
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log(`이미지 다운로드 완료: ${fileName}`)

        } catch (error) {
            console.error('이미지 다운로드 실패:', error)
            alert('이미지 다운로드에 실패했습니다.')
        }
    }

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
        // 사용자 데이터 준비
        const userName = localStorage.getItem("name") || "익명 사용자"
        const userPhone = localStorage.getItem("phone") || ""
        const studentData = {
            name: userName,
            className: '1-1반', // 실제로는 사용자 정보에서 가져와야 함
            profileImage: '/assets/images/man.png' // 실제로는 성별이나 사용자 정보에 따라 결정
        }
        if (!isLunchTime()) {
            setShowLunchModal(true)
            document.body.style.overflow = 'hidden'
        } else {
            // 점심시간이면 바로 등록 완료 페이지로 이동
            /*navigate('/registration-complete', {
                state: {
                    name: studentData.name,
                    className: studentData.className,
                    profileImage: studentData.profileImage,
                    mealType,
                    brushingDuration
                }
            })*/
        }
    }

    // 점심시간 모달 - 아니요 클릭
    const handleLunchModalNo = () => {
        setShowLunchModal(false)
        document.body.style.overflow = 'auto'
    }

    // 점심시간 모달 - 등록 클릭
    const handleLunchModalRegister = () => {
        const userName = localStorage.getItem("name") || "익명 사용자"
        const studentData = {
            name: userName,
            className: '1-1반',
            profileImage: '/assets/images/man.png'
        }
        // 점심시간 모달 닫기
        setShowLunchModal(false)
        document.body.style.overflow = 'auto'

        // 완료 모달 표시
        setShowCompleteModal(true)

        /*// 2초 후 홈으로 이동
        setTimeout(() => {
            setShowCompleteModal(false)
            sessionStorage.removeItem('capturedImage')
            navigate('/')
        }, 2000)*/
    }

    // 점심시간 모달 닫기
    const closeLunchModal = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            setShowLunchModal(false)
            document.body.style.overflow = 'auto'
        }
    }

    // 완료 모달 닫기
    const handleCompleteModalClose = () => {
        setShowCompleteModal(false)
        sessionStorage.removeItem('capturedImage')
        navigate('/')
    }

    return (
        <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
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

        /* 이미지 플레이스홀더 스타일 */
        .image-placeholder {
          width: 798px;
          height: 1418px;
          margin-left: 141px;
          background: linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%);
          background-size: 20px 20px;
          border: 2px dashed #ccc;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #666;
          font-size: 24px;
          font-weight: 600;
          text-align: center;
        }

        /* 테스트 다운로드 버튼 스타일 */
        .test-download-button {
          display: block;
          margin: 20px auto;
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .test-download-button:hover {
          background: #218838;
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
                <Header/>

                {/* 촬영된 이미지 또는 플레이스홀더 */}
                {capturedImage ? (
                    <img
                        id="capturedImg"
                        alt="촬영 이미지"
                        width="798"
                        height="1418"
                        style={{marginLeft: '141px'}}
                        src={capturedImage}
                        onError={(e) => {
                            console.error('이미지 로드 실패:', e)
                            setCapturedImage('') // 이미지 로드 실패시 플레이스홀더 표시
                        }}
                    />
                ) : (
                    <div className="image-placeholder">
                        <div>📷</div>
                        <div style={{marginTop: '20px'}}>촬영된 이미지가 없습니다</div>
                        <div style={{fontSize: '18px', marginTop: '10px', color: '#999'}}>
                            카메라에서 사진을 촬영해주세요
                        </div>
                        <button
                            onClick={handleRetake}
                            style={{
                                marginTop: '30px',
                                padding: '15px 30px',
                                backgroundColor: '#004f99',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '18px',
                                cursor: 'pointer'
                            }}
                        >
                            카메라로 이동
                        </button>
                    </div>
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
                            width: '320px',
                            height: '300px',
                            background: 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                        }}
                    >
                        <div
                            style={{
                                marginTop: '55px',
                                marginLeft: '40px',
                                width: '250px',
                                height: '190px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '36px',
                                display: 'inline-flex',
                            }}
                        >
                            <div style={{width: '110px', height: '110.84px'}}>
                                <img src="/public/assets/icon/retake.svg" alt="재촬영"/>
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
                            marginLeft: '31px',
                            marginRight: '24px',
                            width: '320px',
                            height: '300px',
                            background: 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                        }}
                    >
                        <div
                            style={{
                                marginTop: '55px',
                                marginLeft: '40px',
                                width: '250px',
                                height: '190px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '36px',
                                display: 'inline-flex',
                            }}
                        >
                            <div style={{width: '110px', height: '110.84px'}}>
                                <img src="/public/assets/icon/home.svg" alt="홈"/>

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
                            marginLeft: '31px',
                            marginRight: '24px',
                            width: '320px',
                            height: '300px',
                            background: 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                        }}
                    >
                        <div
                            style={{
                                marginTop: '55px',
                                marginLeft: '35px',
                                width: '250px',
                                height: '190px',
                                flexDirection: 'column',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '36px',
                                display: 'inline-flex',
                            }}
                        >
                            <div style={{width: '110px', height: '110.84px'}}>
                                <img src="/public/assets/icon/toothbrush.svg" alt="양치"/>


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
                            <img src="/public/assets/icon/time.svg" alt="시계"/>
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

            {/* 개발용 테스트 버튼들 */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{textAlign: 'center', padding: '20px'}}>
                    <button
                        className="lunch-false-trigger-button"
                        onClick={() => {
                            setShowLunchModal(true)
                            document.body.style.overflow = 'hidden'
                        }}
                    >
                        점심시간 확인 알림창 열기 (개발용)
                    </button>

                    <button
                        className="test-download-button"
                        onClick={downloadImage}
                    >
                        이미지 다운로드 테스트
                    </button>
                </div>
            )}

            {/* 양치 인증 완료 모달 */}
            <CompleteModal
                isVisible={showCompleteModal}
                onClose={handleCompleteModalClose}
            />
        </div>
    )
}

export default CameraConfirmPage