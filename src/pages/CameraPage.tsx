import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white' }}>
      {/* 헤더 */}
      <Header />

      {/* 카메라 영역 */}
      <div style={{ 
        width: '1080px', 
        height: '798px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(212, 225, 243, 1) 100%)'
      }}>
        <CameraCapture onCapture={handleCapture} />
      </div>
    </div>
  )
}

export default CameraPage