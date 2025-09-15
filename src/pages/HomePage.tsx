import React from 'react'
import Header from '../components/Header'
import RankingSection from '../components/RankingSection'
import TouchButton from '../components/TouchButton'
import { useNavigate } from 'react-router-dom'

const HomePage: React.FC = () => {
    const navigate = useNavigate()

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

            {/* 개발자 테스트 버튼 */}
            {process.env.NODE_ENV === 'development' && (
                <button
                    onClick={() => navigate('/test-registration')}
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        zIndex: 1000
                    }}
                >
                    테스트 등록
                </button>
            )}
        </div>
    )
}

export default HomePage
