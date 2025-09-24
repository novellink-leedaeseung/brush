// ApiAxios.ts
import axios from 'axios'

const isDev = import.meta.env.DEV

function normalizeBase(b?: string) {
    let base = (b ?? '').trim()
    if (!/^https?:\/\//i.test(base)) base = 'http://' + base
    return base.replace(/\/+$/g, '')
}

function ensureApiBase(b?: string) {
    const base = normalizeBase(b)
    return /\/api$/i.test(base) ? base : base + '/api'
}

// ✅ 핵심: /api는 novel.rosq로 보냄
const NOVEL_API_BASE = isDev
    ? '/api'                         // dev: Vite proxy → novel.rosq
    : ensureApiBase("https://novel.rosq.co.kr:8488/") // prod: 절대 URL로 직접 호출

export const api = axios.create({
    baseURL: NOVEL_API_BASE, // 항상 /api 계열은 여기로
    timeout: 15000,
    withCredentials: true,
})

// 사용 예시는 그대로 리소스만 넘겨
export const getKioskAuth = (kioskName: string) =>
    api.post('/auth-kiosk', {kioskid: kioskName}).then(r => r.data).catch((error) => {throw new Error("네트워크가 불안정합니다.")})

export const getAuthUser = (userId: string, type: string, token: string) =>
    api.post('/auth-user', {
        userid: userId,
        type: type || 'phone',
        token,
    }).then(r => r.data)
