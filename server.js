import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors({
    origin: ['http://localhost:5173', 'https://localhost:5173'],
    credentials: true
}));

app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

const studentDir = path.join(__dirname, 'public', 'assets', 'student');
if (!fs.existsSync(studentDir)) {
    fs.mkdirSync(studentDir, { recursive: true });
    console.log('student 디렉토리 생성:', studentDir);
}

app.post('/api/save-photo', (req, res) => {
    try {
        const { imageData, fileName } = req.body;
        
        if (!imageData || !fileName) {
            return res.status(400).json({ 
                success: false,
                error: '이미지 데이터와 파일명이 필요합니다.' 
            });
        }

        const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        const safeFileName = fileName.replace(/[^a-zA-Z0-9가-힣\-_]/g, '');
        const filePath = path.join(studentDir, `${safeFileName}.jpg`);
        
        fs.writeFileSync(filePath, base64Data, 'base64');
        
        console.log(`이미지 저장 완료: ${filePath}`);
        
        res.json({ 
            success: true, 
            message: '사진이 성공적으로 저장되었습니다.',
            fileName: `${safeFileName}.jpg`,
            filePath: `/assets/student/${safeFileName}.jpg`
        });
        
    } catch (error) {
        console.error('사진 저장 오류:', error);
        res.status(500).json({ 
            success: false,
            error: '사진 저장 중 오류가 발생했습니다.' 
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        studentDir: studentDir
    });
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행: http://localhost:${PORT}`);
    console.log(`📁 저장 경로: ${studentDir}`);
});
