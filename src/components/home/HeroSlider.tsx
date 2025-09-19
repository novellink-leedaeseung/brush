import React, { useEffect, useMemo, useRef, useState } from "react";

const HERO_W = 1080;
const HERO_H = 608; // px 숫자로 관리
const FALLBACK_SEC = 5; // 슬라이드 시간 기본값(환경변수 없을 때)
const SLIDE_SEC =
  Number(import.meta.env.VITE_SLIDE_TIME ?? FALLBACK_SEC); // 이미지 표시 시간(초)

// 확장자로 동영상 여부 판별
const isVideoUrl = (url: string) => /\.(mp4|webm|ogg)$/i.test(url);

// API 응답: 문자열 배열(이미지/비디오 URL 혼합) 가정
type Slide = { src: string; type: "image" | "video" };

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 서버에서 목록 가져오기
  useEffect(() => {
    fetch("http://localhost:3001/api/notifications")
      .then((res) => res.json())
      .then((arr: string[]) =>
        setSlides(
          (arr ?? []).map((src) => ({
            src,
            type: isVideoUrl(src) ? "video" : "image",
          }))
        )
      )
      .catch((err) => console.error("❌ 미디어 목록 불러오기 실패:", err));
  }, []);

  // 다음 슬라이드로
  const next = useMemo(
    () => () => setCurrent((p) => (slides.length ? (p + 1) % slides.length : 0)),
    [slides.length]
  );

  // 자동 진행 로직: 이미지면 타이머, 동영상이면 ended 이벤트
  useEffect(() => {
    if (slides.length === 0) return;

    const cur = slides[current];
    let timer: number | undefined;

    if (cur.type === "image") {
      timer = window.setTimeout(next, SLIDE_SEC * 1000);
    } else {
      const v = videoRef.current;
      if (v) {
        // 재생 준비되면 자동재생(Chrome 정책 때문에 muted 필요)
        const onEnded = () => next();
        const onError = () => {
          console.error("🎞️ 동영상 재생 실패, 다음 슬라이드로 이동:", cur.src);
          next();
        };
        v.addEventListener("ended", onEnded);
        v.addEventListener("error", onError);

        // 혹시 자동재생이 막히면 강제 play 시도
        v.play().catch(() => {
          // 재생이 막히면 이미지처럼 시간 경과로 넘김
          timer = window.setTimeout(next, SLIDE_SEC * 1000);
        });

        return () => {
          v.removeEventListener("ended", onEnded);
          v.removeEventListener("error", onError);
        };
      } else {
        // ref가 아직 없으면 안전망 타이머
        timer = window.setTimeout(next, SLIDE_SEC * 1000);
      }
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [current, slides, next]);

  if (slides.length === 0) {
    return (
      <div
        style={{
          width: `${HERO_W}px`,
          height: `${HERO_H}px`,
          background: "#333",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        이미지/동영상 없음
      </div>
    );
  }

  return (
    <div
      style={{
        width: `${HERO_W}px`,
        height: `${HERO_H}px`,
        overflow: "hidden",
        position: "relative",
        background: "#000",
      }}
    >
      {slides.map((item, index) => {
        const visible = index === current;
        const baseStyle: React.CSSProperties = {
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease-in-out",
          pointerEvents: visible ? "auto" : "none",
        };

        return item.type === "image" ? (
          <img key={index} src={item.src} alt="" style={baseStyle} />
        ) : (
          <video
            key={index}
            ref={visible ? videoRef : null} // 현재 슬라이드에만 ref 연결
            src={item.src}
            style={baseStyle}
            muted
            playsInline
            // loop는 끄고, 끝나면 다음으로
            // controls 원하면 넣어도 됨
            preload="auto"
            // iOS 자동재생 호환
            autoPlay={visible}
          />
        );
      })}
    </div>
  );
};

export default HeroSlider;
