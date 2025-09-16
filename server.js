import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

const dataDir = path.join(__dirname, 'data');
const membersSnapshotPath = path.join(dataDir, 'members.json');

const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const loadMemberSnapshot = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            if (raw.trim().length === 0) {
                return [];
            }
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (error) {
        console.error('회원 스냅샷 로드 실패:', error);
    }
    return [];
};

const persistMembersSnapshot = (filePath, members) => {
    try {
        ensureDir(path.dirname(filePath));
        fs.writeFileSync(filePath, JSON.stringify(members, null, 2), 'utf8');
    } catch (error) {
        console.error('회원 스냅샷 저장 실패:', error);
    }
};

class MemberStore {
    constructor(seed = [], options = {}) {
        this.members = new Map();
        this.persist = options.persist ?? (() => {});
        seed.forEach((entry) => {
            const member = this.#normalize(entry);
            this.members.set(member.id, member);
        });
    }

    list() {
        return Array.from(this.members.values());
    }

    get(id) {
        return this.members.get(id) ?? null;
    }

    create(payload) {
        const now = new Date().toISOString();
        const base = this.#normalize({
            id: randomUUID(),
            name: payload.name,
            phone: payload.phone,
            grade: payload.grade,
            classroom: payload.classroom,
            createdAt: now,
            updatedAt: now
        });

        this.members.set(base.id, base);
        this.persist(this.list());
        return base;
    }

    update(id, patch) {
        const current = this.members.get(id);
        if (!current) return null;

        const next = this.#normalize({
            ...current,
            ...patch,
            id: current.id,
            updatedAt: new Date().toISOString()
        });

        this.members.set(id, next);
        this.persist(this.list());
        return next;
    }

    delete(id) {
        const removed = this.members.delete(id);
        if (removed) {
            this.persist(this.list());
        }
        return removed;
    }

    #normalize(entry) {
        return {
            id: entry.id ?? randomUUID(),
            name: (entry.name ?? '').toString().trim(),
            phone: (entry.phone ?? '').toString().trim(),
            grade: entry.grade ? entry.grade.toString().trim() : '',
            classroom: entry.classroom ? entry.classroom.toString().trim() : '',
            createdAt: entry.createdAt ?? new Date().toISOString(),
            updatedAt: entry.updatedAt ?? entry.createdAt ?? new Date().toISOString()
        };
    }
}

ensureDir(dataDir);
const initialMembers = loadMemberSnapshot(membersSnapshotPath);
const memberStore = new MemberStore(initialMembers, {
    persist: (members) => persistMembersSnapshot(membersSnapshotPath, members)
});
persistMembersSnapshot(membersSnapshotPath, memberStore.list());

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

app.get('/api/members', (req, res) => {
    res.json({
        success: true,
        data: memberStore.list()
    });
});

app.get('/api/members/:id', (req, res) => {
    const member = memberStore.get(req.params.id);
    if (!member) {
        return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: member });
});

app.post('/api/members', (req, res) => {
    const { name, phone, grade = '', classroom = '' } = req.body ?? {};

    if (!name || !phone) {
        return res.status(400).json({ success: false, error: '이름과 연락처는 필수 항목입니다.' });
    }

    const isPhone = /^010\d{8}$/.test(phone);
    if (!isPhone) {
        return res.status(400).json({ success: false, error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.' });
    }

    const member = memberStore.create({ name, phone, grade, classroom });
    res.status(201).json({ success: true, data: member });
});

app.put('/api/members/:id', (req, res) => {
    const { name, phone, grade, classroom } = req.body ?? {};

    if (phone && !/^010\d{8}$/.test(phone)) {
        return res.status(400).json({ success: false, error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.' });
    }

    const patch = {};
    if (name !== undefined) patch.name = name;
    if (phone !== undefined) patch.phone = phone;
    if (grade !== undefined) patch.grade = grade;
    if (classroom !== undefined) patch.classroom = classroom;

    const updated = memberStore.update(req.params.id, patch);
    if (!updated) {
        return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    }

    res.json({ success: true, data: updated });
});

app.delete('/api/members/:id', (req, res) => {
    const removed = memberStore.delete(req.params.id);
    if (!removed) {
        return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    }

    res.status(204).end();
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
