import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import CameraCapture from '../components/CameraCapture'

const CameraPage: React.FC = () => {
    const navigate = useNavigate()
    const [capturedImage, setCapturedImage] = useState<string | null>(null)

    const handleCapture = (imageData: string) => {
        setCapturedImage(imageData)
        // 캡처된 이미지를 세션 스토리지에 저장하고 확인 페이지로 이동
        sessionStorage.setItem('capturedImage', imageData)
        navigate('/kiosk/camera-confirm')
    }

    return (
        <div style={{
            width: '1080px',
            height: '1920px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #D4E1F3 100%)'
        }}>
            {/* 헤더 */}
            <Header/>

            {/* 카메라 컴포넌트 */}
            <CameraCapture onCapture={handleCapture}/>

            {/* 카메라 영역 텍스트 */}
            <div style={{
                width: '469px',
                height: '116px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '305px',
                marginTop: '-650px',
                zIndex: 10
            }}>
                <span style={{
                    fontFamily: 'Inter, Arial, sans-serif',
                    fontWeight: '400',
                    fontSize: '96px',
                    lineHeight: '1.21em',
                    textAlign: 'left',
                    color: '#FFFFFF',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                }}>
                    카메라 영역
                </span>
            </div>

            {/* 카메라 버튼 */}
            <div 
                onClick={() => {
                    // CameraCapture 컴포넌트의 captureImage 함수를 호출하기 위한 이벤트 발생
                    const event = new CustomEvent('capture-photo');
                    window.dispatchEvent(event);
                }}
                style={{
                    width: '250px',
                    height: '250px',
                    background: '#004F99',
                    borderRadius: '50%',
                    border: '1px solid #FFFFFF',
                    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginLeft: '415px',
                    marginTop: '100px',
                    zIndex: 20
                }}
            >
                {/* 카메라 아이콘 */}
                <div style={{
                    width: '90px',
                    height: '90px',
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '75px',
                        height: '67.5px',
                        background: '#004F99',
                        borderRadius: '8px',
                        position: 'relative'
                    }}>
                        {/* 카메라 렌즈 */}
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '30px',
                            height: '30px',
                            border: '3px solid #FFFFFF',
                            borderRadius: '50%'
                        }} />
                        {/* 카메라 플래시 */}
                        <div style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            width: '8px',
                            height: '8px',
                            background: '#FFFFFF',
                            borderRadius: '2px'
                        }} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CameraPage