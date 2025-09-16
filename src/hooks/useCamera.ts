import { useEffect, useRef, useState, useCallback } from "react";
import type { CameraState, DetectionBox } from "../types/camera";

type Options = {
  facingMode?: "user" | "environment";
  onReady?: () => void;
  onError?: (err: unknown) => void;
};

export function useCamera({ facingMode = "user", onReady, onError }: Options = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<CameraState>({ isReady: false, detection: null });

  // 카메라 시작
  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setState(s => ({ ...s, stream, isReady: true, error: undefined }));
      onReady?.();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setState(s => ({ ...s, error: e instanceof Error ? e.message : String(e) }));
      onError?.(e);
    }
  }, [facingMode, onReady, onError]);

  // 정지
  const stop = useCallback(() => {
    setState(s => {
      s.stream?.getTracks().forEach(t => t.stop());
      return { ...s, isReady: false, stream: undefined };
    });
  }, []);

  // 캡처
  const capture = useCallback((): Blob | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 비디오 프레임 그리기
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 필요 시 오버레이(박스, 라벨 등)도 같이 그릴 수 있음
    // if (state.detection) { ... }

    // blob으로 변환
    return canvasToBlobSync(canvas);
  }, []);

  // (데모용) 감지 박스 셋터 – 실제 얼굴인식 로직 연동 시 바깥에서 주입
  const setDetection = useCallback((box: DetectionBox | null) => {
    setState(s => ({ ...s, detection: box }));
  }, []);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return {
    videoRef,
    canvasRef,
    state,
    start,
    stop,
    capture,
    setDetection,
  };
}

function canvasToBlobSync(canvas: HTMLCanvasElement): Blob | null {
  // toBlob은 비동기이므로, 동기 변환이 필요하면 dataURL 후 Blob 변환
  const dataUrl = canvas.toDataURL("image/png");
  const arr = dataUrl.split(",");
  if (arr.length < 2) return null;
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}
