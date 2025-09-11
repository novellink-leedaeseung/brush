/** /src/camara/app.ts
 * - 카메라: 제약 최소(세이프 모드)로 열기
 * - 오버레이: 경로가 틀려도(404/CORS) 카메라 시작은 계속 진행
 * - 캡처 결과 해상도: 798 x 1418 고정 (object-fit: cover 방식 크롭)
 */

const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const shotBtn = document.getElementById('shotBtn') as HTMLButtonElement;
const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;

const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const preview = document.getElementById('preview') as HTMLImageElement;
const overlayImg = document.getElementById('overlayImg') as HTMLImageElement;

const OUT_W = 798;
const OUT_H = 1418;

let stream: MediaStream | null = null;

/* 이전 스트림 정리 */
function stopStream() {
  const s = video.srcObject as MediaStream | null;
  if (s) s.getTracks().forEach(t => t.stop());
  video.srcObject = null;
}

/* 오버레이 이미지를 선택적으로(실패 허용) 로드
   - data-overlay-src가 비면 아무 것도 하지 않음
   - 상대경로는 location.origin 기준으로 절대화
   - 로드 실패해도 resolve해서 카메라 진행 막지 않음 */
async function initOverlayOptional(): Promise<void> {
  const raw = overlayImg.getAttribute('data-overlay-src')?.trim();
  if (!raw) return;

  const url = /^https?:\/\//i.test(raw) ? raw : new URL(raw, location.origin).href;

  await new Promise<void>((resolve) => {
    overlayImg.onload = () => {
      overlayImg.classList.remove('hidden');
      console.log('[overlay] loaded:', url);
      resolve();
    };
    overlayImg.onerror = (e) => {
      console.warn('[overlay] load failed:', url, e);
      overlayImg.classList.add('hidden'); // 실패 시 숨김 유지
      resolve(); // 실패해도 진행
    };
    overlayImg.src = url;
  });
}

/* 환경 진단(선택): 문제시 콘솔에서 참고 */
async function debugEnv() {
  console.log('[camera] in iframe?', window.top !== window.self);
  console.log('[camera] secureContext:', (window as any).isSecureContext, 'protocol:', location.protocol, 'host:', location.host);
  try {
    const perm = await (navigator.permissions as any)?.query?.({ name: 'camera' as any });
    if (perm) console.log('[camera] permissions.query(camera):', perm.state);
  } catch {}
  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    console.log('[camera] enumerateDevices:', devs);
  } catch (e) {
    console.log('[camera] enumerateDevices failed:', e);
  }
}

/* getUserMedia 세이프 모드: 제약 최소 → 대부분 환경에서 성공 */
async function getSafeStream(): Promise<MediaStream> {
  // 1) 완전 기본
  try {
    return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  } catch (e) {
    console.warn('[camera] std getUserMedia video:true failed', e);
  }
  // 2) 전면 카메라 힌트
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
  } catch (e) {
    console.warn('[camera] std getUserMedia facingMode:user failed', e);
  }
  // 3) 720p 선호(엄격 아님)
  return await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: false
  });
}

/* 시작 버튼 */
startBtn.addEventListener('click', async () => {
  try {
    await initOverlayOptional();  // 실패해도 계속 진행
    stopStream();
    await debugEnv();             // 선택 진단 로그

    stream = await getSafeStream();
    video.srcObject = stream;
    await video.play();

    shotBtn.disabled = false;
  } catch (err: unknown) {
    // 진짜 카메라 오류만 여기서 처리
    const anyErr = err as any;
    const props = anyErr ? Object.getOwnPropertyNames(anyErr) : [];
    const entries: Record<string, any> = {};
    for (const k of props) entries[k] = anyErr[k];

    const isDomEx = typeof DOMException !== 'undefined' && anyErr instanceof DOMException;

    console.group('[camera] getUserMedia error');
    console.log('raw error:', anyErr);
    console.log('typeof:', typeof anyErr);
    console.log('props:', props);
    console.log('entries:', entries);
    console.log('instanceof DOMException:', isDomEx);
    console.groupEnd();

    const name = anyErr?.name ?? 'Unknown';
    const msg  = anyErr?.message ?? (isDomEx ? '(DOMException but no message)' : '(no message)');

    const hints: string[] = [];
    if (window.top !== window.self) hints.push('• 이 페이지가 iframe 안이라면 <iframe allow="camera; microphone"> 가 필요합니다.');
    hints.push('• 서버/프록시의 Permissions-Policy 헤더에 camera=() 가 설정되어 있지 않은지 확인하세요.');
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      hints.push('• HTTPS가 아니면 카메라가 차단될 수 있습니다. (https 또는 http://localhost 권장)');
    }

    alert(`카메라 접근 실패: ${name}\n${msg}\n\n${hints.join('\n')}\n(자세한 내용은 콘솔을 확인해주세요)`);
  }
});

/* 캡처: 결과 이미지는 798x1418로 고정, 비디오는 cover 방식으로 맞춤 */
shotBtn.addEventListener('click', () => {
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
});

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
    } catch { /* ignore */ }

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
      get index() { return idx; },
      set index(v: number) { idx = (v|0 + len) % len; update(); },
      get list() { return list.slice(); },
      next: () => nextBtn.click(),
      prev: () => prevBtn.click(),
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOverlaySlider, { once: true });
  } else {
    initOverlaySlider();
  }
})();
