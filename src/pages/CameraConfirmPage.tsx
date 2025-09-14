import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CameraConfirmPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 기존 카메라 확인 관련 TypeScript 로직을 React Hook으로 변환
    // src/camara/confirm.ts의 로직을 여기에 적용할 수 있습니다
  }, [])

  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white', padding: '20px' }}>
      <h1>카메라 확인</h1>
      <p>촬영된 이미지를 확인하는 페이지입니다.</p>
      
      <button 
        onClick={() => navigate('/kiosk/user-confirm')}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          backgroundColor: '#22C55E',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        사용자 확인으로
      </button>

      <button 
        onClick={() => navigate('/kiosk/camera')}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          backgroundColor: '#F56358',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px',
          marginLeft: '20px'
        }}
      >
        다시 촬영
      </button>

      <button 
        onClick={() => navigate('/')}
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
        홈으로
      </button>
    </div>
  )
}

export default CameraConfirmPage
