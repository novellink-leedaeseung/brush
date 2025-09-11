const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const shotBtn = document.getElementById('shotBtn') as HTMLButtonElement;
const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;

const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const preview = document.getElementById('preview') as HTMLImageElement;

const cameraWrap = document.getElementById('cameraWrap') as HTMLDivElement;
const frameProbe = document.getElementById('frameProbe') as HTMLDivElement;

let stream: MediaStream | null = null;

startBtn.addEventListener('click', async () => {
  try {
    // 16:9를 선호하는 기본 해상도 요청 (필요에 따라 변경)
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    video.srcObject = stream;
    await video.play();

    shotBtn.disabled = false;
  } catch (err) {
    console.error(err);
    alert('카메라 접근에 실패했습니다. 브라우저 권한/HTTPS를 확인해주세요.');
  }
});

/**
 * object-fit: cover 로 표시된 비디오에서
 * 컨테이너 내 특정 프레임(frameProbe) 영역만 "원본 비디오 픽셀 좌표"로 변환해 잘라냄.
 */
shotBtn.addEventListener('click', () => {
  if (!video.videoWidth || !video.videoHeight) {
    alert('비디오가 아직 초기화되지 않았습니다.');
    return;
  }

  const containerRect = cameraWrap.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect(); // cover된 실제 표시 크기
  const frameRect = frameProbe.getBoundingClientRect();

  // 원본 비디오 픽셀 크기
  const vw = video.videoWidth;
  const vh = video.videoHeight;

  // cover 비율 계산: 컨테이너를 가득 채우기 위해 scale = max()
  const scale = Math.max(containerRect.width / vw, containerRect.height / vh);

  // 화면에 표시되고 있는 비디오의 실제 픽셀 크기
  const dispW = vw * scale;
  const dispH = vh * scale;

  // cover로 인해 화면 중앙 기준으로 잘린 오프셋
  const offsetX = (containerRect.width - dispW) / 2;
  const offsetY = (containerRect.height - dispH) / 2;

  // frameRect의 좌표를 컨테이너 좌표계로 정규화
  const frameLeftInContainer = frameRect.left - containerRect.left;
  const frameTopInContainer = frameRect.top - containerRect.top;

  // frame을 원본 비디오 좌표로 환산
  // (frame + cover 오프셋) / scale
  const sx = (frameLeftInContainer - offsetX) / scale;
  const sy = (frameTopInContainer - offsetY) / scale;
  const sw = frameRect.width / scale;
  const sh = frameRect.height / scale;

  // 자르는 영역이 비디오 범위를 벗어나지 않게 클램프
  const sxClamped = Math.max(0, Math.min(vw, sx));
  const syClamped = Math.max(0, Math.min(vh, sy));
  const swClamped = Math.max(1, Math.min(vw - sxClamped, sw));
  const shClamped = Math.max(1, Math.min(vh - syClamped, sh));

  // 캔버스 크기를 프레임 크기(결과물 크기)로 설정
  canvas.width = Math.round(swClamped);
  canvas.height = Math.round(shClamped);

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 원본 비디오에서 프레임 영역만 잘라 그리기
  ctx.drawImage(
    video,
    sxClamped, syClamped, swClamped, shClamped, // source
    0, 0, canvas.width, canvas.height          // dest
  );

  // PNG 데이터 URL 미리보기
  const dataUrl = canvas.toDataURL('image/png');
  preview.src = dataUrl;

  // 다운로드 링크 업데이트
  downloadLink.href = dataUrl;
  downloadLink.classList.remove('hidden');
  downloadLink.textContent = '다운로드 (PNG)';
});
