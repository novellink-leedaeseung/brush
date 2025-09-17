import React, {useEffect, useState, useMemo} from 'react'
import UserListItem from './UserListItem'

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

interface RankingUser {
    rank: number
    name: string
    className: string
    time: string
    profileImage: string
    borderColor: string
    mealType: 'lunch' | 'outside'
}

const formatKoreanTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('ko-KR', {hour12: true})

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
        mealType: item.lunch ? 'lunch' : 'outside'
    }
}

const RankingSection: React.FC = () => {
    const [members, setMembers] = useState<RankingUser[]>([])

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/members?page=1')
                const json: MembersApiResponse = await res.json()
                const users = (json.data?.items ?? []).map(mapApiToRankingUser)
                setMembers(users)
            } catch (e) {
                console.error('API 불러오기 실패', e)
            }
        }
        fetchMembers()
    }, [])

    const {topThree, otherUsers} = useMemo(() => {
        const top = members.filter(u => [1, 2, 3].includes(u.rank))
        const others = members.filter(u => [4, 5].includes(u.rank))
        return {topThree: top, otherUsers: others}
    }, [members])

    /** ======= 기존 디자인 함수들 유지 ======= */
    const getRankStyle = (rank: number) => {
        if (rank === 1) return {width: '240px', height: '240px', top: '15px', left: '420px'}
        if (rank === 2) return {width: '204px', height: '204px', top: '51px', left: '52px'}
        return {width: '204px', height: '204px', top: '51px', left: '824px'}
    }

    const getRankBadgeStyle = (rank: number) => {
        const base = {
            position: 'absolute' as const,
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
        }
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

    return (
        <>
            {/* 헤더 */}
            <div style={{width: '1080px', height: '120px', position: 'relative', background: 'white'}}>
                <div style={{
                    left: '425px', top: '32px', position: 'absolute',
                    display: 'inline-flex', alignItems: 'center', gap: '18px'
                }}>
                    <div style={{fontSize: '40px', fontFamily: 'Pretendard', fontWeight: 600, color: '#111111'}}>
                        오늘의 양치왕
                    </div>
                    <img src="/public/assets/icon/trophy.svg" alt="트로피" width={52} height={52}/>
                </div>
            </div>

            {/* 상위 3명 */}
            <div style={{width: '1080px', height: '368px', position: 'relative', borderBottom: '0.5px #B4B4B5 solid'}}>
                {topThree.map(user => {
                    const rankStyle = getRankStyle(user.rank)
                    const badgeStyle = getRankBadgeStyle(user.rank)
                    const namePos = getNamePosition(user.rank)
                    const timePos = getTimePosition(user.rank)
                    const mealPos = getMealTagPosition(user.rank)

                    return (
                        <React.Fragment key={user.rank}>
                            {/* 프로필 */}
                            <img style={{
                                ...rankStyle, position: 'absolute', borderRadius: '999px',
                                border: `3px ${user.borderColor} solid`
                            }} src={user.profileImage} alt={user.name}/>
                            {/* 랭킹 배지 */}
                            <div style={badgeStyle}>{user.rank}</div>
                            {/* 이름 */}
                            <div style={{
                                ...namePos,
                                position: 'absolute', // 5-1반 이서연
                                width: '250px',
                                height: '86px',
                                color: '#111111',
                                fontSize: 36,
                                fontFamily: 'Pretendard',
                                fontWeight: '600',
                                lineHeight: "56px",
                                textAlign: 'center',
                            }}>
                                {user.className} {user.name}
                            </div>
                            {/* 시간 */}
                            <div style={{...timePos, position: 'absolute', fontSize: '32px', color: '#4C4948'}}>
                                {user.time}
                            </div>
                            {/* 식사 태그 */}
                            <div style={{...mealPos, position: 'absolute', width:50, height:40, background: '#B2D7FF', borderRadius: 8}}>
                                <div style={{color: '#227EFF', width:"35px", height: "18px", fontSize: '16px', fontWeight: 600, lineHeight: "16px", marginLeft: '7.5px', marginTop: '11px', textAlign: 'center'}}>
                                    {user.mealType === 'lunch' ? '점심' : '외'}
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
            </div>

            {/* 4,5등 리스트 */}
            {otherUsers.map((user, idx) => (
                <UserListItem
                    key={user.rank}
                    rank={user.rank}
                    name={user.name}
                    className={user.className}
                    time={user.time}
                    profileImage={user.profileImage}
                    mealType={user.mealType}
                    isLast={idx === otherUsers.length - 1}
                />
            ))}
        </>
    )
}

export default RankingSection
