import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from '@/components/Header'
import CameraCapture from '@/components/CameraCapture'
import HomeComponent from "@/components/HomeComponent.tsx";

const CameraPage: React.FC = () => {
    const navigate = useNavigate()
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [isDisabled, setIsDisabled] = useState(false)  // 🔥 버튼 비활성화 상태 추가

    const handleCapture = (imageData: string) => {
        if (capturedImage == undefined) setCapturedImage(imageData)
        sessionStorage.setItem('capturedImage', imageData)
        navigate('/kiosk/camera-confirm')
    }

    const handleButtonClick = () => {
        if (isDisabled) return   // 🔥 이미 비활성화면 무시

        setIsDisabled(true)      // 🔥 비활성화 시작
        const event = new CustomEvent('capture-photo')
        window.dispatchEvent(event)

        // 필요 시 일정 시간 후 다시 활성화 (예: 3초)
        setTimeout(() => setIsDisabled(false), 3000)
    }

    return (
        <div style={{
            width: '1080px',
            height: '1920px',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #D4E1F3 100%)'
        }}>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>

            <Header/>
            <HomeComponent onClick={undefined}/>

            <CameraCapture onCapture={handleCapture}/>

            {/* 카메라 버튼 */}
            <div style={{
                borderTop: '0.5px solid rgb(76, 73, 72)',
                outlineOffset: '-0.25px',
                width: '1080px',
                height: '352px',
                background: 'white',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 10,
            }}>
                <div
                    style={{
                        width: '250px',
                        height: '250px',
                        background: isDisabled ? '#ccc' : '#004F99', // 🔥 비활성화 시 색상 변경
                        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.06)',
                        borderRadius: 9999,
                        border: '1px white solid',
                        marginLeft: '415px',
                        marginTop: '50px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.6 : 1, // 🔥 흐리게 표시
                    }}
                    onClick={handleButtonClick}
                >
                    <img
                        style={{ margin: '80px' }}
                        src="/public/assets/icon/camera.svg"
                        alt=""
                    />
                </div>
            </div>
        </div>
    )
}

export default CameraPage
