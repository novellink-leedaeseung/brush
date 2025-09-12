/** /src/camara/app.ts
 * - 카메라: 제약 최소(세이프 모드)로 열기
 * - 오버레이: 경로가 틀려도(404/CORS) 카메라 시작은 계속 진행
 * - 캡처 결과 해상도: 798 x 1418 고정 (object-fit: cover 방식 크롭)
 */

const shotBtn = document.getElementById('shotBtn') as HTMLButtonElement;
const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;

const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const preview = document.getElementById('preview') as HTMLImageElement;
const overlayImg = document.getElementById('overlayImg') as HTMLImageElement;

const OUT_W = 798;
const OUT_H = 1418;

// 카메라 자동 시작/정지 유틸
let currentStream: MediaStream | null = null;

async function startCamera(): Promise<void> {
    const videoEl = document.getElementById('video') as HTMLVideoElement | null;
    if (!videoEl) {
        console.warn('[camera] #video 요소를 찾을 수 없습니다.');
        return;
    }

    // iOS/Safari 대응
    videoEl.setAttribute('playsinline', 'true');
    videoEl.setAttribute('autoplay', 'true');
    videoEl.muted = true;

    try {
        // 필요에 따라 facingMode를 'user'로 바꾸세요(전면 카메라)
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {ideal: 'environment'}, // 후면 카메라 우선
            },
            audio: false,
        });

        currentStream = stream;
        videoEl.srcObject = stream;

        // 일부 브라우저에서 play()가 Promise를 반환
        try {
            await videoEl.play();
        } catch (playErr) {
            console.warn('[camera] 자동 재생 실패. 사용자 상호작용이 필요할 수 있습니다.', playErr);
        }
    } catch (err) {
        console.error('[camera] 카메라 초기화 실패:', err);
        // 앱 UI에 안내 메시지를 표시하려면 여기에서 처리하세요.
    }
}

function stopCamera(): void {
    if (currentStream) {
        currentStream.getTracks().forEach((t) => t.stop());
        currentStream = null;
    }
    const videoEl = document.getElementById('video') as HTMLVideoElement | null;
    if (videoEl) {
        videoEl.srcObject = null;
    }
}

// 페이지 로드 시 즉시 카메라 시작
document.addEventListener('DOMContentLoaded', () => {
    void startCamera();
});

// 탭 전환/백그라운드 시 자원 절약(선택)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        stopCamera();
    } else if (document.visibilityState === 'visible') {
        void startCamera();
    }
});

// 페이지 종료 시 카메라 정리
window.addEventListener('pagehide', stopCamera);
window.addEventListener('beforeunload', stopCamera);
/* 이전 스트림 정리 */
/* 오버레이 이미지를 선택적으로(실패 허용) 로드
   - data-overlay-src가 비면 아무 것도 하지 않음
   - 상대경로는 location.origin 기준으로 절대화
   - 로드 실패해도 resolve해서 카메라 진행 막지 않음 */
/* 환경 진단(선택): 문제시 콘솔에서 참고 */
/* getUserMedia 세이프 모드: 제약 최소 → 대부분 환경에서 성공 */
/* 캡처: 결과 이미지는 798x1418로 고정, 비디오는 cover 방식으로 맞춤 */
/*shotBtn.addEventListener('click', () => {
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) {
        console.warn('[capture] video not ready');
        return;
    }

    canvas.width = OUT_W;
    canvas.height = OUT_H;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, OUT_W, OUT_H);

    // object-fit: cover 계산 (소스 크롭 → 대상 가득 채움)
    const scale = Math.max(OUT_W / vw, OUT_H / vh);
    const sw = OUT_W / scale;
    const sh = OUT_H / scale;
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;

    // 1) 비디오 그리기
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, OUT_W, OUT_H);

    // 2) 오버레이가 로드되어 있으면 전체 덮기
    if (!overlayImg.classList.contains('hidden') && overlayImg.complete) {
        try {
            ctx.drawImage(overlayImg, 0, 0, OUT_W, OUT_H);
        } catch (e) {
            console.warn('[overlay] draw failed (CORS/tainted 가능성):', e);
        }
    }

    // 저장/미리보기
    const url = canvas.toDataURL('image/png');
    preview.src = url;
    downloadLink.href = url;
    downloadLink.classList.remove('hidden');
    downloadLink.textContent = '다운로드 (PNG)';
})*/;

/* ===================== Overlay Slider (minimal) ===================== */
(() => {
    function initOverlaySlider() {
        const img = document.getElementById('overlayImg') as HTMLImageElement | null;
        const prevBtn = document.getElementById('ovPrev') as HTMLButtonElement | null;
        const nextBtn = document.getElementById('ovNext') as HTMLButtonElement | null;
        const indicator = document.getElementById('ovIndicator') as HTMLDivElement | null;
        if (!img || !prevBtn || !nextBtn || !indicator) return;

        // 1) 데이터 속성에서 목록/옵션 읽기
        let list: string[] = [];
        try {
            const raw = img.getAttribute('data-overlays') || '[]';
            list = JSON.parse(raw);
        } catch { /* ignore */
        }

        if (!Array.isArray(list) || list.length === 0) {
            // 안전장치: 기존 단일 src만 있었던 경우
            const single = img.getAttribute('data-overlay-src') || img.getAttribute('src');
            if (single) list = [single];
        }

        const fit = (img.getAttribute('data-fit') || 'contain') as 'contain' | 'cover' | 'fill';
        const opacity = Number(img.getAttribute('data-opacity') || '1');
        img.style.objectFit = fit;
        img.style.opacity = String(Math.max(0, Math.min(1, opacity)));

        // 2) 상태
        let idx = 0;
        const len = list.length;

        function update(animate = true) {
            indicator.textContent = `${idx + 1}/${len}`;
            if (!animate) {
                img.src = list[idx];
                return;
            }
            // 간단한 페이드
            img.style.transition = 'opacity .18s ease';
            img.style.opacity = '0';
            const onEnd = () => {
                img.removeEventListener('transitionend', onEnd);
                img.src = list[idx];
                requestAnimationFrame(() => {
                    img.style.opacity = String(opacity);
                });
            };
            img.addEventListener('transitionend', onEnd);
        }

        // 초기 표시
        update(false);

        // 3) 이벤트
        prevBtn.addEventListener('click', () => {
            idx = (idx - 1 + len) % len;
            update(true);
        });
        nextBtn.addEventListener('click', () => {
            idx = (idx + 1) % len;
            update(true);
        });

        // 키보드 ← →
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        });

        // 외부에서 현재 오버레이 src가 필요하면 window로 노출(선택)
        (window as any).__overlaySlider__ = {
            get index() {
                return idx;
            },
            set index(v: number) {
                idx = (v | 0 + len) % len;
                update();
            },
            get list() {
                return list.slice();
            },
            next: () => nextBtn.click(),
            prev: () => prevBtn.click(),
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOverlaySlider, {once: true});
    } else {
        initOverlaySlider();
    }
})();
