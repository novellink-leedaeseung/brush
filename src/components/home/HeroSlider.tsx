// HeroSlider.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "@/hooks/useConfig";

const HERO_W = 1080;
const HERO_H = 608;
const FALLBACK_SEC = 5;

type MediaItem = { name: string; type: "image" | "video"; url: string };
type Slide = { src: string; type: "image" | "video" };

const HeroSlider: React.FC = () => {
  const { config } = useConfig(); // ✅ 런타임 config
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // ✅ 안전 기본값
  const apiBase = (config?.apiBaseUrl ?? "").replace(/\/+$/, "");
  const slideSec = Number(config?.slideTime ?? FALLBACK_SEC);

  // ✅ 상대경로 → 절대경로
  const toAbs = useMemo(
    () => (path: string) => {
      if (!path) return "";
      if (/^https?:\/\//i.test(path)) return path;
      const sep = path.startsWith("/") ? "" : "/";
      return `${apiBase}${sep}${path}`;
    },
    [apiBase]
  );

  // 미디어 목록 로드
  useEffect(() => {
    if (!apiBase) {
      // apiBase가 아직 준비 안 됐을 때는 대기 (config 로딩 후 자동 재실행)
      setSlides([]);
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/notification/media`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const items: MediaItem[] = await res.json();
        const mapped: Slide[] = (items ?? []).map(({ url, type }) => ({
          src: toAbs(url),
          type,
        }));
        setSlides(mapped);
        setCurrent(0);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          console.error("❌ 미디어 목록 불러오기 실패:", err);
          setSlides([]);
        }
      }
    })();
    return () => controller.abort();
  }, [apiBase, toAbs]);

  const next = useMemo(
    () => () => setCurrent((p) => (slides.length ? (p + 1) % slides.length : 0)),
    [slides.length]
  );

  // 슬라이드 전환/비디오 이벤트
  useEffect(() => {
    if (slides.length === 0) return;

    const cur = slides[current];
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (cur.type === "image") {
      timer = setTimeout(next, slideSec * 1000);
    } else {
      const v = videoRef.current;
      if (v) {
        const onEnded = () => next();
        const onError = () => {
          console.error("🎞️ 재생 실패:", cur.src);
          next();
        };
        v.addEventListener("ended", onEnded);
        v.addEventListener("error", onError);

        v.play().catch(() => {
          // 자동재생 제한 등으로 play 실패 시 타이머로 넘어가기
          timer = setTimeout(next, slideSec * 1000);
        });

        return () => {
          v.removeEventListener("ended", onEnded);
          v.removeEventListener("error", onError);
        };
      } else {
        timer = setTimeout(next, slideSec * 1000);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [current, slides, next, slideSec]);

  if (!apiBase) {
    // config 로딩 전 간단한 플레이스홀더
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
        설정 로딩 중…
      </div>
    );
  }

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
          position: "absolute",
          top: 0,
          left: 0,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.7s ease-in-out",
          pointerEvents: visible ? "auto" : "none",
            objectFit: "contain",
        };

        return item.type === "image" ? (
          <img
            key={index}
            src={item.src}
            alt=""
            style={baseStyle}
            crossOrigin="anonymous"
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
            crossOrigin="anonymous"
            controls={false}
          />
        );
      })}
    </div>
  );
};

export default HeroSlider;
