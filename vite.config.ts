import {defineConfig} from "vite";
// import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
    // plugins: [basicSsl()],
    server: {
        host: '0.0.0.0',
        port: 5001,
        allowedHosts: [
      'novel-513909686873.europe-west1.run.app',
      // You can add other hosts here if needed
    ],
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
