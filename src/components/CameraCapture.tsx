import React, {useEffect, useRef, useState} from 'react'

interface CameraCaptureProps {
    onCapture?: (imageData: string) => void
    overlayImages?: string[]
    outputWidth?: number
    outputHeight?: number
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
                                                         onCapture,
                                                         overlayImages = [
                                                             "/assets/images/image01.png",
                                                             "/assets/images/image02.png"
                                                         ],
                                                         outputWidth = 798,
                                                         outputHeight = 1418
                                                     }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const overlayRef = useRef<HTMLImageElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    const [currentOverlayIndex, setCurrentOverlayIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const startCamera = async () => {
        const video = videoRef.current
        if (!video) return

        try {
            setIsLoading(true)
            setError(null)

            // 먼저 권한 확인
            const permissionStatus = await navigator.permissions.query({name: 'camera' as any})
            console.log('Camera permission:', permissionStatus.state)

            // iOS/Safari 대응
            video.setAttribute('playsinline', 'true')
            video.setAttribute('autoplay', 'true')
            video.muted = true

            // 기존 스트림이 있다면 정리
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop())
            }

            // 카메라 스트림 요청 - 더 호환성 높은 설정
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: {ideal: 'environment'}, // 후면 카메라 우선
                    width: {ideal: 1920},
                    height: {ideal: 1080}
                },
                audio: false,
            }

            console.log('Requesting camera with constraints:', constraints)
            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            console.log('Camera stream obtained:', stream.getVideoTracks().map(track => ({
                label: track.label,
                settings: track.getSettings()
            })))

            streamRef.current = stream
            video.srcObject = stream

            // 비디오 메타데이터 로드 대기
            await new Promise((resolve, reject) => {
                video.onloadedmetadata = resolve
                video.onerror = reject
                setTimeout(reject, 10000) // 10초 타임아웃
            })

            // 비디오 재생
            await video.play()
            console.log('Video playing successfully')
            setIsLoading(false)
        } catch (err: any) {
            console.error('[camera] 카메라 초기화 실패:', err)
            let errorMessage = '카메라를 시작할 수 없습니다. '

            if (err.name === 'NotAllowedError') {
                errorMessage += '카메라 권한을 허용해주세요.'
            } else if (err.name === 'NotFoundError') {
                errorMessage += '카메라를 찾을 수 없습니다.'
            } else if (err.name === 'NotReadableError') {
                errorMessage += '카메라가 다른 앱에서 사용 중입니다.'
            } else {
                errorMessage += '브라우저가 카메라를 지원하지 않거나 오류가 발생했습니다.'
            }

            setError(errorMessage)
            setIsLoading(false)
        }
    }

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null
        }
    }

    const captureImage = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        const overlay = overlayRef.current

        if (!video || !canvas) return

        const vw = video.videoWidth
        const vh = video.videoHeight

        if (!vw || !vh) {
            console.warn('[capture] video not ready')
            return
        }

        canvas.width = outputWidth
        canvas.height = outputHeight

        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, outputWidth, outputHeight)

        // object-fit: cover 계산 (소스 크롭 → 대상 가득 채움)
        const scale = Math.max(outputWidth / vw, outputHeight / vh)
        const sw = outputWidth / scale
        const sh = outputHeight / scale
        const sx = (vw - sw) / 2
        const sy = (vh - sh) / 2

        // 1) 비디오 그리기
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight)

        // 2) 오버레이가 로드되어 있으면 전체 덮기
        if (overlay && overlay.complete && !overlay.classList.contains('hidden')) {
            try {
                ctx.drawImage(overlay, 0, 0, outputWidth, outputHeight)
            } catch (e) {
                console.warn('[overlay] draw failed (CORS/tainted 가능성):', e)
            }
        }

        // 저장/미리보기
        const imageData = canvas.toDataURL('image/png')
        onCapture?.(imageData)
    }

    const previousOverlay = () => {
        setCurrentOverlayIndex((prev) => (prev - 1 + overlayImages.length) % overlayImages.length)
    }

    const nextOverlay = () => {
        setCurrentOverlayIndex((prev) => (prev + 1) % overlayImages.length)
    }

    // 키보드 이벤트 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') previousOverlay()
            if (e.key === 'ArrowRight') nextOverlay()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // 페이지 가시성 변경 시 카메라 제어
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                stopCamera()
            } else if (document.visibilityState === 'visible') {
                startCamera()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    // 컴포넌트 마운트 시 카메라 시작
    useEffect(() => {
        // getUserMedia 폴리필
        if (!navigator.mediaDevices) {
            (navigator as any).mediaDevices = {}
        }

        if (!navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia = function (constraints) {
                const getUserMedia = (navigator as any).getUserMedia ||
                    (navigator as any).webkitGetUserMedia ||
                    (navigator as any).mozGetUserMedia

                if (!getUserMedia) {
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
                }

                return new Promise((resolve, reject) => {
                    getUserMedia.call(navigator, constraints, resolve, reject)
                })
            }
        }

        startCamera()

        // 외부 카메라 버튼 클릭 이벤트 리스너 추가
        const handleCaptureEvent = () => {
            captureImage();
        };
        
        window.addEventListener('capture-photo', handleCaptureEvent);

        // 클린업
        return () => {
            stopCamera()
            window.removeEventListener('capture-photo', handleCaptureEvent);
        }
    }, [])

    return (
        <div style={{
            width: '798px',
            height: '1418px',
            backgroundColor: '#000',
            overflow: 'hidden',
            marginLeft: '141px',
            marginTop: '0px',
            position: 'relative'
        }}>
            {/* 로딩 및 에러 메시지 */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    zIndex: 10,
                    textAlign: 'center'
                }}>
                    카메라 준비중...
                </div>
            )}

            {error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(255,0,0,0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    zIndex: 10,
                    maxWidth: '90%'
                }}>
                    {error}
                </div>
            )}

            {/* 비디오 엘리먼트 */}
            <video
                ref={videoRef}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#000'
                }}
                playsinline
                autoPlay
                muted
                playsInline
            />

            {/* 오버레이 이미지 (비디오 위에 표시) */}
            <img
                ref={overlayRef}
                src={overlayImages[currentOverlayIndex]}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    // opacity: 0.7,
                    pointerEvents: 'none',
                    zIndex: 5
                }}
                alt="overlay"
                onLoad={() => console.log('Overlay loaded:', overlayImages[currentOverlayIndex])}
                onError={() => console.warn('Overlay failed to load:', overlayImages[currentOverlayIndex])}
            />

            {/* 오버레이 전환 버튼들 */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '10px',
                zIndex: 10
            }}>
                <button
                    onClick={previousOverlay}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ←
                </button>
                <button
                    onClick={nextOverlay}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    →
                </button>
            </div>

            {/* 오버레이 인디케이터 */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '20px',
                fontSize: '16px',
                fontFamily: 'Pretendard',
                zIndex: 10
            }}>
                {currentOverlayIndex + 1} / {overlayImages.length}
            </div>

            {/* 캔버스 (숨겨진 상태) */}
            <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
            />
        </div>
    )
}

export default CameraCapture