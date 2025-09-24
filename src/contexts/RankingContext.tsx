import React, {createContext, useContext, useState, useCallback, useEffect} from 'react'
import { getApiBase } from "@/hooks/useConfig"; // ✅ 추가: 런타임 BASE URL 사용

/* =========================
 * Types
 * ========================= */
export interface BrushingRecord {
    id: string
    name: string
    className: string
    profileImage: string
    brushingTime: Date // 양치 완료 시간
    mealType: 'lunch' | 'outside'
    duration: number // 양치 소요 시간(초)
}

export interface RankedUser extends BrushingRecord {
    rank: number
    borderColor: string
}

interface RankingContextType {
    records: BrushingRecord[]
    rankedUsers: RankedUser[]
    currentUserRank: number | null
    isLoading: boolean
    page: number
    totalPages: number | null
    setPage: (p: number) => void
    addRecord: (record: Omit<BrushingRecord, 'id'>) => void
    setCurrentUser: (userId: string) => void
    getCurrentUserRecord: () => RankedUser | null
    clearAllRecords: () => void
}

/** 서버 응답 아이템(네가 준 스키마 기준) */
type MemberApiItem = {
    id: string | number
    name: string
    phone?: string
    grade?: string | number | null
    classroom?: string | number | null
    gradeClass?: string | null
    lunch?: boolean
    createdAt: string
    updatedAt?: string
    gender: string,
    // 혹시 확장 필드가 올 수도 있으니 옵션
    className?: string
    profileImage?: string
    brushingTime?: string | number
    mealType?: 'lunch' | 'outside'
    duration?: number
}

/* =========================
 * Constants / Utils
 * ========================= */
const RankingContext = createContext<RankingContextType | undefined>(undefined)

const getRankBorderColor = (rank: number): string => {
    if (rank === 1) return '#F56358'
    if (rank === 2) return '#F46059'
    if (rank === 3) return '#F89049'
    return '#E5E5E5'
}

const STORAGE_KEY = 'brushing-ranking-records'
const CURRENT_USER_KEY = 'brushing-current-user-rank'

const getInitialRecords = (): BrushingRecord[] => {
    const today = new Date()
    const baseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 20, 0)
    return [
        {
            id: 'initial-1',
            name: '김민준',
            className: '1-2반',
            profileImage: '/assets/images/man.png',
            brushingTime: new Date(baseTime.getTime()),
            mealType: 'lunch',
            duration: 120
        },
        {
            id: 'initial-2',
            name: '이서연',
            className: '5-1반',
            profileImage: '/assets/images/woman.png',
            brushingTime: new Date(baseTime.getTime() + 160000),
            mealType: 'lunch',
            duration: 115
        },
        {
            id: 'initial-3',
            name: '박하준',
            className: '1-3반',
            profileImage: '/assets/images/woman.png',
            brushingTime: new Date(baseTime.getTime() + 310000),
            mealType: 'lunch',
            duration: 110
        },
        {
            id: 'initial-4',
            name: '최지우',
            className: '2-2반',
            profileImage: '/assets/images/woman.png',
            brushingTime: new Date(baseTime.getTime() + 642000),
            mealType: 'lunch',
            duration: 105
        },
        {
            id: 'initial-5',
            name: '정서윤',
            className: '3-1반',
            profileImage: '/assets/images/woman.png',
            brushingTime: new Date(baseTime.getTime() + 4245000),
            mealType: 'outside',
            duration: 100
        },
    ]
}

const loadRecordsFromStorage = (): BrushingRecord[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            return parsed.map((r: any) => ({...r, brushingTime: new Date(r.brushingTime)}))
        }
    } catch (e) {
        console.error('❌ 랭킹 데이터 로드 실패:', e)
    }
    return getInitialRecords()
}

const saveRecordsToStorage = (records: BrushingRecord[]) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(records.map(r => ({...r, brushingTime: r.brushingTime.toISOString()})))
        )
    } catch (e) {
        console.error('❌ 랭킹 데이터 저장 실패:', e)
    }
}

const loadCurrentUserRank = (): number | null => {
    try {
        const stored = localStorage.getItem(CURRENT_USER_KEY)
        return stored ? parseInt(stored, 10) : null
    } catch {
        return null
    }
}
const saveCurrentUserRank = (rank: number | null) => {
    try {
        if (rank != null) localStorage.setItem(CURRENT_USER_KEY, String(rank))
        else localStorage.removeItem(CURRENT_USER_KEY)
    } catch {
    }
}

/* =========================
 * API fetch (data.items 스키마)
 * ========================= */
