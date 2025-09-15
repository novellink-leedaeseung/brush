import React from 'react'
import Header from '../components/Header'
import RankingSection from '../components/RankingSection'
import TouchButton from '../components/TouchButton'

const HomePage: React.FC = () => {
    return (
        <div style={{ width: '1080px', height: '1920px', backgroundColor: 'white' }}>
            {/* 헤더 */}
            <Header />

            {/* 녹색 섹션 (현재는 빈 공간) */}
            <div style={{ width: '1080px', height: '608px', background: '#22C55E' }}></div>

            {/* 랭킹 섹션 - 이제 1~5등까지 모두 포함 */}
            <RankingSection />

            {/* 터치 버튼 */}
            <TouchButton to="/kiosk/user-find" />
        </div>
    )
}

export default HomePage