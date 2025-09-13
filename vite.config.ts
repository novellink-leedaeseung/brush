import {defineConfig} from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    plugins: [basicSsl()],
    server: {
        port: 80,
        https: true,
        host: true,     // 네트워크 접근 허용(모바일 기기 테스트 등)
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
