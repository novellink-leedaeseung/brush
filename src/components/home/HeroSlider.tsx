import React, { useState, useEffect } from "react";

const HERO_H = "608px"; // 원하는 높이 값 넣어줘

const HeroSlider: React.FC<{ images: string[] }> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  // 3초마다 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [images.length]);

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
            opacity: index === current ? 1 : 0,
            transition: "opacity 0.7s ease-in-out",
          }}
        />
      ))}
    </div>
  );
};

export default HeroSlider;
