// repos/members.repo.json.js
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const JSON_PATH = path.join(DATA_DIR, 'members.json');

export class JsonMemberRepo {
  #map = new Map();
  #nextId = 1;
  #saveTimer = null;

  async init() {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    let seed = [];
    try {
      const txt = await fs.promises.readFile(JSON_PATH, 'utf8');
      seed = JSON.parse(txt);
    } catch { await fs.promises.writeFile(JSON_PATH, '[]', 'utf8'); }
    seed.forEach((e) => this.#addSeed(e));
  }

  list({ page=1, pageSize=5 }={}) {
    const all = [...this.#map.values()].sort((a,b)=>a.id-b.id);
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const cur = Math.min(Math.max(1, page), totalPages);
    const items = all.slice((cur-1)*pageSize, (cur-1)*pageSize + pageSize);
    return { items, total, page: cur, pageSize, totalPages };
  }
  get(id) { return this.#map.get(Number(id)) ?? null; }

  create(data) {
    const now = new Date().toISOString();
    const id = this.#issueId();
    const row = { id, ...data, createdAt: now, updatedAt: now };
    this.#map.set(id, row);
    this.#persistSoon();
    return row;
  }
  update(id, patch) {
    const cur = this.get(id);
    if (!cur) return null;
    const row = { ...cur, ...patch, id: cur.id, updatedAt: new Date().toISOString() };
    this.#map.set(cur.id, row);
    this.#persistSoon();
    return row;
  }
  delete(id) {
    const ok = this.#map.delete(Number(id));
    if (ok) this.#persistSoon();
    return ok;
  }

  // 내부
  #addSeed(e) {
    const id = Number(e?.id) > 0 ? Number(e.id) : this.#issueId();
    this.#map.set(id, { ...e, id });
    if (id >= this.#nextId) this.#nextId = id + 1;
  }
  #issueId() { return this.#nextId++; }

  // 💡 디바운스 + 원자적 저장(임시파일→rename)
  #persistSoon() {
    clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(async () => {
      const arr = [...this.#map.values()];
      const tmp = JSON_PATH + '.tmp';
      await fs.promises.writeFile(tmp, JSON.stringify(arr, null, 2), 'utf8');
      await fs.promises.rename(tmp, JSON_PATH);
    }, 100); // 100ms 동안 변경 합치기
  }
}
