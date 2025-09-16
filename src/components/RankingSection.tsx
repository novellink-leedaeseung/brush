// RankingSection.tsx (교체/수정)
import React, {useMemo} from 'react'
import {useRanking} from '../contexts/RankingContext'
import UserListItem from './UserListItem'

const PAGE_SIZE = 5

const RankingSection: React.FC = () => {
    const {
        rankedUsers,
        currentUserRank,
        isLoading,
        page,
        totalPages,
        setPage,
    } = useRanking()

    if (isLoading) {
        return (
            <div style={{
                width: '1080px',
                height: '800px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '20px',
                backgroundColor: 'white'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    border: '8px solid #E5E7EB',
                    borderTop: '8px solid #22C55E',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}/>
                <div style={{fontSize: '36px', fontFamily: 'Pretendard', fontWeight: 500, color: '#6B7280'}}>
                    랭킹 데이터를 불러오는 중...
                </div>
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        )
    }

    const formatTime = (dt: Date | string): string => {
        const date = dt instanceof Date ? dt : new Date(dt)
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        })
    }

    // 총 페이지 수: 서버에서 내려주면 그 값 사용, 없으면 클라이언트에서 계산
    const computedTotalPages = useMemo(() => {
        return totalPages ?? Math.max(1, Math.ceil(rankedUsers.length / PAGE_SIZE))
    }, [totalPages, rankedUsers.length])

    // 현재 페이지의 구간 계산 (서버 페이징 시 rankedUsers가 이미 해당 페이지라면 slice가 0~PAGE_SIZE로 동일 동작)
    const pagedUsers = useMemo(() => {
        if (totalPages) {
            // 서버가 페이지 단위로 내려주는 경우: 상위 5명만 노출(디자인 스펙 유지)
            return rankedUsers.slice(0, PAGE_SIZE)
        }
        const start = (page - 1) * PAGE_SIZE
        const end = start + PAGE_SIZE
        return rankedUsers.slice(start, end)
    }, [rankedUsers, page, totalPages])

    return (
        <>
            {/* 헤더 */}
            <div style={{
                width: '1080px',
                height: '120px',
                position: 'relative',
                background: 'white',
                overflow: 'hidden'
            }}>
                <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    style={{
                        marginLeft: '32px',
                        marginTop: '24px',
                        borderRadius: 8,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: page <= 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    <img src="/public/assets/icon/left.svg" alt=""/>
                </button>
                <div style={{
                    left: '425px',
                    top: '24px',
                    position: 'absolute',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '18px',
                    display: 'inline-flex'
                }}>
                    <div style={{
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        color: '#111111',
                        fontSize: '40px',
                        fontFamily: 'Pretendard',
                        fontWeight: 600,
                        lineHeight: '56px',
                        wordWrap: 'break-word'
                    }}>
                        오늘의 양치왕
                    </div>
                    <div style={{width: '52px', height: '52px', position: 'relative', overflow: 'hidden'}}>
                        <img src="/assets/icon/trophy.svg" alt="트로피"/>
                    </div>
                    <button
                        onClick={() => setPage(Math.min(computedTotalPages, page + 1))}
                        disabled={page >= computedTotalPages}
                        style={{
                            marginLeft: '260px',
                            borderRadius: 8,
                            cursor: page >= computedTotalPages ? 'not-allowed' : 'pointer',
                            background: "transparent",
                            border: "none",
                            padding: 0,
                        }}
                    >
                        <img src="/public/assets/icon/right.svg" alt=""/>
                    </button>
                </div>


                {/* 페이지 네비게이션 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>

                    {/*<span style={{ fontFamily: 'Pretendard', color: '#6B7280' }}>
            {page} / {computedTotalPages}
          </span>*/}
                </div>
            </div>

            {/* 목록 */}
            {pagedUsers.length === 0 ? (
                <div style={{
                    width: '1080px',
                    height: '240px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9CA3AF',
                    fontFamily: 'Pretendard',
                    fontSize: 24,
                    background: 'white',
                    borderTop: '1px solid #F3F4F6'
                }}>
                    데이터가 없습니다.
                </div>
            ) : (
                pagedUsers.map((user, index) => (
                    <UserListItem
                        key={user.id}
                        rank={user.rank}
                        name={user.name}
                        className={user.className}
                        time={formatTime(user.brushingTime)}
                        profileImage={user.profileImage}
                        mealType={user.mealType}
                        isLast={index === pagedUsers.length - 1}
                        isCurrentUser={currentUserRank === user.rank}
                    />
                ))
            )}

            <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.7); }
          50% { box-shadow: 0 0 0 12px rgba(34, 197, 94, 0.3); }
        }
      `}</style>
        </>
    )
}

export default RankingSection
