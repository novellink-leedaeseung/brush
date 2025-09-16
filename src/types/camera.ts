export type DetectionBox = {
  x: number; y: number; w: number; h: number; // 0~1 비율 좌표
};

export type CameraState = {
  isReady: boolean;
  error?: string;
  stream?: MediaStream;
  lastShotUrl?: string;
  detection?: DetectionBox | null;
};
