import React, { useState, useEffect } from "react";

const HERO_H = "608px";

const HeroSlider: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  // 서버에서 이미지 목록 가져오기
  useEffect(() => {
    fetch("http://localhost:3001/api/notifications")
      .then(res => res.json())
      .then(setImages)
      .catch(err => console.error("❌ 이미지 목록 불러오기 실패:", err));
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images]);

  if (images.length === 0) {
    return <div style={{ width: "1080px", height: HERO_H, background: "#333" }}>이미지 없음</div>;
  }

  return (
    <div style={{ width: "1080px", height: HERO_H, overflow: "hidden", position: "relative" }}>
      {images.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: index === current ? 1 : 0,
            transition: "opacity 0.7s ease-in-out",
          }}
        />
      ))}
    </div>
  );
};

export default HeroSlider;
