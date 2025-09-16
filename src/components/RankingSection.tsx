import React, { useMemo } from 'react'
import { useRanking } from '../contexts/RankingContext'
import UserListItem from './UserListItem'

const RankingSection: React.FC = () => {
  const {
    rankedUsers,
    currentUserRank,
    isLoading,
    page,
    totalPages,
    setPage,
  } = useRanking()

  console.log('🔄 RankingSection 렌더링:', {
    isLoading,
    rankedUsersCount: rankedUsers.length,
    currentUserRank,
    page,
    totalPages,
  })

  // 로딩 중
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

  // 포맷 안전 처리: Date | string 모두 수용
  const formatTime = (dt: Date | string): string => {
    const date = dt instanceof Date ? dt : new Date(dt)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const otherUsers = useMemo(() => rankedUsers.slice(0, 5), [rankedUsers])

  return (
    <>
      {/* 오늘의 양치왕 헤더 + 페이지 표시 */}
      <div style={{ width: '1080px', height: '120px', position: 'relative', background: 'white', overflow: 'hidden' }}>
        <div style={{
          left: '425px',
          top: '24px',
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

        {/* 페이지 네비게이션 (우상단) */}
        <div style={{
          position: 'absolute',
          right: 24,
          top: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: page <= 1 ? '#F3F4F6' : 'white',
              cursor: page <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            이전
          </button>
          <span style={{ fontFamily: 'Pretendard', color: '#6B7280' }}>
            {page}{totalPages ? ` / ${totalPages}` : ''}
          </span>
          <button
            onClick={() => setPage(totalPages ? Math.min(totalPages, page + 1) : page + 1)}
            disabled={!!totalPages && page >= totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: (!!totalPages && page >= totalPages) ? '#F3F4F6' : 'white',
              cursor: (!!totalPages && page >= totalPages) ? 'not-allowed' : 'pointer'
            }}
          >
            다음
          </button>
        </div>
      </div>

      {/* 빈 상태 */}
      {otherUsers.length === 0 ? (
        <div style={{
          width: '1080px',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontFamily: 'Pretendard',
          fontSize: 24,
          background: 'white',
          borderTop: '1px solid #F3F4F6'
        }}>
          데이터가 없습니다.
        </div>
      ) : (
        // 사용자 리스트
        otherUsers.map((user, index) => (
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
        ))
      )}

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
