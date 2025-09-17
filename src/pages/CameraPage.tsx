import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import CameraCapture from '../components/CameraCapture'
import HomeComponent from "../components/HomeComponent.tsx";

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
            <HomeComponent right={0} bottom={0} onClick={undefined}/>


            {/* 카메라 컴포넌트 */}
            <CameraCapture onCapture={handleCapture}/>

            {/* 카메라 버튼 */}
            <div style={{
                width: '1080px',
                height: '352px',
                background: 'white',
                overflow: 'hidden',
            }}>
                <div style={{
                    width: '250px',
                    height: '250px',
                    background: '#004F99',
                    boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.06)',
                    borderRadius: 9999,
                    border: '1px white solid',
                    marginLeft: '415px',
                    marginTop: '50px',
                }}>
                    <div
                        onClick={() => {
                            // CameraCapture 컴포넌트의 captureImage 함수를 호출하기 위한 이벤트 발생
                            const event = new CustomEvent('capture-photo');
                            window.dispatchEvent(event);
                        }}>
                        <img style={{
                            margin: '80px'
                        }} src="/public/assets/icon/camera.svg" alt=""/>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CameraPage