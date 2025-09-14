import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 5173,
    host: true,
    https: true,
    proxy: {
            "/api": {
                target: "https://novel.rosq.co.kr:8488/",
                changeOrigin: true,
                secure: true, // 자체 서명 인증서 등으로 문제가 있으면 false로
                // rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
  }
})
