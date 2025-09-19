import { useEffect } from "react";

export function useNoZoomNoContext() {
  useEffect(() => {
    const preventContext = (e: Event) => e.preventDefault();

    const preventCtrlWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };

    const preventZoomKeys = (e: KeyboardEvent) => {
      const zoomKeys = ['+', '-', '=', '0'];
      if ((e.ctrlKey || e.metaKey) && zoomKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    const preventGesture = (e: Event) => e.preventDefault();

    let lastTouchEnd = 0;
    const preventMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    const preventDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    // 우클릭
    window.addEventListener('contextmenu', preventContext, { passive: false });
    // 휠 확대
    window.addEventListener('wheel', preventCtrlWheel as EventListener, { passive: false });
    // 단축키 확대
    window.addEventListener('keydown', preventZoomKeys as EventListener);
    // iOS 제스처
    window.addEventListener('gesturestart', preventGesture, { passive: false });
    // 멀티터치/더블탭
    window.addEventListener('touchstart', preventMultiTouch as EventListener, { passive: false });
    window.addEventListener('touchend', preventDoubleTap as EventListener, { passive: false });

    // CSS 전역 주입(선택)
    const style = document.createElement('style');
    style.innerHTML = `
      html, body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; overscroll-behavior: none; touch-action: manipulation; }
      img { -webkit-user-drag: none; user-drag: none; }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('contextmenu', preventContext as EventListener);
      window.removeEventListener('wheel', preventCtrlWheel as EventListener);
      window.removeEventListener('keydown', preventZoomKeys as EventListener);
      window.removeEventListener('gesturestart', preventGesture as EventListener);
      window.removeEventListener('touchstart', preventMultiTouch as EventListener);
      window.removeEventListener('touchend', preventDoubleTap as EventListener);
      document.head.removeChild(style);
    };
  }, []);
}
