// src/camera/capture.ts
const CAPTURED_PHOTO_KEY = 'camara.capturedPhoto';

function getEl<T extends Element>(sel: string) {
  return document.querySelector(sel) as T | null;
}

function waitVideoReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve) => {
    video.addEventListener('loadedmetadata', () => resolve(), { once: true });
  });
}

// cover 방식으로 비디오를 캔버스에 맞춰 그리기 위한 소스 크기 계산
function computeCoverSrcRect(
  video: HTMLVideoElement,
  targetW: number,
  targetH: number
) {
  const vw = video.videoWidth || targetW;
  const vh = video.videoHeight || targetH;
  const vr = vw / vh;
  const tr = targetW / targetH;

  let sw = vw;
  let sh = vh;
  if (vr > tr) {
    // 비디오가 더 가로로 넓음 => 좌우 크롭
    sh = vh;
    sw = Math.round(vh * tr);
  } else {
    // 비디오가 더 세로로 길음 => 상하 크롭
    sw = vw;
    sh = Math.round(vw / tr);
  }
  const sx = Math.floor((vw - sw) / 2);
  const sy = Math.floor((vh - sh) / 2);
  return { sx, sy, sw, sh };
}

async function captureAndGo() {
  const video = getEl<HTMLVideoElement>('video');
  if (!video) {
    alert('비디오 요소를 찾을 수 없습니다.');
    return;
  }

  // 비디오가 준비되지 않았다면 가능한 경우 스트림을 붙여줌(옵셔널)
  if (!video.srcObject) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      video.srcObject = stream;
    } catch (e) {
      console.error(e);
      alert('카메라 접근에 실패했습니다.');
      return;
    }
  }

  await waitVideoReady(video);

  // 프리뷰 컨테이너 크기에 맞춰 결과물 사이즈 결정 (없으면 비디오 원본 크기)
  const container = document.querySelector('.camera-wrap') as HTMLElement | null;
  const targetW = container?.clientWidth || video.videoWidth || 798;
  const targetH = container?.clientHeight || video.videoHeight || 1418;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d')!;

  // 비디오 프레임을 cover로 채움(왜곡 방지)
  const { sx, sy, sw, sh } = computeCoverSrcRect(video, targetW, targetH);
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);

  // 오버레이가 보이고 로드되어 있다면 합성
  const overlay = document.getElementById('overlayImg') as HTMLImageElement | null;
  if (
    overlay &&
    overlay.naturalWidth > 0 &&
    !overlay.classList.contains('hidden') &&
    getComputedStyle(overlay).display !== 'none' &&
    getComputedStyle(overlay).visibility !== 'hidden'
  ) {
    // 오버레이를 프리뷰와 동일 스케일로 전체에 덮어 그림
    ctx.drawImage(overlay, 0, 0, targetW, targetH);
  }

  // JPEG 데이터 URL 생성(품질 0.92)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  try {
    sessionStorage.setItem(CAPTURED_PHOTO_KEY, dataUrl);
  } catch (e) {
    console.warn('세션 스토리지 저장에 실패했습니다. 이미지가 너무 클 수 있습니다.', e);
    alert('이미지 저장에 실패했습니다.');
    return;
  }

  // 확인 페이지로 이동
  location.href = '/kiosk/camara-confirm.html';
}

function main() {
  const btn = document.getElementById('captureBtn') as HTMLButtonElement | null;
  if (btn) btn.addEventListener('click', captureAndGo);
}

document.addEventListener('DOMContentLoaded', main);
