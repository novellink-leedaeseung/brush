// src/components/RankingSection.tsx
import React, {useEffect, useMemo, useState} from 'react'
import UserListItem from './UserListItem'

/** ===== API 타입 ===== */
interface MembersApiItem {
    id: number
    name: string
    gradeClass: string
    lunch: boolean
    gender: string
    createdAt: string
}

interface MembersApiResponse {
    success: boolean
    data: {
        items: MembersApiItem[]
        total: number
        page: number
        pageSize: number
        totalPages: number
    }
}

/** ===== 화면 표시용 타입 ===== */
interface RankingUser {
    rank: number
    name: string
    className: string
    time: string
    profileImage: string
    borderColor: string
    // UserListItem은 boolean을 기대하므로 boolean으로 유지
    mealType: boolean
}

/** 시간 포맷: "오전/오후 HH:MM:SS" */
const formatKoreanTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', {hour12: true})

/** API → 화면 모델 매핑 */
const mapApiToRankingUser = (item: MembersApiItem): RankingUser => {
    const rank = item.id
    const borderColor =
        rank === 1 ? '#F56358'
            : rank === 2 ? '#F46059'
                : rank === 3 ? '#F89049'
                    : ''

    const profileImage =
        item.gender === '남자'
            ? '/public/assets/images/man.png'
            : '/public/assets/images/woman.png'

    return {
        rank,
        name: item.name,
        className: item.gradeClass,
        time: formatKoreanTime(item.createdAt),
        profileImage,
        borderColor,
        mealType: item.lunch, // boolean 유지
    }
}

/** ===== 등수별 위치/스타일(디자인 그대로) ===== */
const getRankStyle = (rank: number) => {
    if (rank === 1) return {width: '240px', height: '240px', top: '15px', left: '420px'}
    if (rank === 2) return {width: '204px', height: '204px', top: '51px', left: '52px'}
    return {width: '204px', height: '204px', top: '51px', left: '824px'} // 3등
}
const getRankBadgeStyle = (rank: number) => {
    const base: React.CSSProperties = {
        position: 'absolute',
        borderRadius: '999px',
        border: '2px white solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter',
        fontWeight: 600
    }
    if (rank === 1) return {
        ...base, width: '68px', height: '68px', left: '590px', top: '198px',
        background: 'linear-gradient(180deg, #F4585C 0%, #F89846 100%)', fontSize: '32px'
    }
    if (rank === 2) return {
        ...base, width: '52px', height: '52px', left: '202px', top: '201px',
        background: '#F56159', fontSize: '26px'
    }
    return {
        ...base, width: '52px', height: '52px', left: '974px', top: '201px',
        background: '#F89148', fontSize: '26px'
    } // 3등
}
const getNamePosition = (rank: number) =>
    rank === 1 ? {left: '415px', top: '268px'}
        : rank === 2 ? {left: '29px', top: '268px'}
            : {left: '801px', top: '268px'}
const getTimePosition = (rank: number) =>
    rank === 1 ? {left: '414px', top: '311px'}
        : rank === 2 ? {left: '28px', top: '311px'}
            : {left: '800px', top: '311px'}
const getMealTagPosition = (rank: number) =>
    rank === 1 ? {left: '604px', top: '313px'}
        : rank === 2 ? {left: '218px', top: '313px'}
            : {left: '990px', top: '313px'}

