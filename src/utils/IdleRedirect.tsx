// IdleRedirect.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Timeout } from "../components/warring/Timeout.tsx";

type Props = {
  timeout?: number;          // ms
  to?: string;               // 이동 경로
  warningTime?: number;      // 경고 표시 시간 (timeout 전 몇 초에 표시할지)
  children?: React.ReactNode;
};

export default function IdleRedirect({
  timeout = 60000,           // 60초
  to = "/",
  warningTime = 3000,       // 10초 전에 경고 표시
  children,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false); // 테스트용으로 true로 변경

  const start = () => {
    // 기존 타이머들 정리
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    setShowTimeoutWarning(false);

    // 메인 화면에서는 경고 창을 띄우지 않음
    if (location.pathname === to) {
      return;
    }

    // 테스트용: 경고창을 바로 표시 (1초 후)
    /*warningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 1000); // 1초 후에 경고창 표시*/

    // 메인 타이머 설정 (timeout 후에 페이지 이동)
    const warningDelay = Math.max(timeout - warningTime, 0);

    warningTimerRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);

      timerRef.current = setTimeout(() => {
        setShowTimeoutWarning(false);
        navigate(to, { replace: true });
      }, warningTime);
    }, warningDelay);
  };

  const reset = () => {
    start();
  };

  const handleWarningClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    setShowTimeoutWarning(false);
    // 경고창을 닫으면 타이머 리셋 (사용자 활동으로 간주)
    start();
  };

  useEffect(() => {
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
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      events.forEach((e) => document.removeEventListener(e, reset));
    };
    // 라우트가 바뀌면 타이머 리셋
  }, [timeout, to, warningTime, navigate, location.key]);

  return (
    <>
      {children}
      
      {/* 시간 초과 경고 모달 */}
      <Timeout 
        isVisible={showTimeoutWarning}
        primaryMessage="시간이 초과되었습니다."
        secondaryMessage="대기화면으로 이동합니다."
        autoCloseDelay={0}
        onClose={handleWarningClose}
        showIcon={true}
      />
    </>
  );
}
