import React from 'react'
import Header from '../components/Header'
import RankingSection from '../components/RankingSection'
import UserListItem from '../components/UserListItem'
import TouchButton from '../components/TouchButton'

const HomePage: React.FC = () => {
  return (
    <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white' }}>
      {/* 헤더 */}
      <Header />

      {/* 녹색 섹션 (현재는 빈 공간) */}
      <div style={{ width: '1080px', height: '608px', background: '#22C55E' }}></div>

      {/* 랭킹 섹션 */}
      <RankingSection />

      {/* 4등, 5등 사용자 리스트 */}
      <UserListItem
        rank={4}
        name="최지우"
        className="2-2반"
        time="오후 12:30:42"
        profileImage="/public/assets/images/woman.png"
        mealType="lunch"
      />

      <UserListItem
        rank={5}
        name="정서윤"
        className="3-1반"
        time="오후 13:30:45"
        profileImage="/public/assets/images/woman.png"
        mealType="outside"
        isLast={true}
      />

      {/* 터치 버튼 */}
      <TouchButton to="/kiosk/user-find" />
    </div>
  )
}

export default HomePage
