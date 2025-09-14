import React from 'react'

interface RankingUser {
  rank: number
  name: string
  className: string
  time: string
  profileImage: string
  borderColor: string
  mealType: string
}

const RankingSection: React.FC = () => {
  const topThree: RankingUser[] = [
    {
      rank: 1,
      name: '김민준',
      className: '1-2반',
      time: '오후 12:20:10',
      profileImage: '/public/assets/images/man.png',
      borderColor: '#F56358',
      mealType: '점심'
    },
    {
      rank: 2,
      name: '이서연',
      className: '5-1반',
      time: '오후 12:22:50',
      profileImage: '/public/assets/images/woman.png',
      borderColor: '#F46059',
      mealType: '점심'
    },
    {
      rank: 3,
      name: '박하준',
      className: '1-3반',
      time: '오후 12:25:20',
      profileImage: '/public/assets/images/woman.png',
      borderColor: '#F89049',
      mealType: '점심'
    }
  ]

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
            <img src="/public/assets/icon/trophy.svg" alt="트로피" />
          </div>
        </div>
      </div>

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

          return (
            <React.Fragment key={user.rank}>
              {/* 프로필 이미지 */}
              <img
                style={{
                  ...rankStyle,
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
                color: '#111111',
                fontSize: '36px',
                fontFamily: 'Pretendard',
                fontWeight: 600,
                lineHeight: '56px',
                wordWrap: 'break-word'
              }}>
                {user.className} {user.name}
              </div>

              {/* 시간 */}
              <div style={{
                width: '252px',
                height: '43px',
                ...timePos,
                position: 'absolute',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: '#4C4948',
                fontSize: '32px',
                fontFamily: 'Pretendard',
                fontWeight: 400,
                lineHeight: '56px',
                wordWrap: 'break-word'
              }}>
                {user.time}
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
                  {user.mealType}
                </div>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </>
  )
}

export default RankingSection
