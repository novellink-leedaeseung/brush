import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import {fileURLToPath} from 'url';
import {appendMemberToExcel} from "./src/utils/excelStore.js";

// JSON 백업용 함수 추가
async function saveToJSON(data) {
    const fs = await import('fs-extra');
    const path = await import('path');
    
    const jsonPath = path.default.join(process.cwd(), "data", "members.json");
    
    let existingData = [];
    if (await fs.default.pathExists(jsonPath)) {
        const jsonContent = await fs.default.readFile(jsonPath, 'utf8');
        existingData = JSON.parse(jsonContent);
    }
    
    existingData.push({
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    
    await fs.default.writeFile(jsonPath, JSON.stringify(existingData, null, 2));
    console.log('JSON 백업 저장 완료');
    return existingData;
}

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
            lunch: payload.lunch ?? false,
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
            gender: entry.gender ? entry.gender.toString().trim() : '',
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
app.use(express.json({limit: '50mb'}));

const studentDir = path.join(__dirname, 'public', 'assets', 'student');
if (!fs.existsSync(studentDir)) {
    fs.mkdirSync(studentDir, {recursive: true});
    console.log('student 디렉토리 생성:', studentDir);
}

app.post('/api/save-photo', (req, res) => {
    try {
        const {imageData, fileName} = req.body;

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
    const {page} = req.query;
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
        return res.status(404).json({success: false, error: '회원을 찾을 수 없습니다.'});
    }

    res.json({success: true, data: member});
});

app.post('/api/members', async (req, res) => {
    const {name, phone, gradeClass, gender, lunch = ''} = req.body ?? {};

    if (!name || !phone) {
        return res.status(400).json({success: false, error: '이름과 연락처는 필수 항목입니다.'});
    }

    const isPhone = /^010\d{8}$/.test(phone);
    if (!isPhone) {
        return res.status(400).json({success: false, error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.'});
    }

    try {
        console.log('엑셀 저장 시도');
        
        // JSON으로도 백업 저장
        await saveToJSON({ name, phone, gradeClass, gender });
        
        // 엑셀 저장 시도
        await appendMemberToExcel({ name, phone, gradeClass, gender });
        console.log('엑셀 저장 성공');
    } catch (error) {
        console.error('엑셀 저장 실패:', error);
        console.log('JSON 백업은 저장됨');
        // 엑셀 저장 실패해도 JSON으로는 저장되었으므로 계속 진행
    }

    const member = memberStore.create({name, phone, gradeClass, gender, lunch});
    res.status(201).json({success: true, data: member});
});

app.put('/api/members/:id', (req, res) => {
    const {name, phone, grade, classroom} = req.body ?? {};

    if (phone && !/^010\d{8}$/.test(phone)) {
        return res.status(400).json({success: false, error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.'});
    }

    const patch = {};
    if (name !== undefined) patch.name = name;
    if (phone !== undefined) patch.phone = phone;
    if (grade !== undefined) patch.grade = grade;
    if (classroom !== undefined) patch.classroom = classroom;

    const updated = memberStore.update(req.params.id, patch);
    if (!updated) {
        return res.status(404).json({success: false, error: '회원을 찾을 수 없습니다.'});
    }

    res.json({success: true, data: updated});
});

app.delete('/api/members/:id', (req, res) => {
    const removed = memberStore.delete(req.params.id);
    if (!removed) {
        return res.status(404).json({success: false, error: '회원을 찾을 수 없습니다.'});
    }

    res.status(204).end();
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        studentDir: studentDir
    });
});

// JSON 데이터를 Excel로 변환하는 API
app.get('/api/convert-to-excel', async (req, res) => {
    try {
        const fs = await import('fs-extra');
        const path = await import('path');
        
        const jsonPath = path.default.join(process.cwd(), "data", "members.json");
        const excelPath = path.default.join(process.cwd(), "data", "members.xlsx");
        
        if (!(await fs.default.pathExists(jsonPath))) {
            return res.status(404).json({
                success: false,
                error: 'JSON 파일이 존재하지 않습니다.'
            });
        }
        
        // JSON 데이터 읽기
        const jsonData = await fs.default.readFile(jsonPath, 'utf8');
        const members = JSON.parse(jsonData);
        
        if (members.length === 0) {
            return res.json({
                success: false,
                message: '변환할 데이터가 없습니다.'
            });
        }
        
        // ExcelJS로 변환
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.default.Workbook();
        const worksheet = workbook.addWorksheet('Members');
        
        // 컬럼 설정
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Timestamp', key: 'timestamp', width: 20 },
            { header: 'Name', key: 'name', width: 15 },
            { header: 'Phone', key: 'phone', width: 15 },
            { header: 'Grade/Class', key: 'gradeClass', width: 12 },
            { header: 'Gender', key: 'gender', width: 10 }
        ];
        
        // 데이터 추가
        members.forEach(member => {
            worksheet.addRow({
                id: member.id,
                timestamp: member.timestamp,
                name: member.name,
                phone: member.phone,
                gradeClass: member.gradeClass,
                gender: member.gender
            });
        });
        
        // Excel 파일 저장
        await workbook.xlsx.writeFile(excelPath);
        
        res.json({
            success: true,
            message: `${members.length}개의 데이터를 Excel로 변환했습니다.`,
            excelPath: excelPath,
            totalRows: members.length
        });
        
    } catch (error) {
        console.error('Excel 변환 실패:', error);
        res.status(500).json({
            success: false,
            error: 'Excel 변환 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 서버 실행: http://localhost:${PORT}`);
    console.log(`📁 저장 경로: ${studentDir}`);
});
