import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://novel.rosq.co.kr:8488/",
        changeOrigin: true,
        secure: true, // 자체 서명 인증서 등으로 문제가 있으면 false로
        // rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
