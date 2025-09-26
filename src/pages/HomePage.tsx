import React, {useState, useEffect, useRef} from 'react';
import Header from '@/components/Header';
import RankingSection from '@/components/RankingSection';
import TouchButton from '@/components/TouchButton';
import TransparentOverlayButton from '@/components/home/TransparentOverlayButton.tsx';
import HeroSlider from '@/components/home/HeroSlider.tsx';
import '@/index.css';
import ExitConfirmationModal from '@/components/home/modal/ExitConfirmationModal.tsx';
import TransparentHitArea from "@/components/home/TransparentHitArea.tsx";
import { logButtonClick } from '@/utils/ipcLogger';

const HEADER_H = 150;  // Header 실제 높이(px) 맞춰 조정
const HERO_H = 608;    // 상단 이미지 영역 높이
const FOOTER_H = 354;  // TouchButton 영역 높이

const HomePage: React.FC = () => {

  // ✅ 모달 상태 (컴포넌트 내부)
  const [showModal, setShowModal] = useState(false);

  // ✅ 4-탭 로직 상태/타이머 (컴포넌트 내부)
  const [overlayTapCount, setOverlayTapCount] = useState(0);
  const overlayDebounceRef = useRef<number | null>(null); // 1~3회 탭 후 이동 디바운스(300ms)
  const overlayWindowRef = useRef<number | null>(null);   // 4회 누르기 위한 윈도우(기본 3초)

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (overlayDebounceRef.current) clearTimeout(overlayDebounceRef.current);
      if (overlayWindowRef.current) clearTimeout(overlayWindowRef.current);
    };
  }, []);

// ✅ 모달 오픈
    const openExitModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setOverlayTapCount(0);
    };

    // ✅ 투명 오버레이 버튼 4-탭 핸들러
    const handleOverlayPress = (event: React.MouseEvent<HTMLButtonElement>) => {
        const currentPath = typeof window !== 'undefined'
            ? (window.location?.hash || window.location?.pathname || null)
            : null;

        logButtonClick({
            buttonId: 'transparent-overlay',
            path: currentPath,
            text: 'overlay tap',
        });
        console.log('[TransparentOverlay] manual log recorded', { path: currentPath });

        const buttonEl = event.currentTarget;
        buttonEl.dataset.logManualReported = 'true';
        setTimeout(() => {
            delete buttonEl.dataset.logManualReported;
        }, 0);
        // 3초 윈도우(4번 모으기) 시작/연장
        if (overlayWindowRef.current) {
            clearTimeout(overlayWindowRef.current);
            overlayWindowRef.current = null;
        }
        overlayWindowRef.current = window.setTimeout(() => {
            setOverlayTapCount(0);        // 시간 지나면 카운트 초기화
            overlayWindowRef.current = null;
        }, 3000);


        setOverlayTapCount((prev) => {
            const next = prev + 1;

            // ✅ 임계치(2회) 도달 → 타이머 정리 + 모달 오픈
            if (next >= 2) {
                if (overlayWindowRef.current) {
                    clearTimeout(overlayWindowRef.current);
                    overlayWindowRef.current = null;
                }
                if (overlayDebounceRef.current) {
                    clearTimeout(overlayDebounceRef.current);
                    overlayDebounceRef.current = null;
                }
                // 1초 뒤 팝업 (원래 코드 유지)
                setTimeout(() => openExitModal(), 1000);
                return 0;  // 리셋
            }

            return next; // 1~3회 상태 유지
        });
    };

    return (
        // 전체 화면 고정: 바깥 페이지가 늘어나지 않도록 함
        <div
            style={{
                width: '1080px',
                height: '1920px',
                backgroundColor: 'white',
                display: 'grid',
                gridTemplateRows: `${HEADER_H}px ${HERO_H}px 1fr ${FOOTER_H}px`,
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* ✅ 오버레이 버튼: 이제 4-탭 로직으로 동작 */}
            <TransparentOverlayButton
                onClick={handleOverlayPress}
            />

            {/* 헤더 (고정) */}
            <div style={{height: HEADER_H}}>
                <Header/>
            </div>


            {/* 상단 이미지 (고정) */}
            <HeroSlider/>

            {/* 랭킹(여기만 스크롤) */}
            <div style={{height: 688}}>
                <RankingSection/>
            </div>

            <TransparentHitArea top={890}/>

            {/* 양치왕 까지 투명 버튼 영역*/}

            {/* 하단 터치 버튼 (고정) */}
            <div style={{height: FOOTER_H}}>
                <TouchButton to="/kiosk/user-find"/>
            </div>

            {/* 종료 확인 모달 */}
            <ExitConfirmationModal
                isOpen={showModal}
                onClose={handleCloseModal}
                autoShow={false}
            />
        </div>
    );
};

export default HomePage;
