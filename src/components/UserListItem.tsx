import React from 'react'

interface UserListItemProps {
  rank: number
  name: string
  className: string
  time: string
  profileImage: string
  mealType: 'lunch' | 'outside'
  isLast?: boolean
  isCurrentUser?: boolean
}

const UserListItem: React.FC<UserListItemProps> = ({
  rank,
  name,
  className,
  time,
  profileImage,
  mealType,
  isLast = false,
  isCurrentUser = false
}) => {
  return (
    <div style={{
      width: '1080px',
      height: '140px',
      position: 'relative',
      background: isCurrentUser ? 'linear-gradient(90deg, #F0FDF4 0%, #DCFCE7 100%)' : 'white',
      borderBottom: isLast ? 'none' : '0.50px #B4B4B5 solid',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: '60px',
      paddingRight: '60px',
      boxSizing: 'border-box'
    }}>
      {/* 순위 */}
      <div style={{
        width: '80px',
        textAlign: 'center',
        color: isCurrentUser ? '#16A34A' : '#111111',
        fontSize: '48px',
        fontFamily: 'Pretendard',
        fontWeight: isCurrentUser ? 700 : 600,
        lineHeight: '56px'
      }}>
        {rank}
        {isCurrentUser && <span style={{ fontSize: '24px', marginLeft: '8px' }}>👑</span>}
      </div>

      {/* 프로필 이미지 */}
      <img
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50px',
          border: isCurrentUser ? '3px #22C55E solid' : '2px #E5E5E5 solid',
          marginLeft: '40px',
          marginRight: '40px'
        }}
        src={profileImage}
        alt={name}
      />

      {/* 이름과 반 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{
          color: isCurrentUser ? '#16A34A' : '#111111',
          fontSize: '36px',
          fontFamily: 'Pretendard',
          fontWeight: isCurrentUser ? 700 : 600,
          lineHeight: '42px'
        }}>
          {className} {name}
        </div>
      </div>

      {/* 시간 */}
      <div style={{
        color: isCurrentUser ? '#16A34A' : '#4C4948',
        fontSize: '32px',
        fontFamily: 'Pretendard',
        fontWeight: isCurrentUser ? 600 : 400,
        lineHeight: '56px',
        marginRight: '40px'
      }}>
        {time}
      </div>

      {/* 식사 태그 */}
      <div style={{
        width: '50px',
        height: '40px',
        background: '#B2D7FF',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: '#227EFF',
          fontSize: '16px',
          fontFamily: 'Pretendard',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          {mealType === 'lunch' ? '점심' : '외'}
        </div>
      </div>
    </div>
  )
}

export default UserListItem
