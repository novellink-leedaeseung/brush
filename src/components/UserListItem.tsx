import React from 'react'

interface UserListItemProps {
  rank: number
  name: string
  className: string
  time: string
  profileImage: string
  mealType: 'lunch' | 'outside'
  isLast?: boolean
}

const UserListItem: React.FC<UserListItemProps> = ({
  rank,
  name,
  className,
  time,
  profileImage,
  mealType,
  isLast = false
}) => {
  const mealTypeStyle = mealType === 'lunch' 
    ? { background: '#B2D7FF', color: '#227EFF', text: '점심' }
    : { background: '#FEEAE2', color: '#E5621C', text: '외' }

  return (
    <div style={{
      width: '1080px',
      height: '150px',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: isLast ? '0.50px #F3F4F6 solid' : 'none',
      outline: isLast ? '0.50px #F3F4F6 solid' : 'none',
      outlineOffset: isLast ? '-0.50px' : 'none'
    }}>
      {/* 랭킹 번호 */}
      <div style={{
        left: '52px',
        top: '47px',
        position: 'absolute',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        color: '#111111',
        fontSize: '32px',
        fontFamily: 'Inter',
        fontWeight: 600,
        lineHeight: '56px',
        wordWrap: 'break-word'
      }}>
        {rank}
      </div>

      {/* 프로필 이미지 */}
      <img style={{
        width: '86px',
        height: '86px',
        left: rank === 4 ? '106px' : '105px',
        top: '32px',
        position: 'absolute',
        borderRadius: '999px'
      }} src={profileImage} alt={name} />

      {/* 사용자 정보 */}
      <div style={{
        width: '110px',
        left: '224px',
        top: '32px',
        position: 'absolute',
        background: 'white',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        display: 'inline-flex'
      }}>
        <div style={{
          alignSelf: 'stretch',
          height: '43px',
          textAlign: 'center',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: '#111111',
          fontSize: '32px',
          fontFamily: 'Pretendard',
          fontWeight: 600,
          lineHeight: '56px',
          wordWrap: 'break-word'
        }}>
          {name}
        </div>
        <div style={{
          alignSelf: 'stretch',
          height: '43px',
          textAlign: 'center',
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
          {className}
        </div>
      </div>

      {/* 식사 태그 */}
      <div style={{
        width: '80px',
        height: '50px',
        left: '366px',
        top: '50px',
        position: 'absolute',
        background: mealTypeStyle.background,
        borderRadius: '16px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        display: 'inline-flex'
      }}>
        <div style={{
          width: '35px',
          height: '18px',
          justifyContent: 'center',
          display: 'flex',
          flexDirection: 'column',
          color: mealTypeStyle.color,
          fontSize: '20px',
          fontFamily: 'Pretendard',
          fontWeight: 600,
          lineHeight: '6px',
          wordWrap: 'break-word'
        }}>
          {mealTypeStyle.text}
        </div>
      </div>

      {/* 시간 */}
      <div style={{
        width: '218px',
        height: '44px',
        left: '830px',
        top: '53px',
        position: 'absolute',
        textAlign: 'right',
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
        {time}
      </div>
    </div>
  )
}

export default UserListItem
