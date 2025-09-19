import React, { useEffect, useMemo, useRef, useState } from "react";

const HERO_W = 1080;
const HERO_H = 608;
const FALLBACK_SEC = 5;

// .env에서 API 베이스/슬라이드 시간 읽기 (없으면 기본값)
const API_BASE = import.meta.env.VITE_API_BASE ?? ""; // 예: "http://localhost:3001"
const SLIDE_SEC = Number(import.meta.env.VITE_SLIDE_TIME ?? FALLBACK_SEC);

// ====== 타입 ======
type MediaItem = {
  name: string;
  type: "image" | "video";
  url: string; // 서버가 주는 재생/표시용 URL (예: /assets/notification/xxx.mp4)
};

type Slide = { src: string; type: "image" | "video" };

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 공지 미디어 목록 불러오기 (이미지/동영상 혼합)
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/notification/media`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items: MediaItem[] = await res.json();

        // 서버가 준 URL이 절대경로가 아니라면 API_BASE를 앞에 붙여 절대 URL로
        const toAbs = (u: string) =>
          /^https?:\/\//i.test(u) ? u : `${API_BASE}${u}`;

        const mapped: Slide[] = (items ?? []).map((m) => ({
          src: toAbs(m.url),
          type: m.type,
        }));
        setSlides(mapped);
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("❌ 미디어 목록 불러오기 실패:", err);
          setSlides([]); // 실패 시 비움
        }
      }
    })();

    return () => controller.abort();
  }, []);

  // 다음 슬라이드
  const next = useMemo(
    () => () => setCurrent((p) => (slides.length ? (p + 1) % slides.length : 0)),
    [slides.length]
  );

  // 자동 진행 (이미지: 타이머 / 동영상: ended 이벤트)
  useEffect(() => {
    if (slides.length === 0) return;

    const cur = slides[current];
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (cur.type === "image") {
      timer = setTimeout(next, SLIDE_SEC * 1000);
    } else {
      const v = videoRef.current;
      if (v) {
        const onEnded = () => next();
        const onError = () => {
          console.error("🎞️ 동영상 재생 실패, 다음으로 이동:", cur.src);
          next();
        };
        v.addEventListener("ended", onEnded);
        v.addEventListener("error", onError);

        v.play().catch(() => {
          // 자동재생이 막히면 이미지처럼 시간 경과로 넘김
          timer = setTimeout(next, SLIDE_SEC * 1000);
        });

        return () => {
          v.removeEventListener("ended", onEnded);
          v.removeEventListener("error", onError);
        };
      } else {
        // ref가 아직 없으면 안전망 타이머
        timer = setTimeout(next, SLIDE_SEC * 1000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
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
            ref={visible ? videoRef : null}
            src={item.src}
            style={baseStyle}
            muted
            playsInline
            preload="auto"
            autoPlay={visible}
          />
        );
      })}
    </div>
  );
};

export default HeroSlider;
