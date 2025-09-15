import React from 'react'
import { useRanking } from '../contexts/RankingContext'
import UserListItem from './UserListItem'

const RankingSection: React.FC = () => {
  const { rankedUsers, currentUserRank, getCurrentUserRecord } = useRanking()
  
  // 상위 3명과 나머지 분리
  const topThree = rankedUsers.slice(0, 3)
  const otherUsers = rankedUsers.slice(3)
  const currentUser = getCurrentUserRecord()

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return { width: '240px', height: '240px', top: '15px', left: '420px' }
    } else if (rank === 2) {
      return { width: '204px', height: '204px', top: '51px', left: '52px' }
    } else {
      return { width: '204px', height: '204px', top: '51px', left: '824px' }
    }
  }

  const getRankBadgeStyle = (rank: number) => {
    const baseStyle = {
      position: 'absolute' as const,
      borderRadius: '999px',
      border: '2px white solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Inter',
      fontWeight: 600
    }

    if (rank === 1) {
      return {
        ...baseStyle,
        width: '68px',
        height: '68px',
        left: '590px',
        top: '198px',
        background: 'linear-gradient(180deg, #F4585C 0%, #F89846 100%)',
        fontSize: '32px'
      }
    } else if (rank === 2) {
      return {
        ...baseStyle,
        width: '52px',
        height: '52px',
        left: '202px',
        top: '201px',
        background: '#F56159',
        fontSize: '26px'
      }
    } else {
      return {
        ...baseStyle,
        width: '52px',
        height: '52px',
        left: '974px',
        top: '201px',
        background: '#F89148',
        fontSize: '26px'
      }
    }
  }

  const getNamePosition = (rank: number) => {
    if (rank === 1) {
      return { left: '415px', top: '268px' }
    } else if (rank === 2) {
      return { left: '29px', top: '268px' }
    } else {
      return { left: '801px', top: '268px' }
    }
  }

  const getTimePosition = (rank: number) => {
    if (rank === 1) {
      return { left: '414px', top: '311px' }
    } else if (rank === 2) {
      return { left: '28px', top: '311px' }
    } else {
      return { left: '800px', top: '311px' }
    }
  }

  const getMealTagPosition = (rank: number) => {
    if (rank === 1) {
      return { left: '604px', top: '313px' }
    } else if (rank === 2) {
      return { left: '218px', top: '313px' }
    } else {
      return { left: '990px', top: '313px' }
    }
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

      {/* 현재 사용자 순위 표시 (등록 후) */}
      {currentUser && (
        <div style={{
          width: '1080px',
          height: '100px',
          background: 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            color: 'white',
            fontSize: '42px',
            fontFamily: 'Pretendard',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            🎉 {currentUser.className} {currentUser.name}님의 순위: {currentUser.rank}위 🎉
          </div>
          <div style={{
            position: 'absolute',
            right: '40px',
            color: 'white',
            fontSize: '28px',
            fontFamily: 'Pretendard',
            fontWeight: 500
          }}>
            완료시간: {formatTime(currentUser.brushingTime)}
          </div>
        </div>
      )}

      {/* 상위 3명 랭킹 */}
      <div style={{
        width: '1080px',
        height: '368px',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '0.50px #B4B4B5 solid'
      }}>
        {topThree.map((user) => {
          const rankStyle = getRankStyle(user.rank)
          const rankBadgeStyle = getRankBadgeStyle(user.rank)
          const namePos = getNamePosition(user.rank)
          const timePos = getTimePosition(user.rank)
          const mealPos = getMealTagPosition(user.rank)
          
          // 현재 사용자 하이라이트
          const isCurrentUser = currentUserRank === user.rank
          const highlightStyle = isCurrentUser ? {
            boxShadow: '0 0 0 6px #22C55E',
            animation: 'pulse 2s infinite'
          } : {}

          return (
            <React.Fragment key={user.id}>
              {/* 프로필 이미지 */}
              <img
                style={{
                  ...rankStyle,
                  ...highlightStyle,
                  position: 'absolute',
                  borderRadius: '99px',
                  border: `3px ${user.borderColor} solid`
                }}
                src={user.profileImage}
                alt={user.name}
              />

              {/* 랭킹 배지 */}
              <div style={rankBadgeStyle}>
                {user.rank}
              </div>

              {/* 이름 */}
              <div style={{
                width: '250px',
                height: '43px',
                ...namePos,
                position: 'absolute',
                textAlign: 'center',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: isCurrentUser ? '#22C55E' : '#111111',
                fontSize: '36px',
                fontFamily: 'Pretendard',
                fontWeight: isCurrentUser ? 700 : 600,
                lineHeight: '56px',
                wordWrap: 'break-word'
              }}>
                {user.className} {user.name}
                {isCurrentUser && <span style={{ fontSize: '24px' }}>👑</span>}
              </div>

              {/* 시간 (1초 단위까지 표시) */}
              <div style={{
                width: '252px',
                height: '43px',
                ...timePos,
                position: 'absolute',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: isCurrentUser ? '#16A34A' : '#4C4948',
                fontSize: '32px',
                fontFamily: 'Pretendard',
                fontWeight: isCurrentUser ? 600 : 400,
                lineHeight: '56px',
                wordWrap: 'break-word'
              }}>
                {formatTime(user.brushingTime)}
              </div>

              {/* 식사 태그 */}
              <div style={{
                width: '50px',
                height: '40px',
                ...mealPos,
                position: 'absolute',
                background: '#B2D7FF',
                borderRadius: '8px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                display: 'inline-flex'
              }}>
                <div style={{
                  width: '35px',
                  height: '18px',
                  textAlign: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  color: '#227EFF',
                  fontSize: '16px',
                  fontFamily: 'Pretendard',
                  fontWeight: 600,
                  lineHeight: '6px',
                  wordWrap: 'break-word'
                }}>
                  {user.mealType === 'lunch' ? '점심' : '외'}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>

      {/* 4등 이하 사용자 리스트 */}
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
