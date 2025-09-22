// src/components/RankingSection.tsx
import React, {useEffect, useMemo, useState} from "react";
import UserListItem from "./UserListItem";
import {splitKoKRDateTime} from "../utils/koreanDateTime.ts";
import NoneLayer from "../components/ranking/NoneLayer.tsx";

/** ===== API 타입 ===== */
interface MembersApiItem {
    id: number;
    name: string;
    gradeClass: string;
    lunch: boolean;
    gender: string;
    createdAt: string;
}

interface MembersApiResponse {
    success: boolean;
    data: {
        items: MembersApiItem[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

/** ===== 화면 표시용 타입 ===== */
interface RankingUser {
    rank: number;
    name: string;
    className: string;
    time: string;
    profileImage: string;
    borderColor: string;
    mealType: boolean;
    isVacant?: boolean; // 빈자리 여부
}

const PLACEHOLDER_IMG = "/public/assets/icon/user.svg";

const makeVacantUser = (rank: number): RankingUser => ({
    rank,
    name: "현재 빈자리에요!",
    className: "",
    time: "",
    profileImage: PLACEHOLDER_IMG, // 상단(1~3)에서도 써야 하니 기본 아이콘 유지
    borderColor: "#B5B5B6",
    mealType: false,
    isVacant: true,
});

/** API → 화면 모델 매핑 */
const mapApiToRankingUser = (item: MembersApiItem, rank: number): RankingUser => {
    const borderColor =
        rank === 1 ? "#F56358" : rank === 2 ? "#F46059" : rank === 3 ? "#F89049" : "";

    const profileImage =
        item.gender === "남자"
            ? "/public/assets/images/man.png"
            : "/public/assets/images/woman.png";

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

/** ===== 등수별 위치/스타일 ===== */
const getRankStyle = (rank: number) => {
    if (rank === 1) return {width: "240px", height: "240px", top: "15px", left: "420px"};
    if (rank === 2) return {width: "204px", height: "204px", top: "51px", left: "52px"};
    return {width: "204px", height: "204px", top: "51px", left: "824px"}; // 3등
};
const getRankBadgeStyle = (rank: number) => {
    const base: React.CSSProperties = {
        position: "absolute",
        borderRadius: "999px",
        border: "2px white solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "Inter",
        fontWeight: 600,
    };
    if (rank === 1)
        return {
            ...base,
            width: "68px",
            height: "68px",
            left: "590px",
            top: "198px",
            background: "linear-gradient(180deg, #F4585C 0%, #F89846 100%)",
            fontSize: "32px",
        };
    if (rank === 2)
        return {
            ...base,
            width: "52px",
            height: "52px",
            left: "202px",
            top: "201px",
            background: "#F56159",
            fontSize: "26px",
        };
    return {
        ...base,
        width: "52px",
        height: "52px",
        left: "974px",
        top: "201px",
        background: "#F89148",
        fontSize: "26px",
    }; // 3등
};
const getNamePosition = (rank: number) =>
    rank === 1 ? {left: "415px", top: "268px"} : rank === 2 ? {left: "29px", top: "268px"} : {
        left: "801px",
        top: "268px"
    };
const getTimePosition = (rank: number) =>
    rank === 1 ? {left: "414px", top: "311px"} : rank === 2 ? {left: "28px", top: "311px"} : {
        left: "800px",
        top: "311px"
    };

/** 가장 이른 시간 순(오름차순), 동률이면 id 오름차순 */
const byCreatedAtAsc = (a: MembersApiItem, b: MembersApiItem) => {
    const ta = Date.parse(a.createdAt);
    const tb = Date.parse(b.createdAt);
    if (ta !== tb) return ta - tb;
    return a.id - b.id;
};

/** ===== 메인 컴포넌트 ===== */
const RankingSection: React.FC = () => {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [members, setMembers] = useState<RankingUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(
                    `http://localhost:3001/api/members?page=${page}&lunchOnly=true`
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const json: MembersApiResponse = await res.json();

                // 페이지/사이즈 기준 전역 랭크 부여
                const cur = json.data?.page ?? page;
                const size = json.data?.pageSize ?? 5;
                const baseRank = (cur - 1) * size;

                const users = (json.data?.items ?? [])
                    .slice()
                    .sort(byCreatedAtAsc)
                    .map((it, idx) => mapApiToRankingUser(it, baseRank + idx + 1));

                setMembers(users);
                setTotalPages(json.data?.totalPages ?? 1);
            } catch (e: any) {
                setError(e?.message ?? "데이터를 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, [page]);

    // 1페이지: 상단 1·2·3 + 리스트(4,5는 빈자리 채움)
    // 1페이지: 상단 1·2·3 + 리스트(4,5는 '1등이 있을 때만' 빈자리 채움)
    const {topThree, listUsers} = useMemo(() => {
        if (page !== 1) {
            // 2페이지 이상은 그대로 5명 리스트
            return {topThree: [] as RankingUser[], listUsers: members};
        }

        // 1등 존재 여부
        const hasFirst = members.some((u) => u.rank === 1);

        // 상단 1~3: 기존 로직 유지 (없으면 빈자리로)
        const topMap = new Map<number, RankingUser>();
        members.forEach((u) => {
            if (u.rank >= 1 && u.rank <= 3) topMap.set(u.rank, u);
        });
        const top = [1, 2, 3].map((r) => topMap.get(r) ?? makeVacantUser(r));

        // 리스트 4~5: ✅ 1등이 있을 때만 빈자리/데이터 채움
        //            ✅ 1등이 없으면 아예 표시하지 않음([])
        const list = hasFirst
            ? [4, 5].map((r) => members.find((u) => u.rank === r) ?? makeVacantUser(r))
            : [];

        return {topThree: top, listUsers: list};
    }, [members, page]);

    if (loading) return <div style={{padding: 24}}>불러오는 중…</div>;
    if (error) return <div style={{padding: 24, color: "#d33"}}>에러: {error}</div>;

    return (
        <>
            {/* 헤더 */}
            <div
                style={{
                    width: "1080px",
                    height: "120px",
                    position: "relative",
                    background: "white",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: "18px",
                        display: "inline-flex",
                    }}
                >
                    <button
                        type="button"
                        aria-label="이전 페이지"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "start",
                            width: "340px",
                            marginLeft: "32px",
                            marginTop: "24px",
                            borderRadius: 8,
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: page <= 1 ? "not-allowed" : "pointer",
                            outline: "none",
                            WebkitTapHighlightColor: "transparent" as any,
                            userSelect: "none",
                            WebkitUserSelect: "none" as any,
                            MozUserSelect: "none",
                            msUserSelect: "none",
                            appearance: "none" as any,
                            WebkitAppearance: "none" as any,
                            touchAction: "manipulation",
                        }}
                    >
                        <img src="/public/assets/icon/left.svg" alt="prev" draggable={false}/>
                    </button>

                    <div
                        style={{
                            justifyContent: "center",
                            display: "flex",
                            flexDirection: "column",
                            color: "#111111",
                            fontSize: "40px",
                            fontFamily: "Pretendard",
                            fontWeight: 600,
                            lineHeight: "56px",
                        }}
                    >
                        오늘의 양치왕
                    </div>
                    <div style={{width: "52px", height: "52px", position: "relative", overflow: "hidden"}}>
                        <img src="/assets/icon/trophy.svg" alt="트로피"/>
                    </div>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            width: "340px",
                            marginLeft: "32px",
                            marginTop: "24px",
                            borderRadius: 8,
                            background: "transparent",
                            border: "none",
                            padding: 0,
                            cursor: page >= totalPages ? "not-allowed" : "pointer",
                            outline: "none",
                            WebkitTapHighlightColor: "transparent" as any,
                            userSelect: "none",
                            WebkitUserSelect: "none" as any,
                            MozUserSelect: "none",
                            msUserSelect: "none",
                            appearance: "none" as any,
                            WebkitAppearance: "none" as any,
                            touchAction: "manipulation",
                        }}
                    >
                        <img src="/public/assets/icon/right.svg" alt="next"/>
                    </button>
                </div>
            </div>

            {/* 빈 목록 레이어 */}
            {members.length === 0 && <NoneLayer/>}

            {/* 1페이지: 상단 1·2·3 */}
            {page === 1 && members.length > 0 && (
                <div
                    style={{
                        width: "1080px",
                        height: "388px",
                        position: "relative",
                        overflow: "hidden",
                        borderBottom: "0.50px #B4B4B5 solid",
                    }}
                >
                    {topThree.map((user) => {
                        const rankStyle = getRankStyle(user.rank);
                        const badgeStyle = getRankBadgeStyle(user.rank);
                        const namePos = getNamePosition(user.rank);
                        const timePos = getTimePosition(user.rank);

                        return (
                            <React.Fragment key={user.rank}>
                                {/* 프로필 (div 래핑) */}
                                <div
                                    style={{
                                        ...rankStyle,
                                        position: "absolute",
                                        borderRadius: "999px",
                                        border: `3px ${user.isVacant ? "#B5B5B6" : user.borderColor} solid`,
                                        background: user.isVacant ? "#fff" : "transparent",
                                        overflow: "hidden",
                                        boxSizing: "border-box",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <img
                                        src={user.profileImage}
                                        alt={user.isVacant ? "빈자리" : user.name}
                                        draggable={false}
                                        style={{
                                            width: `${user.isVacant ? 120 : 240}px`,
                                            height: "100%",
                                            objectFit: user.isVacant ? "contain" : "cover",
                                            display: "block",
                                        }}
                                    />
                                </div>

                                {/* 랭킹 배지 */}
                                <div style={badgeStyle}>{user.rank}</div>

                                {/* 이름 */}
                                <div
                                    style={{
                                        ...namePos,
                                        position: "absolute",
                                        width: "250px",
                                        height: "43px",
                                        color: user.isVacant ? "#7A7A7A" : "#111111",
                                        fontSize: 36,
                                        fontFamily: "Pretendard",
                                        fontWeight: 600,
                                        lineHeight: "56px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {user.isVacant
                                        ? "현재 빈자리에요!"
                                        : `${user.className === "" ? "미확인" : user.className + "반"} ${user.name}`}
                                </div>

                                {/* 시간/식사태그 — 빈자리는 숨김 */}
                                {!user.isVacant && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: (timePos as any).left,
                                            top: (timePos as any).top,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                        }}
                                    >
                                        <div style={{fontSize: "32px", color: "#4C4948"}}>{user.time}</div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            )}

            {/* 리스트: 1페이지는 4·5(빈자리 채움), 나머지는 그대로 */}
            {(page === 1 ? listUsers : members).map((user, idx, arr) =>
                user.isVacant ? (
                    // 빈자리 전용 행 (사람 아이콘 + 회색 텍스트)
                    <div
                        key={`vacant-${user.rank}`}
                        style={{
                            height: 150,
                            display: "flex",
                            alignItems: "center",
                            borderBottom: idx === arr.length - 1 ? "none" : "1px solid #EDEDED",
                            background: "#fff",
                        }}
                    >
                        <div style={{// 4
                            fontSize: 32,
                            fontFamily: 'Pretendard',
                            fontWeight: '600',
                            lineHeight: "56px",
                            wordWrap: 'break-word',
                            width: 40,
                            color: "#4B4948",
                            marginLeft: '32px',

                        }}>
                            {user.rank}
                        </div>
                        <div
                            style={{
                                width: 86,
                                height: 86,
                                borderRadius: "50%",
                                border: "1px solid #E5E5E5",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="8" r="4" stroke="#B5B5B6" strokeWidth="1.5"/>
                                <path
                                    d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"
                                    stroke="#B5B5B6"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div style={{// 현재 빈자리예요!
                            color: '#4C4948',
                            height: "150px",
                            width: "300px",
                            fontSize: 32,
                            fontFamily: 'Pretendard',
                            fontWeight: '400',
                            lineHeight: "56px",
                            letterSpacing: "-0.25px",
                            wordWrap: 'break-word',
                            alignContent: "center",
                            marginLeft: "32px",
                        }}>
                            현재 빈자리에요!
                        </div>
                    </div>
                ) : (
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
                )
            )}
        </>
    );
};

export default RankingSection;
