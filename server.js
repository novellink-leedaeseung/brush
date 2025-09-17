// server.js
import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

// ─────────────────────────────────────────────────────────────
// 영속 저장 경로 설정
// ─────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const JSON_PATH = path.join(DATA_DIR, 'members.json');

const app = express();
const PORT = 3001;

// ─────────────────────────────────────────────────────────────
// 파일 기반 로드/저장 유틸
// ─────────────────────────────────────────────────────────────
async function ensureDataFile() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.promises.access(JSON_PATH, fs.constants.F_OK);
  } catch {
    await fs.promises.writeFile(JSON_PATH, '[]', 'utf8');
  }
}

async function loadMembersFromDisk() {
  await ensureDataFile();
  const txt = await fs.promises.readFile(JSON_PATH, 'utf8');
  try {
    const arr = JSON.parse(txt);
    return Array.isArray(arr) ? arr : [];
  } catch {
    // 손상 시 초기화
    await fs.promises.writeFile(JSON_PATH, '[]', 'utf8');
    return [];
  }
}

async function saveMembersToDisk(list) {
  await ensureDataFile();
  await fs.promises.writeFile(JSON_PATH, JSON.stringify(list, null, 2), 'utf8');
}

// ─────────────────────────────────────────────────────────────
// 인메모리 스토어 (+ 파일 영속)
// ─────────────────────────────────────────────────────────────
class MemberStore {
  constructor(seed = []) {
    this.members = new Map();
    this.nextId = 1;

    seed.forEach((entry) => {
      const seededId = this.#coerceSeedId(entry?.id);
      const member = this.#normalize({ ...entry, id: seededId });
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
    if (totalPages === 0) page = 1;
    else if (page > totalPages) page = totalPages;

    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return { items, total, page, pageSize, totalPages };
  }

  get(id) {
    const parsed = this.#parseId(id);
    if (parsed === null) return null;
    return this.members.get(parsed) ?? null;
  }

  create(payload) {
    const now = new Date().toISOString();
    const base = this.#normalize({
      id: this.#issueId(),
      name: payload.name,
      phone: payload.phone,
      gradeClass: payload.gradeClass,
      gender: payload.gender,
      lunch: this.#toBool(payload.lunch),
      createdAt: now,
      updatedAt: now,
    });
    this.members.set(base.id, base);
    return base;
  }

  update(id, patch) {
    const parsed = this.#parseId(id);
    if (parsed === null) return null;

    const current = this.members.get(parsed);
    if (!current) return null;

    const next = this.#normalize({
      ...current,
      ...(patch.name !== undefined ? { name: String(patch.name) } : {}),
      ...(patch.phone !== undefined ? { phone: String(patch.phone) } : {}),
      ...(patch.gradeClass !== undefined ? { gradeClass: String(patch.gradeClass) } : {}),
      ...(patch.gender !== undefined ? { gender: String(patch.gender) } : {}),
      ...(patch.lunch !== undefined ? { lunch: this.#toBool(patch.lunch) } : {}),
      id: current.id,
      updatedAt: new Date().toISOString(),
    });

    this.members.set(parsed, next);
    return next;
  }

  delete(id) {
    const parsed = this.#parseId(id);
    if (parsed === null) return false;
    return this.members.delete(parsed);
  }

  // 내부 유틸
  #normalize(entry) {
    const id = this.#parseId(entry.id);
    if (id === null) throw new Error('유효하지 않은 회원 ID 입니다.');
    return {
      id,
      name: (entry.name ?? '').toString().trim(),
      phone: (entry.phone ?? '').toString().trim(),
      gradeClass: entry.gradeClass ? entry.gradeClass.toString().trim() : '',
      gender: entry.gender ? entry.gender.toString().trim() : '',
      lunch: this.#toBool(entry.lunch),
      createdAt: entry.createdAt ?? new Date().toISOString(),
      updatedAt: entry.updatedAt ?? entry.createdAt ?? new Date().toISOString(),
    };
  }
  #toBool(v) {
    return v === true || v === 'true' || v === 1 || v === '1';
  }
  #parseId(value) {
    if (value === undefined || value === null) return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
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
      if (parsed >= this.nextId) this.nextId = parsed + 1;
      return parsed;
    }
    return this.#issueId();
  }
  #trackNextId(id) {
    if (id >= this.nextId) this.nextId = id + 1;
  }
}

