import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CameraPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 기존 카메라 관련 TypeScript 로직을 React Hook으로 변환
    // src/camara/app.ts의 로직을 여기에 적용할 수 있습니다
  }, [])

  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white', padding: '20px' }}>
      <h1>카메라</h1>
      <p>카메라 페이지입니다.</p>
      
      <button 
        onClick={() => navigate('/kiosk/camera-confirm')}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          backgroundColor: '#214882',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        확인으로 이동
      </button>

      <button 
        onClick={() => navigate('/kiosk/user-find')}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px',
          marginLeft: '20px'
        }}
      >
        뒤로가기
      </button>
    </div>
  )
}

export default CameraPage
