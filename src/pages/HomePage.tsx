import React from 'react'
import Header from '../components/Header'
import RankingSection from '../components/RankingSection'
import TouchButton from '../components/TouchButton'
import DebugPanel from '../components/DebugPanel'
import { useNavigate } from 'react-router-dom'
import { useRanking } from '../contexts/RankingContext'

const HomePage: React.FC = () => {
    const navigate = useNavigate()
    const { rankedUsers, currentUserRank, clearAllRecords, isLoading } = useRanking()

    console.log('🏠 HomePage 렌더링:', {
        isLoading,
        rankedUsersCount: rankedUsers.length,
        currentUserRank,
        rankedUsers
    })

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

            {/* 디버그 패널 (개발 모드에서만) */}
            {process.env.NODE_ENV === 'development' && <DebugPanel />}

            {/* 개발자 테스트 버튼들 */}
            {process.env.NODE_ENV === 'development' && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    zIndex: 1000
                }}>
                    <button
                        onClick={() => navigate('/test-registration')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        테스트 등록
                    </button>
                    
                    <div style={{
                        padding: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        whiteSpace: 'nowrap'
                    }}>
                        <div>상태: {isLoading ? '로딩 중' : '완료'}</div>
                        <div>총 기록: {rankedUsers.length}개</div>
                        <div>현재 사용자: {currentUserRank ? `${currentUserRank}위` : '없음'}</div>
                        <div style={{ fontSize: '12px', marginTop: '5px', color: '#CCC' }}>
                            새로고침: F5
                        </div>
                    </div>
                    
                    <button
                        onClick={() => {
                            if (window.confirm('랭킹 데이터를 초기화하시겠습니까?')) {
                                clearAllRecords()
                                window.location.reload()
                            }
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#DC2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        초기화
                    </button>
                    
                    <button
                        onClick={() => {
                            console.log('🔄 강제 새로고침')
                            window.location.reload()
                        }}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#059669',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        새로고침
                    </button>
                </div>
            )}
        </div>
    )
}

export default HomePage