let memberStore; // 초기화는 아래 async 부트스트랩에서

// ─────────────────────────────────────────────────────────────
// 미들웨어/정적
// ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));

// 사진 저장(기존 그대로)
const studentDir = path.join(__dirname, 'public', 'assets', 'student');
if (!fs.existsSync(studentDir)) {
  fs.mkdirSync(studentDir, { recursive: true });
  console.log('student 디렉토리 생성:', studentDir);
}
app.post('/api/save-photo', (req, res) => {
  try {
    const { imageData, fileName } = req.body;
    if (!imageData || !fileName) {
      return res.status(400).json({ success: false, error: '이미지 데이터와 파일명이 필요합니다.' });
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
    res.status(500).json({ success: false, error: '사진 저장 중 오류가 발생했습니다.' });
  }
});

// ─────────────────────────────────────────────────────────────
// 부트스트랩(파일에서 시드 → 라우트 등록 → 리슨)
// ─────────────────────────────────────────────────────────────
(async () => {
  const seed = await loadMembersFromDisk();
  memberStore = new MemberStore(seed);

  // 목록
  app.get('/api/members', (req, res) => {
    const { page } = req.query;
    const result = memberStore.list({
      page: page !== undefined ? Number(page) : undefined,
      pageSize: 5,
    });
    res.json({ success: true, data: result });
  });

  // 단건
  app.get('/api/members/:id', (req, res) => {
    const member = memberStore.get(req.params.id);
    if (!member) return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });
    res.json({ success: true, data: member });
  });

  // 생성
  app.post('/api/members', async (req, res) => {
    const { name, phone, gradeClass, gender, lunch = '' } = req.body ?? {};
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: '이름과 연락처는 필수 항목입니다.' });
    }
    const isPhone = /^010\d{8}$/.test(String(phone));
    if (!isPhone) {
      return res.status(400).json({ success: false, error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.' });
    }

    const member = memberStore.create({ name, phone, gradeClass, gender, lunch });
    await saveMembersToDisk(Array.from(memberStore.members.values())); // ← 영속화

    res.status(201).json({ success: true, data: member });
  });

  // 수정
  app.put('/api/members/:id', async (req, res) => {
    const { name, phone, gradeClass, gender, lunch } = req.body ?? {};
    if (phone !== undefined && !/^010\d{8}$/.test(String(phone))) {
      return res.status(400).json({
        success: false,
        error: '휴대폰 번호 형식이 올바르지 않습니다. 010으로 시작하는 11자리 번호여야 합니다.',
      });
    }
    const updated = memberStore.update(req.params.id, { name, phone, gradeClass, gender, lunch });
    if (!updated) return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });

    await saveMembersToDisk(Array.from(memberStore.members.values())); // ← 영속화
    res.json({ success: true, data: updated });
  });

  // 삭제
  app.delete('/api/members/:id', async (req, res) => {
    const removed = memberStore.delete(req.params.id);
    if (!removed) return res.status(404).json({ success: false, error: '회원을 찾을 수 없습니다.' });

    await saveMembersToDisk(Array.from(memberStore.members.values())); // ← 영속화
    res.status(204).end();
  });

  // 헬스체크
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      studentDir,
      persistedFile: JSON_PATH,
      counts: { members: memberStore.members.size },
    });
  });

  // (선택) JSON → 엑셀 변환 API가 필요하면 여기서 JSON_PATH를 사용해 그대로 동작 가능

  app.listen(PORT, () => {
    console.log(`🚀 서버 실행: http://localhost:${PORT}`);
    console.log(`📁 회원 데이터 영속 경로: ${JSON_PATH}`);
  });
})();
