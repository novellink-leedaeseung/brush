// IdleRedirect.tsx
import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type Props = {
  timeout?: number;          // ms
  to?: string;               // 이동 경로
  children?: React.ReactNode;
};

export default function IdleRedirect({
  timeout = 60000,
  to = "/",
  children,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      window.location.href = to;
    }, timeout);
  };

  useEffect(() => {
    const reset = () => start();

    // 최초 스타트
    start();

    const events: (keyof DocumentEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "wheel",
      "scroll",
      "pointermove",
      "visibilitychange",
    ];

    events.forEach((e) =>
      document.addEventListener(e, reset, { passive: true })
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
    // 라우트가 바뀌면 타이머 리셋
  }, [timeout, to, navigate, location.key]);

  return <>{children}</>;
}
