import React from 'react'
import { useRanking } from '../contexts/RankingContext'
import UserListItem from './UserListItem'

const RankingSection: React.FC = () => {
  const { rankedUsers, currentUserRank, getCurrentUserRecord, isLoading } = useRanking()
  
  console.log('🔄 RankingSection 렌더링:', {
    isLoading,
    rankedUsersCount: rankedUsers.length,
    currentUserRank
  })
  
  // 로딩 중일 때
  if (isLoading) {
    return (
      <div style={{
        width: '1080px',
        height: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: 'white'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          border: '8px solid #E5E7EB',
          borderTop: '8px solid #22C55E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{
          fontSize: '36px',
          fontFamily: 'Pretendard',
          fontWeight: 500,
          color: '#6B7280'
        }}>
          랭킹 데이터를 불러오는 중...
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
  
  // 데이터가 없을 때
  if (!rankedUsers || rankedUsers.length === 0) {
    return (
      <div style={{
        width: '1080px',
        height: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: 'white'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          📊
        </div>
        <div style={{
          fontSize: '36px',
          fontFamily: 'Pretendard',
          fontWeight: 600,
          color: '#111111',
          textAlign: 'center'
        }}>
          아직 등록된 기록이 없습니다
        </div>
        <div style={{
          fontSize: '28px',
          fontFamily: 'Pretendard',
          fontWeight: 400,
          color: '#6B7280',
          textAlign: 'center'
        }}>
          첫 번째 양치왕이 되어보세요!
        </div>
      </div>
    )
  }

  // 상위 3명과 나머지 분리
    const otherUsers = rankedUsers.slice(0)

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }
    return (
    <>
      {/* 오늘의 양치왕 헤더 */}
      <div style={{ width: '1080px', height: '120px', position: 'relative', background: 'white', overflow: 'hidden' }}>
        <div style={{
          left: '425px',
          top: '32px',
          position: 'absolute',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '18px',
          display: 'inline-flex'
        }}>
          <div style={{
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            color: '#111111',
            fontSize: '40px',
            fontFamily: 'Pretendard',
            fontWeight: 600,
            lineHeight: '56px',
            wordWrap: 'break-word'
          }}>
            오늘의 양치왕
          </div>
          <div style={{ width: '52px', height: '52px', position: 'relative', overflow: 'hidden' }}>
            <img src="/assets/icon/trophy.svg" alt="트로피" />
          </div>
        </div>
      </div>

      {/* 사용자 리스트 */}
      {otherUsers.map((user, index) => (
        <UserListItem
          key={user.id}
          rank={user.rank}
          name={user.name}
          className={user.className}
          time={formatTime(user.brushingTime)}
          profileImage={user.profileImage}
          mealType={user.mealType}
          isLast={index === otherUsers.length - 1}
          isCurrentUser={currentUserRank === user.rank}
        />
      ))}

      {/* 펄스 애니메이션 CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.3);
          }
        }
      `}</style>
    </>
  )
}

export default RankingSection
