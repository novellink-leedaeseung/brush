// HeroSlider.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const HERO_W = 1080;
const HERO_H = 608;
const FALLBACK_SEC = 5;

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";   // ✅ .env 사용
const SLIDE_SEC = Number(import.meta.env.VITE_SLIDE_TIME ?? FALLBACK_SEC);

// ✅ 누락됐던 함수: 상대경로를 절대 URL로
function toAbs(path: string) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  // API_BASE가 http(s)://host:port 형태라고 가정
  const sep = path.startsWith("/") ? "" : "/";
  return `${API_BASE}${sep}${path}`;
}

type MediaItem = { name: string; type: "image" | "video"; url: string };
type Slide = { src: string; type: "image" | "video" };

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        // ✅ 하드코딩 제거
        const res = await fetch(`${API_BASE}/api/notification/media`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items: MediaItem[] = await res.json();

        const mapped: Slide[] = (items ?? []).map(({ url, type }) => ({
          src: toAbs(url),   // ✅ 절대경로로 변환
          type,
        }));
        setSlides(mapped);
      } catch (err:any) {
        if (err?.name !== "AbortError") {
          console.error("❌ 미디어 목록 불러오기 실패:", err);
          setSlides([]);
        }
      }
    })();
    return () => controller.abort();
  }, [API_BASE]); // ✅ 의존성 추가

  const next = useMemo(
    () => () => setCurrent((p) => (slides.length ? (p + 1) % slides.length : 0)),
    [slides.length]
  );

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
        const onError = () => { console.error("🎞️ 재생 실패:", cur.src); next(); };
        v.addEventListener("ended", onEnded);
        v.addEventListener("error", onError);

        v.play().catch(() => { timer = setTimeout(next, SLIDE_SEC * 1000); });

        return () => {
          v.removeEventListener("ended", onEnded);
          v.removeEventListener("error", onError);
        };
      } else {
        timer = setTimeout(next, SLIDE_SEC * 1000);
      }
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [current, slides, next]);

  if (slides.length === 0) {
    return (
      <div style={{ width: `${HERO_W}px`, height: `${HERO_H}px`,
        background: "#333", color: "#fff", display: "flex",
        alignItems: "center", justifyContent: "center" }}>
        이미지/동영상 없음
      </div>
    );
  }

  return (
    <div style={{ width: `${HERO_W}px`, height: `${HERO_H}px`,
      overflow: "hidden", position: "relative", background: "#000" }}>
      {slides.map((item, index) => {
        const visible = index === current;
        const baseStyle: React.CSSProperties = {
          width: "100%", height: "100%",
          position: "absolute", top: 0, left: 0,
          opacity: visible ? 1 : 0, transition: "opacity 0.7s ease-in-out",
          pointerEvents: visible ? "auto" : "none",
        };

        return item.type === "image" ? (
          <img
            key={index}
            src={item.src}
            alt=""
            style={baseStyle}
            crossOrigin="anonymous" // ✅ CORS 안전
          />
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
            crossOrigin="anonymous" // ✅ CORS 안전
            controls={false}
          />
        );
      })}
    </div>
  );
};

export default HeroSlider;
