import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface RegistrationButtonProps {
  studentData?: {
    name: string
    className: string
    profileImage: string
  }
  mealType?: 'lunch' | 'outside'
  brushingDuration?: number
}

const RegistrationButton: React.FC<RegistrationButtonProps> = ({
  studentData = {
    name: '테스트 학생',
    className: '1-1반',
    profileImage: '/assets/images/man.png'
  },
  mealType = 'lunch',
  brushingDuration = 120
}) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async () => {
    setIsLoading(true)
    
    // 등록 처리 시뮬레이션 (실제로는 API 호출)
    try {
      // 잠시 로딩 효과
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 등록 완료 페이지로 이동하면서 데이터 전달
      navigate('/registration-complete', {
        state: {
          name: studentData.name,
          className: studentData.className,
          profileImage: studentData.profileImage,
          mealType,
          brushingDuration
        }
      })
    } catch (error) {
      console.error('등록 실패:', error)
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000
    }}>
      <button
        onClick={handleRegister}
        disabled={isLoading}
        style={{
          width: '400px',
          height: '120px',
          background: isLoading 
            ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
            : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          border: 'none',
          borderRadius: '60px',
          color: 'white',
          fontSize: '48px',
          fontFamily: 'Pretendard',
          fontWeight: 700,
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px'
        }}
        onMouseDown={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateX(-50%) scale(0.95)'
          }
        }}
        onMouseUp={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.transform = 'translateX(-50%) scale(1)'
          }
        }}
      >
        {isLoading ? (
          <>
            <div style={{
              width: '36px',
              height: '36px',
              border: '4px solid rgba(255, 255, 255, 0.3)',
              borderTop: '4px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            등록 중...
          </>
        ) : (
          <>
            ✓ 등록하기
          </>
        )}
      </button>

      {/* 로딩 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default RegistrationButton
