import React from 'react'
import Header from '../components/Header'
import RankingSection from '../components/RankingSection'
import TouchButton from '../components/TouchButton'
// import DebugPanel from '../components/DebugPanel' // 필요 시 사용
import {useNavigate} from 'react-router-dom'
import {useRanking} from '../contexts/RankingContext'
import TransparentOverlayButton from "../components/home/TransparentOverlayButton.tsx";

const HEADER_H = 150;   // Header 실제 높이(px) 맞춰 조정
const HERO_H = 608;    // 상단 이미지 영역 높이 (현재 코드 기준)
const FOOTER_H = 354;  // TouchButton 영역 예상 높이 (실제 컴포넌트 높이로 맞춰 조정)

const HomePage: React.FC = () => {
    const navigate = useNavigate()
    const {rankedUsers, currentUserRank, clearAllRecords, isLoading} = useRanking()

    console.log('🏠 HomePage 렌더링:', {
        isLoading,
        rankedUsersCount: rankedUsers.length,
        currentUserRank,
        rankedUsers
    })

    return (
        // 전체 화면 고정: 바깥 페이지가 늘어나지 않도록 함
        <div
            style={{
                width: '1080px',
                height: '1920px',
                backgroundColor: 'white',
                display: 'grid',
                gridTemplateRows: `${HEADER_H}px ${HERO_H}px 1fr ${FOOTER_H}px`,
                overflow: 'hidden', // ★ 핵심: 내부에서만 스크롤
                position: 'relative'
            }}
        >
            {/* 영역 전체를 클릭 가능하게 */}
            <TransparentOverlayButton
                onClick={() => navigate('/kiosk/user-find')}
                // width/height 생략 시 기본 1080x500을 덮음
                // 위치 옮기려면 top/left만 지정
                top={880}
                left={0}
            />
            {/* 헤더 (고정) */}
            <div style={{height: HEADER_H}}>
                <Header/>
            </div>

            {/* 상단 이미지 (고정) */}
            <div style={{width: '1080px', height: HERO_H}}>
                <img src="/public/assets/images/home-image.png" alt=""
                     style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
            </div>

            {/* 랭킹(여기만 스크롤) */}
            <div style={{height: '688'}}>
                <RankingSection/>
            </div>

            {/* 하단 터치 버튼 (고정) */}
            <div style={{height: FOOTER_H}}>
                <TouchButton to="/kiosk/user-find"/>
            </div>
        </div>
    )
}

export default HomePage
