import React, {useEffect, useState, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from "../components/Header.tsx"

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
            zIndex: 2000,
            padding: '20px'
        }}>
            <div style={{
                width: '740px',
                height: '475px',
                maxWidth: '90vw',
                maxHeight: '80vh',
                background: '#FFFFFF',
                borderRadius: '50px',
                boxShadow: '2px 2px 2px 0px rgba(42, 73, 148, 0.09), 2px 2px 2px 0px rgba(0, 79, 153, 0.09)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* 체크 아이콘 */}
                <div style={{
                    marginTop: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <img src="/public/assets/icon/ticktick.svg" alt="완료" style={{
                        width: '130px',
                        height: '130px',
                        objectFit: 'contain'
                    }}/>
                </div>

                {/* 완료 메시지 */}
                <div style={{
                    width: '570px',
                    height: '90px',
                    marginTop: '75px',
                }}><h1 style={{
                    marginTop: '75px',
                    fontFamily: 'Pretendard, Arial, sans-serif',
                    fontWeight: 700,
                    fontSize: '64px',
                    lineHeight: '1.4em',
                    letterSpacing: '-2.5%',
                    textAlign: 'center',
                    color: '#004F99',
                    margin: 0,
                    padding: 0
                }}>
                    양치 인증 완료!
                </h1></div>
            </div>
        </div>
    );
};

const CameraConfirmPage: React.FC = () => {
    const navigate = useNavigate()
    const [capturedImage, setCapturedImage] = useState<string>('')
    const [showLunchModal, setShowLunchModal] = useState(false)
    const [showCompleteModal, setShowCompleteModal] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    /**
     * 서버에 이미지를 저장하는 함수
     * @param {string} imageDataUrl - Base64 형태의 이미지 데이터
     * @param {Object} userInfo - 사용자 정보 객체 (선택사항)
     * @returns {Promise<Object>} - 서버 응답 결과
     */
    const saveImageToServer = async (imageDataUrl: string, userInfo = {}) => {
        try {
            // ============ 파일명 생성 부분 (수정 가능) ============
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            const seconds = String(today.getSeconds()).padStart(2, '0');

            // 사용자 정보에서 파일명에 포함할 데이터 추출
            const phoneNumber = localStorage.getItem("phone") || "unknown";
            const userName = localStorage.getItem("name") || "user";

            // 파일명 형식: YYYY-MM-DD-HH-MM-SS-전화번호-이름
            // 필요에 따라 이 부분을 수정하세요
            const fileName = `${year}${month}${day}-${hours}-${minutes}-${seconds}-${phoneNumber}-${userName}`;

            // 또는 다른 형식 예시들:
            // const fileName = `photo_${year}${month}${day}_${phoneNumber}`;
            // const fileName = `${userName}_${year}-${month}-${day}_${Date.now()}`;
            // const fileName = `student_photo_${phoneNumber}_${year}${month}${day}${hours}${minutes}`;
            // ====================================================

            console.log('📸 이미지 저장 시작:', fileName);

            // 서버 API 호출
            const response = await fetch('/api/save-photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageData: imageDataUrl,
                    fileName: fileName
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('✅ 이미지 저장 성공:', result);
                return {
                    success: true,
                    message: result.message,
                    fileName: result.fileName,
                    filePath: result.filePath,
                    timestamp: result.timestamp
                };
            } else {
                console.error('❌ 서버 응답 오류:', result);
                throw new Error(result.error || '이미지 저장에 실패했습니다.');
            }

        } catch (error) {
            console.error('❌ 이미지 저장 실패:', error);
            throw error;
        }
    };

    /**
     * 등록 버튼 클릭 시 이미지 서버 저장 처리
     */
    const handleImageSave = async () => {
        try {
            setIsUploading(true);

            // 캡처된 이미지 데이터 가져오기
            const possibleKeys = ['capturedImage', 'camara.capturedPhoto', 'captured-photo'];
            let imageDataUrl = null;

            for (const key of possibleKeys) {
                imageDataUrl = sessionStorage.getItem(key);
                if (imageDataUrl) {
                    console.log(`이미지를 찾았습니다. 키: ${key}`);
                    break;
                }
            }

            if (!imageDataUrl) {
                alert('저장할 이미지가 없습니다. 다시 촬영해주세요.');
                return false;
            }

            // 서버에 이미지 저장
            const result = await saveImageToServer(imageDataUrl);

            console.log(`✅ 서버 저장 성공: ${result.fileName}`);

            return true;

        } catch (error) {
            console.error('❌ 이미지 저장 실패:', error);
            alert(`이미지 저장 실패: ${error.message}`);
            return false;
        } finally {
            setIsUploading(false);
        }
    };

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
    const handleRegister = async () => {
        if (isUploading) return;

        // 로컬스토리지 값 불러오기
        const name = localStorage.getItem("name") || "익명";
        const phone = localStorage.getItem("phone") || "";
        const gradeClass = localStorage.getItem("gradeClass") || "";
        let gender = localStorage.getItem("gender") || "";
        gender = gender === "M" ? "남자" : "여자";


        try {
            setIsUploading(true);

            // 1. 이미지 서버 저장
            const saveSuccess = await handleImageSave();
            if (!saveSuccess) return;


            // 2. 학생 데이터 API 호출
            const response = await fetch("http://localhost:3001/api/members", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name,
                    phone,
                    gradeClass,
                    gender,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log("✅ 학생 데이터 전송 성공:", result);

            // 3. 완료 모달 표시
            setShowCompleteModal(true);
            setTimeout(() => {
                setShowCompleteModal(false);
                // 세션스토리지 정리
                const keys = ["capturedImage", "camara.capturedPhoto", "captured-photo"];
                keys.forEach((k) => sessionStorage.removeItem(k));
                window.location.replace("/");
            }, 2000);
        } catch (err) {
            console.error("❌ 등록 실패:", err);
            alert("등록 실패: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };


    // 점심시간 모달 - 아니요 클릭
    const handleLunchModalNo = () => {
        setShowLunchModal(false)
        document.body.style.overflow = 'auto'
    }

    // 점심시간 모달 - 등록 클릭
    const handleLunchModalRegister = async () => {
        const userName = localStorage.getItem("name") || "익명 사용자"
        const studentData = {
            name: userName,
            className: '1-1반',
            profileImage: '/assets/images/man.png'
        }

        // 점심시간 모달 닫기
        setShowLunchModal(false)
        document.body.style.overflow = 'auto'

        // 이미지 서버 저장 먼저 실행
        const saveSuccess = await handleImageSave();

        if (saveSuccess) {
            // 완료 모달 표시
            setShowCompleteModal(true)

            // 2초 후 홈으로 이동
            setTimeout(() => {
                setShowCompleteModal(false)
                // 세션 스토리지 정리
                const possibleKeys = ['capturedImage', 'camara.capturedPhoto', 'captured-photo'];
                possibleKeys.forEach(key => sessionStorage.removeItem(key));
                navigate('/')
            }, 2000)
        }
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
        // 세션 스토리지 정리
        const possibleKeys = ['capturedImage', 'camara.capturedPhoto', 'captured-photo'];
        possibleKeys.forEach(key => sessionStorage.removeItem(key));
        navigate('/')
    }

    return (
        <div style={{backgroundColor: '#f5f5f5', minHeight: '100vh'}}>
            {/* 스타일 정의 */}
            <style>{`
        /* 로딩 스피너 애니메이션 */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

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
                            background: isUploading ? '#cccccc' : 'white',
                            boxShadow: '2px 2px 2px rgba(0, 0, 0, 0.16)',
                            borderRadius: '32px',
                            cursor: isUploading ? 'not-allowed' : 'pointer',
                            opacity: isUploading ? 0.7 : 1,
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
                                {isUploading ? (
                                    <div style={{
                                        width: '110px',
                                        height: '110px',
                                        border: '8px solid #f3f3f3',
                                        borderTop: '8px solid #004F99',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                ) : (
                                    <img src="/public/assets/icon/toothbrush.svg" alt="양치"/>
                                )}
                            </div>
                            <div
                                style={{
                                    alignSelf: 'stretch',
                                    height: '43px',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    color: isUploading ? '#999999' : '#004F99',
                                    fontSize: '36px',
                                    fontFamily: 'Pretendard',
                                    fontWeight: 600,
                                    lineHeight: '56px',
                                    wordWrap: 'break-word',
                                }}
                            >
                                {isUploading ? '저장 중...' : '등록'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 양치 인증 완료 모달 */}
            <CompleteModal
                isVisible={showCompleteModal}
                onClose={handleCompleteModalClose}
            />
        </div>
    )
}

export default CameraConfirmPage