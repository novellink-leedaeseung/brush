import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

class MemberStore {
    constructor(seed = []) {
        this.members = new Map();
        this.nextId = 1;

        seed.forEach((entry) => {
            const seededId = this.#coerceSeedId(entry?.id);
            const member = this.#normalize({
                ...entry,
                id: seededId
            });
            this.members.set(member.id, member);
            this.#trackNextId(member.id);
        });
    }

    list(options = {}) {
        const rawPage = Number(options.page ?? 1);
        const rawPageSize = Number(options.pageSize ?? 5);
        const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 5;

        const all = Array.from(this.members.values()).sort((a, b) => a.id - b.id);
        const total = all.length;
        const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

        let page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
        if (totalPages === 0) {
            page = 1;
        } else if (page > totalPages) {
            page = totalPages;
        }

        const start = (page - 1) * pageSize;
        const items = all.slice(start, start + pageSize);

        return {
            items,
            total,
            page,
            pageSize,
            totalPages
        };
    }

    get(id) {
        const parsed = this.#parseId(id);
        if (parsed === null) {
            return null;
        }
        return this.members.get(parsed) ?? null;
    }

    create(payload) {
        const now = new Date().toISOString();
        const base = this.#normalize({
            id: this.#issueId(),
            name: payload.name,
            phone: payload.phone,
            grade: payload.grade,
            classroom: payload.classroom,
            gradeClass: payload.gradeClass,
            gender: payload.gender,
            createdAt: now,
            updatedAt: now
        });

        this.members.set(base.id, base);
        return base;
    }

    update(id, patch) {
        const parsed = this.#parseId(id);
        if (parsed === null) {
            return null;
        }

        const current = this.members.get(parsed);
        if (!current) return null;

        const next = this.#normalize({
            ...current,
            ...patch,
            id: current.id,
            updatedAt: new Date().toISOString()
        });

        this.members.set(parsed, next);
        return next;
    }

    delete(id) {
        const parsed = this.#parseId(id);
        if (parsed === null) {
            return false;
        }

        return this.members.delete(parsed);
    }

    #normalize(entry) {
        const id = this.#parseId(entry.id);
        if (id === null) {
            throw new Error('유효하지 않은 회원 ID 입니다.');
        }

        return {
            id,
            name: (entry.name ?? '').toString().trim(),
            phone: (entry.phone ?? '').toString().trim(),
            grade: entry.grade ? entry.grade.toString().trim() : '',
            classroom: entry.classroom ? entry.classroom.toString().trim() : '',
            gradeClass: entry.gradeClass ? entry.gradeClass.toString().trim() : '',
            lunch: entry.lunch ?? false,
            gender : entry.gender ? entry.gender.toString().trim() : '',
            createdAt: entry.createdAt ?? new Date().toISOString(),
            updatedAt: entry.updatedAt ?? entry.createdAt ?? new Date().toISOString()
        };
    }

    #parseId(value) {
        if (value === undefined || value === null) {
            return null;
        }

        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed <= 0) {
            return null;
        }

        return parsed;
    }

    #issueId() {
        const issued = this.nextId;
        this.nextId += 1;
        return issued;
    }

    #coerceSeedId(value) {
        const parsed = this.#parseId(value);
        if (parsed !== null) {
            if (parsed >= this.nextId) {
                this.nextId = parsed + 1;
            }
            return parsed;
        }

        return this.#issueId();
    }

    #trackNextId(id) {
        if (id >= this.nextId) {
            this.nextId = id + 1;
        }
    }
}
const memberStore = new MemberStore();

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
    const { page } = req.query;
    const result = memberStore.list({
        page: page !== undefined ? Number(page) : undefined,
        pageSize: 5,
    });

    res.json({
        success: true,
        data: result
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
    const { name, phone, gradeClass, gender = '' } = req.body ?? {};

    if (!name || !phone) {
        return res.status(400).json({ success: false, error: '이름과 연락처는 필수 항목입니다.' });
    }

    const isPhone = /^010\d{8}$/.test(phone);
    if (!isPhone) {
        return res.status(400).json({ success: false, error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.' });
    }

    const member = memberStore.create({ name, phone, gradeClass, gender});
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