async function fetchMembersPage(
    page: number
): Promise<{ items: BrushingRecord[]; page: number; totalPages: number | null }> {
    const base = await getApiBase(); // ✅ 변경: 런타임 BASE URL
    const url = `${base}/api/members?page=${page}`; // ✅ 변경: 동적 BASE 적용

    const res = await fetch(url, {headers: {Accept: 'application/json'}})
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)

    let body: any
    try {
        body = await res.json()
    } catch {
        throw new Error('JSON 파싱 실패')
    }

    // 예상: { success, data: { items: [...], total, page, pageSize, totalPages } }
    const data = body?.data ?? {}
    const rawList: MemberApiItem[] = Array.isArray(data.items) ? data.items : []
    let currentPage: number = typeof data.page === 'number' ? data.page : page
    let totalPages: number | null = typeof data.totalPages === 'number' ? data.totalPages : null

    if (totalPages == null && typeof data.total === 'number' && typeof data.pageSize === 'number' && data.pageSize > 0) {
        totalPages = Math.ceil(data.total / data.pageSize)
    }

    const toDate = (v: string | number | undefined) => {
        if (v == null) return new Date()
        if (typeof v === 'number') {
            const ms = v < 1e12 ? v * 1000 : v
            return new Date(ms)
        }
        return new Date(v)
    }

    // 서버 -> 프론트 모델 매핑
    const toMealType = (val: boolean | 'lunch' | 'outside' | undefined): 'lunch' | 'outside' => {
        if (val === 'lunch' || val === true) return 'lunch';
        return 'outside';
    };

    const items: BrushingRecord[] = rawList.map((m) => {
        const resolvedClassName =
            (m.className && String(m.className).trim()) ||
            ((m.grade ?? '') !== '' && (m.classroom ?? '') !== ''
                ? `${m.grade}-${m.classroom}반`
                : (m.gradeClass && String(m.gradeClass).trim()) || '미정');

        const rawTime = m.createdAt ?? m.brushingTime;

        return {
            id: String(m.id),
            name: m.name,
            className: resolvedClassName,
            // (참고) Vite public 자산은 루트로 서빙됨: '/assets/images/...'
            profileImage: m.gender === '남자' ? '/assets/images/man.png' : '/assets/images/woman.png',
            brushingTime: toDate(rawTime),
            mealType: toMealType(m.lunch),
            duration: typeof m.duration === 'number' ? m.duration : 0,
        };
    });

    return {items, page: currentPage, totalPages}
}

/* =========================
 * Provider
 * ========================= */
export const RankingProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [records, setRecords] = useState<BrushingRecord[]>([])
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isInitialized, setIsInitialized] = useState(false)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState<number | null>(null)

    useEffect(() => {
        let aborted = false
        ;(async () => {
            setIsLoading(true)
            try {
                const {items, totalPages: serverTotal} = await fetchMembersPage(page)
                if (aborted) return
                setRecords(items)
                setTotalPages(serverTotal)
                setIsInitialized(true)
            } catch (err) {
                console.error('❌ 서버에서 멤버 로드 실패, localStorage로 fallback:', err)
                const cache = loadRecordsFromStorage()
                if (!aborted) {
                    setRecords(cache)
                    setTotalPages(null)
                    setIsInitialized(true)
                }
            } finally {
                if (!aborted) {
                    setCurrentUserRank(loadCurrentUserRank())
                    setIsLoading(false)
                }
            }
        })()
        return () => {
            aborted = true
        }
    }, [page])

    useEffect(() => {
        if (isInitialized && !isLoading && records.length > 0) {
            saveRecordsToStorage(records)
        }
    }, [records, isLoading, isInitialized])

    useEffect(() => {
        if (isInitialized && !isLoading) {
            saveCurrentUserRank(currentUserRank)
        }
    }, [currentUserRank, isLoading, isInitialized])

    const calculateRanking = useCallback((recs: BrushingRecord[]): RankedUser[] => {
        const sorted = [...recs].sort((a, b) => {
            const dt = a.brushingTime.getTime() - b.brushingTime.getTime()
            return dt !== 0 ? dt : a.id.localeCompare(b.id)
        })
        return sorted.map((record, idx) => ({
            ...record,
            rank: idx + 1,
            borderColor: getRankBorderColor(idx + 1),
        }))
    }, [])

    const rankedUsers = calculateRanking(records)

    const addRecord = useCallback((newRecord: Omit<BrushingRecord, 'id'>) => {
        const record: BrushingRecord = {
            ...newRecord,
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        }
        setRecords(prev => [...prev, record])
        const tempRanked = calculateRanking([...records, record])
        const newUserRank = tempRanked.find(u => u.id === record.id)?.rank ?? null
        setCurrentUserRank(newUserRank)
    }, [records, calculateRanking])

    const setCurrentUser = useCallback((userId: string) => {
        const userRank = rankedUsers.find(user => user.id === userId)?.rank ?? null
        setCurrentUserRank(userRank)
    }, [rankedUsers])

    const getCurrentUserRecord = useCallback((): RankedUser | null => {
        if (currentUserRank == null) return null
        return rankedUsers.find(u => u.rank === currentUserRank) ?? null
    }, [rankedUsers, currentUserRank])

    const clearAllRecords = useCallback(() => {
        setRecords(getInitialRecords())
        setCurrentUserRank(null)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(CURRENT_USER_KEY)
    }, [])

    return (
        <RankingContext.Provider
            value={{
                records,
                rankedUsers,
                currentUserRank,
                isLoading,
                page,
                totalPages,
                setPage,
                addRecord,
                setCurrentUser,
                getCurrentUserRecord,
                clearAllRecords,
            }}
        >
            {children}
        </RankingContext.Provider>
    )
}

/* =========================
 * Hook
 * ========================= */
export const useRanking = () => {
    const context = useContext(RankingContext)
    if (context === undefined) throw new Error('useRanking must be used within a RankingProvider')
    return context
}
