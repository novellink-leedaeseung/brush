import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UserConfirmPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // 기존 사용자 확인 관련 TypeScript 로직을 React Hook으로 변환
    // API 호출 등의 로직을 여기에 적용할 수 있습니다
  }, [])

  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white', padding: '20px' }}>
      <h1>사용자 확인</h1>
      <p>인식된 사용자 정보를 확인하는 페이지입니다.</p>
      
      <div style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '12px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <h2>인식 결과</h2>
        <p style={{ fontSize: '18px', color: '#666' }}>
          사용자 정보가 여기에 표시됩니다.
        </p>
      </div>

      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '20px 40px',
          fontSize: '24px',
          backgroundColor: '#22C55E',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '40px'
        }}
      >
        완료 - 홈으로
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
        다시 시작
      </button>
    </div>
  )
}

export default UserConfirmPage
