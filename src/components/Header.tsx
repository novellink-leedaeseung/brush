import React from 'react'

interface HeaderProps {
  title?: string
  date?: string
  time?: string
}

const Header: React.FC<HeaderProps> = ({ 
  title = "스마트 건강관리",
  date = "2024-07-05", 
  time = "오후 01:15" 
}) => {
  return (
    <div style={{
      width: '1080px',
      height: '150px',
      background: '#214882',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'Pretendard, system-ui, -apple-system, Noto Sans KR, sans-serif',
      color: '#FFFFFF'
    }}>
      {/* 왼쪽 로고 영역 */}
      <img src="/public/assets/icon/logo.png" width="154" height="113" alt="로고" />

      {/* 중앙 타이틀 */}
      <div style={{
        color: 'white',
        fontSize: '60px',
        fontFamily: 'Jalnan2',
        fontWeight: 400,
        wordWrap: 'break-word'
      }}>
        {title}
      </div>

      {/* 오른쪽 날짜/시간 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginRight: '32px'
      }}>
        <div className="font-family-pretendard" style={{
          fontSize: '36px',
          fontWeight: 'normal',
          color: 'white'
        }}>
          {date}
        </div>
        <div className="font-family-pretendard" style={{
          fontSize: '36px',
          fontWeight: 'normal',
          color: 'white'
        }}>
          {time}
        </div>
      </div>
    </div>
  )
}

export default Header
