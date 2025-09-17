// src/components/RankingSection.tsx
import React, {useEffect, useMemo, useState} from 'react'
import UserListItem from './UserListItem'
import {splitKoKRDateTime} from "../utils/koreanDateTime.ts";
import NoneLayer from "../components/ranking/NoneLayer.tsx";

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

/** API → 화면 모델 매핑 */
const mapApiToRankingUser = (item: MembersApiItem, rank: number): RankingUser => {
    const borderColor =
        rank === 1 ? '#F56358' :
            rank === 2 ? '#F46059' :
                rank === 3 ? '#F89049' : '';

    const profileImage =
        item.gender === '남자'
            ? '/public/assets/images/man.png'
            : '/public/assets/images/woman.png';

    return {
        rank,
        name: item.name,
        className: item.gradeClass,
        time: splitKoKRDateTime(item.createdAt).timeRaw,
        profileImage,
        borderColor,
        mealType: item.lunch,
    };
};


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

// 가장 이른 시간 순(오름차순), 동률이면 id 오름차순
const byCreatedAtAsc = (a: MembersApiItem, b: MembersApiItem) => {
    const ta = Date.parse(a.createdAt);
    const tb = Date.parse(b.createdAt);
    if (ta !== tb) return ta - tb;
    return a.id - b.id;
};

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
                const res = await fetch(`http://localhost:3001/api/members?page=${page}&lunchOnly=true`)
                if (!res.ok) throw new Error(`HTTP ${res.status}`)

                const json: MembersApiResponse = await res.json();

                // 전역 랭크 계산을 위한 페이지/사이즈
                const cur = json.data?.page ?? page;
                const size = json.data?.pageSize ?? 5;
                const baseRank = (cur - 1) * size;

                // 혹시 서버가 정렬 안 해줄 수도 있으니 방어적으로 재정렬
                const users = (json.data?.items ?? [])
                    .slice()
                    .sort(byCreatedAtAsc)                 // ← 시간 가장 이른 순으로 확정
                    .map((it, idx) => mapApiToRankingUser(it, baseRank + idx + 1)); // 1부터 시작 + 페이지 오프셋

                setMembers(users);
                setTotalPages(json.data?.totalPages ?? 1);

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
                <div style={{
                    justifyContent: 'flex-start', alignItems: 'center', gap: '18px', display: 'inline-flex'
                }}>
                    <button
                        type="button"
                        aria-label="이전 페이지"
                        tabIndex={-1}                          // 포커스 링 방지
                        onMouseDown={(e) => e.preventDefault()} // 클릭 시 포커스 주지 않기
                        onPointerDown={() => {
                        }}                // 필요 시 active 관리용(빈 핸들러 OK)
                        onPointerUp={() => {
                        }}
                        onPointerCancel={() => {
                        }}
                        onPointerLeave={() => {
                        }}
                        onContextMenu={(e) => e.preventDefault()} // 길게 눌러 컨텍스트 메뉴 방지
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        style={{
                            display: "flex", alignItems: "flex-end", justifyContent: "start",
                            width: '340px',
                            marginLeft: '32px', marginTop: '24px', borderRadius: 8,
                            background: 'transparent', border: 'none', padding: 0,
                            cursor: page <= 1 ? 'not-allowed' : 'pointer',

                            // 잔상/하이라이트/선택 방지
                            outline: 'none',
                            WebkitTapHighlightColor: 'transparent' as any,
                            userSelect: 'none',
                            WebkitUserSelect: 'none' as any,
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            appearance: 'none' as any,
                            WebkitAppearance: 'none' as any,
                            touchAction: 'manipulation',
                        }}
                    >
                        <img src="/public/assets/icon/left.svg" alt="prev" draggable={false}/>
                    </button>

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
                            display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                            width: '340px',
                            marginLeft: '32px', marginTop: '24px', borderRadius: 8,
                            background: 'transparent', border: 'none', padding: 0,
                            cursor: page <= 1 ? 'not-allowed' : 'pointer',

                            // 잔상/하이라이트/선택 방지
                            outline: 'none',
                            WebkitTapHighlightColor: 'transparent' as any,
                            userSelect: 'none',
                            WebkitUserSelect: 'none' as any,
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            appearance: 'none' as any,
                            WebkitAppearance: 'none' as any,
                            touchAction: 'manipulation',
                        }}
                    >
                        <img src="/public/assets/icon/right.svg" alt="next"/>
                    </button>
                </div>
            </div>

            {/* 1페이지: 상단 1·2·3 */}
            {members.length === 0 &&
                <NoneLayer />
            }
            {page === 1 && members.length > 0 && (
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
                                    {user.className == '' ? '미확인' : user.className} {user.name}
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
                                    {user.mealType ? (
                                        <div style={{
                                            width: '80px',
                                            height: '50px',
                                            background: '#B2D7FF',
                                            borderRadius: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 10,
                                            display: 'inline-flex',
                                        }}>
                                            <div style={{
                                                color: '#227EFF',
                                                fontSize: '16px',
                                                fontFamily: 'Pretendard',
                                                fontWeight: 600,
                                                textAlign: 'center'
                                            }}>
                                                점심
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{
                                            width: '80px',
                                            height: '50px',
                                            background: '#FEEAE2',
                                            borderRadius: 16,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: 10,
                                            display: 'inline-flex',
                                        }}>
                                            <div style={{
                                                color: '#E5621C',
                                                fontSize: '16px',
                                                fontFamily: 'Pretendard',
                                                fontWeight: 600,
                                                textAlign: 'center'
                                            }}>
                                                외
                                            </div>
                                        </div>
                                    )}

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
