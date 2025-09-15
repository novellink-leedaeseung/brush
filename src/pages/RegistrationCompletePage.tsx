import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRanking } from '../contexts/RankingContext'
import Header from '../components/Header'

interface RegistrationData {
  name: string
  className: string
  profileImage: string
  mealType: 'lunch' | 'outside'
  brushingDuration: number
}

const RegistrationCompletePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { addRecord, getCurrentUserRecord, currentUserRank } = useRanking()
  const [countdown, setCountdown] = useState(5)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  
  // URL에서 등록 데이터 가져오기 (실제로는 이전 페이지에서 전달받음)
  const registrationData: RegistrationData = location.state || {
    name: '새로운 학생',
    className: '1-1반',
    profileImage: '/assets/images/man.png',
    mealType: 'lunch',
    brushingDuration: 120
  }

  console.log('📝 RegistrationCompletePage 렌더링:', {
    registrationData,
    isRegistered,
    currentUserRank,
    countdown
  })

  // 등록 처리
  useEffect(() => {
    if (!isRegistered) {
      console.log('➕ 양치 기록 등록 시작:', registrationData)
      
      // 양치 기록 등록
      addRecord({
        name: registrationData.name,
        className: registrationData.className,
        profileImage: registrationData.profileImage,
        brushingTime: new Date(), // 현재 시간 (1초 단위 정밀도)
        mealType: registrationData.mealType,
        duration: registrationData.brushingDuration
      })
      
      setIsRegistered(true)
      console.log('✅ 양치 기록 등록 완료')
    }
  }, [addRecord, registrationData, isRegistered])

  // 카운트다운 타이머
  useEffect(() => {
    if (!isRegistered || isNavigating) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        console.log('⏰ 카운트다운:', prev - 1)
        
        if (prev <= 1) {
          console.log('🏠 홈으로 자동 이동')
          setIsNavigating(true)
          
          // replace: true를 사용하여 히스토리 스택에서 현재 페이지 제거
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 100)
          
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [navigate, isRegistered, isNavigating])

  const handleGoHome = () => {
    if (isNavigating) return
    
    console.log('🏠 수동으로 홈으로 이동')
    setIsNavigating(true)
    navigate('/', { replace: true })
  }

  const currentUser = getCurrentUserRecord()
  const now = new Date()
  const formattedTime = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })

  const getRankDisplay = () => {
    if (!currentUserRank) return '순위 계산 중...'
    
    if (currentUserRank === 1) return '🥇 1위'
    if (currentUserRank === 2) return '🥈 2위'
    if (currentUserRank === 3) return '🥉 3위'
    return `${currentUserRank}위`
  }

  const getRankMessage = () => {
    if (!currentUserRank) return '잠시만 기다려주세요'
    
    if (currentUserRank === 1) return '축하합니다! 오늘의 양치왕입니다!'
    if (currentUserRank <= 3) return '훌륭합니다! 상위권에 진입했어요!'
    if (currentUserRank <= 10) return '좋은 기록이에요! 계속 도전하세요!'
    return '양치 완료! 내일은 더 빨리 도전해보세요!'
  }

  // 네비게이션 중일 때 로딩 표시
  if (isNavigating) {
    return (
      <div style={{ 
        width: '1080px', 
        height: '1920px', 
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          border: '10px solid #E5E7EB',
          borderTop: '10px solid #22C55E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          fontSize: '42px',
          fontFamily: 'Pretendard',
          fontWeight: 600,
          color: '#6B7280'
        }}>
          홈으로 이동 중...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white' }}>
      {/* 헤더 */}
      <Header title="양치 등록 완료" />

      <div style={{
        width: '100%',
        height: 'calc(100% - 150px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 60px',
        boxSizing: 'border-box'
      }}>
        {/* 완료 아이콘 */}
        <div style={{
          width: '200px',
          height: '200px',
          borderRadius: '100px',
          background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '60px',
          animation: 'bounceIn 0.8s ease-out'
        }}>
          <div style={{
            color: 'white',
            fontSize: '120px',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
        </div>

        {/* 등록 완료 메시지 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <div style={{
            color: '#111111',
            fontSize: '56px',
            fontFamily: 'Pretendard',
            fontWeight: 700,
            marginBottom: '20px'
          }}>
            양치 등록 완료!
          </div>
          <div style={{
            color: '#16A34A',
            fontSize: '42px',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            marginBottom: '40px'
          }}>
            {registrationData.className} {registrationData.name}님
          </div>
          <div style={{
            color: '#4C4948',
            fontSize: '36px',
            fontFamily: 'Pretendard',
            fontWeight: 400
          }}>
            완료 시간: {formattedTime}
          </div>
        </div>

        {/* 순위 결과 */}
        <div style={{
          width: '800px',
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          borderRadius: '32px',
          border: '3px #22C55E solid',
          padding: '60px',
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <div style={{
            color: '#16A34A',
            fontSize: '72px',
            fontFamily: 'Pretendard',
            fontWeight: 800,
            marginBottom: '20px'
          }}>
            {getRankDisplay()}
          </div>
          <div style={{
            color: '#111111',
            fontSize: '40px',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            lineHeight: '56px'
          }}>
            {getRankMessage()}
          </div>
          
          {currentUser && (
            <div style={{
              marginTop: '40px',
              padding: '30px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '20px'
            }}>
              <div style={{
                color: '#16A34A',
                fontSize: '32px',
                fontFamily: 'Pretendard',
                fontWeight: 600,
                marginBottom: '10px'
              }}>
                양치 소요 시간: {Math.floor(currentUser.duration / 60)}분 {currentUser.duration % 60}초
              </div>
              <div style={{
                color: '#4C4948',
                fontSize: '28px',
                fontFamily: 'Pretendard',
                fontWeight: 400
              }}>
                {currentUser.mealType === 'lunch' ? '점심시간' : '외부식사'} 양치
              </div>
            </div>
          )}
        </div>

        {/* 카운트다운 */}
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            color: '#6B7280',
            fontSize: '32px',
            fontFamily: 'Pretendard',
            fontWeight: 500,
            marginBottom: '20px'
          }}>
            {countdown}초 후 메인 화면으로 이동합니다
          </div>
          <button
            onClick={handleGoHome}
            disabled={isNavigating}
            style={{
              background: isNavigating 
                ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
              border: 'none',
              borderRadius: '20px',
              padding: '20px 60px',
              color: 'white',
              fontSize: '36px',
              fontFamily: 'Pretendard',
              fontWeight: 600,
              cursor: isNavigating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: isNavigating ? 0.7 : 1
            }}
            onMouseDown={(e) => {
              if (!isNavigating) {
                e.currentTarget.style.transform = 'scale(0.95)'
              }
            }}
            onMouseUp={(e) => {
              if (!isNavigating) {
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isNavigating) {
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {isNavigating ? '이동 중...' : '지금 확인하기'}
          </button>
        </div>
      </div>

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default RegistrationCompletePage
