import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from "../components/Header.tsx";

const CAPTURED_PHOTO_KEY = 'camara.capturedPhoto'

const CameraPage: React.FC = () => {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement>(null)
    const overlayRef = useRef<HTMLImageElement>(null)
    const [currentOverlayIndex, setCurrentOverlayIndex] = useState(0)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const overlayImages = [
        "/public/assets/images/image01.png",
        "/public/assets/images/image02.png"
    ]

    // 비디오가 준비될 때까지 기다리는 함수
    const waitVideoReady = (video: HTMLVideoElement): Promise<void> => {
        if (video.readyState >= 2) return Promise.resolve()
        return new Promise((resolve) => {
            video.addEventListener('loadedmetadata', () => resolve(), { once: true })
        })
    }

    // cover 방식으로 비디오를 캔버스에 맞춰 그리기 위한 소스 크기 계산
    const computeCoverSrcRect = (
        video: HTMLVideoElement,
        targetW: number,
        targetH: number
    ) => {
        const vw = video.videoWidth || targetW
        const vh = video.videoHeight || targetH
        const vr = vw / vh
        const tr = targetW / targetH

        let sw = vw
        let sh = vh
        if (vr > tr) {
            // 비디오가 더 가로로 넓음 => 좌우 크롭
            sh = vh
            sw = Math.round(vh * tr)
        } else {
            // 비디오가 더 세로로 길음 => 상하 크롭
            sw = vw
            sh = Math.round(vw / tr)
        }
        const sx = Math.floor((vw - sw) / 2)
        const sy = Math.floor((vh - sh) / 2)
        return { sx, sy, sw, sh }
    }

    // 카메라 스트림 초기화
    useEffect(() => {
        const initCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: false,
                })
                setStream(mediaStream)

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream
                }
            } catch (error) {
                console.error('카메라 접근 실패:', error)
                alert('카메라 접근에 실패했습니다.')
            }
        }

        initCamera()

        // 컴포넌트 언마운트 시 스트림 정리
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // 사진 촬영 및 저장
    const handleCapture = async () => {
        const video = videoRef.current
        if (!video) {
            alert('비디오 요소를 찾을 수 없습니다.')
            return
        }

        // 비디오가 준비되지 않았다면 스트림을 다시 설정
        if (!video.srcObject && stream) {
            video.srcObject = stream
        }

        await waitVideoReady(video)

        // 캔버스 크기 설정 (798x1418 고정)
        const targetW = 798
        const targetH = 1418

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')!

        // 비디오 프레임을 cover로 채움(왜곡 방지)
        const { sx, sy, sw, sh } = computeCoverSrcRect(video, targetW, targetH)
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH)

        // 오버레이가 보이고 로드되어 있다면 합성
        const overlay = overlayRef.current
        if (
            overlay &&
            overlay.naturalWidth > 0 &&
            !overlay.classList.contains('hidden') &&
            getComputedStyle(overlay).display !== 'none' &&
            getComputedStyle(overlay).visibility !== 'hidden'
        ) {
            // 오버레이를 프리뷰와 동일 스케일로 전체에 덮어 그림
            ctx.drawImage(overlay, 0, 0, targetW, targetH)
        }

        // JPEG 데이터 URL 생성(품질 0.92)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
        try {
            sessionStorage.setItem(CAPTURED_PHOTO_KEY, dataUrl)
        } catch (e) {
            console.warn('세션 스토리지 저장에 실패했습니다. 이미지가 너무 클 수 있습니다.', e)
            alert('이미지 저장에 실패했습니다.')
            return
        }

        // 확인 페이지로 이동
        navigate('/kiosk/camera-confirm')
    }

    // 오버레이 이미지 변경
    const changeOverlay = (direction: 'prev' | 'next') => {
        setCurrentOverlayIndex((prevIndex) => {
            if (direction === 'prev') {
                return prevIndex > 0 ? prevIndex - 1 : overlayImages.length - 1
            } else {
                return prevIndex < overlayImages.length - 1 ? prevIndex + 1 : 0
            }
        })
    }

    // 컴포넌트 스타일
    const ellipseDivStyle: React.CSSProperties = {
        width: '250px',
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.06)',
        borderRadius: '50%',
        backgroundColor: '#004f99',
        border: '1px solid #fff',
        boxSizing: 'border-box',
        height: '250px',
        marginLeft: '415px',
        marginTop: '51px',
    }

    const cameraIconStyle: React.CSSProperties = {
        width: '90px',
        maxWidth: '100%',
        overflow: 'hidden',
        height: '90px',
        margin: '80px',
        cursor: 'pointer'
    }

    return (
        <main className="app">
            {/* 상단 헤더 - 타이틀 주석 처리됨 */}
            <Header />

            {/* 카메라 영역 */}
            <div id="cameraWrap" className="camera-wrap" style={{ position: 'relative' }}>
                <video
                    ref={videoRef}
                    id="video"
                    playsInline
                    autoPlay
                    muted
                />

                {/* 오버레이 이미지 */}
                <img
                    ref={overlayRef}
                    id="overlayImg"
                    className="overlay-img"
                    alt="overlay"
                    src={overlayImages[currentOverlayIndex]}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                        opacity: 1,
                    }}
                />

                {/* 슬라이더 컨트롤(좌) */}
                <button
                    id="ovPrev"
                    type="button"
                    aria-label="이전 오버레이"
                    onClick={() => changeOverlay('prev')}
                    style={{
                        position: 'absolute',
                        left: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px',
                        height: '40px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,.35)',
                        color: '#fff',
                        fontSize: '20px',
                        lineHeight: '40px'
                    }}
                >
                    ⟨
                </button>

                {/* 슬라이더 컨트롤(우) */}
                <button
                    id="ovNext"
                    type="button"
                    aria-label="다음 오버레이"
                    onClick={() => changeOverlay('next')}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '40px',
                        height: '40px',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'rgba(0,0,0,.35)',
                        color: '#fff',
                        fontSize: '20px',
                        lineHeight: '40px'
                    }}
                >
                    ⟩
                </button>

                {/* 현재 인덱스 표시 */}
                <div
                    id="ovIndicator"
                    style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,.35)',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '12px'
                    }}
                >
                    {currentOverlayIndex + 1}/{overlayImages.length}
                </div>
            </div>

            {/* 카메라 버튼 */}
            <div style={{
                width: '1080px',
                height: '353px',
                backgroundColor: '#E5E7EB',
                display: 'flex',
                alignItems: 'flex-start'
            }}>
                <div style={ellipseDivStyle}>
                    <img
                        id="captureBtn"
                        style={cameraIconStyle}
                        src="/public/assets/icon/camera.svg"
                        onClick={handleCapture}
                        alt="촬영 버튼"
                    />
                </div>
            </div>

            <div className="controls"></div>
        </main>
    )
}

export default CameraPage