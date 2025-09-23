import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), basicSsl()],
    base: './', // Electron을 위한 상대 경로 설정
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },
    server: {
        port: 5173,
        host: true,
        https: {}, // 빈 객체로 변경하여 기본 HTTPS 설정 사용
        proxy: {
            "/api/save-photo": {
                target: "http://localhost:3001",
                changeOrigin: true,
                secure: false,
            },
            "/api": {
                target: "https://novel.rosq.co.kr:8488/",
                changeOrigin: true,
                secure: true, // 자체 서명 인증서 등으로 문제가 있으면 false로
                // rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})