/** ===== 메인 컴포넌트 ===== */
const RankingSection: React.FC = () => {
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [members, setMembers] = useState<RankingUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`http://localhost:3001/api/members?page=${page}`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                const json: MembersApiResponse = await res.json()

                const users = (json.data?.items ?? []).map(mapApiToRankingUser)
                setMembers(users)
                setTotalPages(json.data?.totalPages ?? 1)
            } catch (e: any) {
                setError(e?.message ?? '데이터를 불러오지 못했습니다.')
            } finally {
                setLoading(false)
            }
        }
        fetchMembers()
    }, [page])

    // 1페이지일 때만 상단 1·2·3 분리, 4·5 목록. 그 외 페이지는 모두 목록으로 처리.
    const {topThree, otherUsers, listOnly} = useMemo(() => {
        if (page !== 1) {
            return {topThree: [] as RankingUser[], otherUsers: [] as RankingUser[], listOnly: members}
        }
        const top = members.filter(u => [1, 2, 3].includes(u.rank))
        const others = members.filter(u => [4, 5].includes(u.rank))
        return {topThree: top, otherUsers: others, listOnly: [] as RankingUser[]}
    }, [members, page])

    if (loading) return <div style={{padding: 24}}>불러오는 중…</div>
    if (error) return <div style={{padding: 24, color: '#d33'}}>에러: {error}</div>

    return (
        <>
            {/* 헤더 (좌/우 페이지 네비게이션 포함) */}
            <div style={{
                width: '1080px',
                height: '120px',
                position: 'relative',
                background: 'white',
                overflow: 'hidden'
            }}>
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    style={{
                        marginLeft: '32px', marginTop: '24px', borderRadius: 8,
                        background: 'transparent', border: 'none', padding: 0,
                        cursor: page <= 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    <img src="/public/assets/icon/left.svg" alt="prev"/>
                </button>

                <div style={{
                    left: '425px', top: '24px', position: 'absolute',
                    justifyContent: 'flex-start', alignItems: 'center', gap: '18px', display: 'inline-flex'
                }}>
                    <div style={{
                        justifyContent: 'center', display: 'flex', flexDirection: 'column',
                        color: '#111111', fontSize: '40px', fontFamily: 'Pretendard',
                        fontWeight: 600, lineHeight: '56px'
                    }}>
                        오늘의 양치왕
                    </div>
                    <div style={{width: '52px', height: '52px', position: 'relative', overflow: 'hidden'}}>
                        <img src="/assets/icon/trophy.svg" alt="트로피"/>
                    </div>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        style={{
                            marginLeft: '260px', borderRadius: 8,
                            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                            background: 'transparent', border: 'none', padding: 0
                        }}
                    >
                        <img src="/public/assets/icon/right.svg" alt="next"/>
                    </button>
                </div>
            </div>

            {/* 1페이지: 상단 1·2·3 */}
            {page === 1 && (
                <div style={{
                    width: '1080px', height: '388px', position: 'relative',
                    overflow: 'hidden', borderBottom: '0.50px #B4B4B5 solid',
                }}>
                    {topThree.map(user => {
                        const rankStyle = getRankStyle(user.rank)
                        const badgeStyle = getRankBadgeStyle(user.rank)
                        const namePos = getNamePosition(user.rank)
                        const timePos = getTimePosition(user.rank)
                        const mealPos = getMealTagPosition(user.rank)

                        return (
                            <React.Fragment key={user.rank}>
                                {/* 프로필 */}
                                <img
                                    style={{
                                        ...rankStyle,
                                        position: 'absolute',
                                        borderRadius: '999px',
                                        border: `3px ${user.borderColor} solid`
                                    }}
                                    src={user.profileImage}
                                    alt={user.name}
                                />
                                {/* 랭킹 배지 */}
                                <div style={badgeStyle}>{user.rank}</div>

                                {/* 이름 */}
                                <div style={{
                                    ...namePos, position: 'absolute', width: '250px', height: '43px',
                                    color: '#111111', fontSize: 36, fontFamily: 'Pretendard',
                                    fontWeight: 600, lineHeight: '56px',
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",

                                }}>
                                    {user.className} {user.name}
                                </div>


                                {/* 시간 + 식사 태그 (같은 컨테이너) */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: (timePos as any).left,
                                        top: (timePos as any).top,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                    }}
                                >
                                    {/* 시간 */}
                                    <div style={{fontSize: '32px', color: '#4C4948'}}>
                                        {user.time}
                                    </div>

                                    {/* 식사 태그 */}
                                    <div
                                        style={{
                                            width: 50,
                                            height: 40,
                                            background: '#B2D7FF',
                                            borderRadius: 8,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <div
                                            style={{
                                                color: '#227EFF',
                                                fontSize: '16px',
                                                fontFamily: 'Pretendard',
                                                fontWeight: 600,
                                                lineHeight: '16px',
                                            }}
                                        >
                                            {user.mealType ? '점심' : '외'}
                                        </div>
                                    </div>
                                </div>

                            </React.Fragment>
                        )
                    })}
                </div>
            )}

            {/* 목록: 1페이지는 4·5등만, 나머지 페이지는 해당 페이지의 전체 5명 */}
            {(page === 1 ? otherUsers : listOnly).map((user, idx, arr) => (
                <UserListItem
                    key={user.rank}
                    rank={user.rank}
                    name={user.name}
                    className={user.className}
                    time={user.time}
                    profileImage={user.profileImage}
                    mealType={user.mealType}
                    isLast={idx === arr.length - 1}
                />
            ))}
        </>
    )
}

export default RankingSection
