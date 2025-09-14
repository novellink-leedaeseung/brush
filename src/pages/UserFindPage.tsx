import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UserFindPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 기존 TypeScript 로직을 React Hook으로 변환
    // 여기에 사용자 찾기 관련 로직을 추가할 수 있습니다
  }, [])

  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white', padding: '20px' }}>
      <h1>사용자 찾기</h1>
      <p>사용자 찾기 페이지입니다.</p>
      
      <button 
        onClick={() => navigate('/kiosk/camera')}
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
        카메라로 이동
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
        홈으로 돌아가기
      </button>
    </div>
  )
}

export default UserFindPage
