import React from 'react'

interface UserListItemProps {
    rank: number
    name: string
    className: string
    time: string
    profileImage: string
    mealType: boolean
    isLast?: boolean
    isCurrentUser?: boolean
}

const UserListItem: React.FC<UserListItemProps> = ({
                                                       rank,
                                                       name,
                                                       className,
                                                       time,
                                                       profileImage,
                                                       mealType,
                                                       isLast = false,
                                                       isCurrentUser = false
                                                   }) => {
    return (
        <div style={{
            width: '1080px',
            height: '138px',
            position: 'relative',
            background: isCurrentUser ? 'linear-gradient(90deg, #F0FDF4 0%, #DCFCE7 100%)' : 'white',
            borderBottom: isLast ? 'none' : '0.50px #B4B4B5 solid',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
        }}>
            {/* 순위 */}
            <div style={{
                // 4
                color: '#111111',
                fontSize: 32,
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: 56,
                wordWrap: 'break-word',
                marginLeft: '52px',
                marginRight: '32px',
            }}>
                {rank}
            </div>

            {/* 프로필 이미지 */}
            <img
                style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50px',
                    border: isCurrentUser ? '3px #22C55E solid' : '2px #E5E5E5 solid',
                }}
                src={profileImage}
                alt={name}
            />

            {/* 이름과 반 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: "110px",
                height: "86px",
                marginLeft: '32px',
            }}>
                <div style={{
                    color: '#111111',
                    fontSize: '36px',
                    fontFamily: 'Pretendard',
                    fontWeight: 600,
                    lineHeight: '42px',
                }}>
                    <div style={{
                        // 최지우
                        color: '#111111',
                        fontSize: 32,
                        fontFamily: 'Pretendard',
                        fontWeight: '600',
                        textAlign: 'center',

                    }}>
                        {name}
                    </div>
                    <div style={{
                        color: '#4C4948',
                        fontSize: 32,
                        fontFamily: 'Pretendard',
                        fontWeight: '400',
                        width: '110px',
                        height: '43px',
                        textAlign: 'center',
                    }}>
                        {className == '' ? '미확인' : className + '반'}
                    </div>
                </div>
            </div>

            {/* 식사 태그 */}
            {mealType ? (
                <div style={{
                width: '80px',
                height: '50px',
                background: '#B2D7FF',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 10,
                display: 'inline-flex',
                marginLeft: '32px',
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
                marginLeft: '32px',
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


            {/* 시간 */}
            <div style={{
                width: '218px',
                height: '44px',
                textAlign: 'right',
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                color: '#4C4948',
                fontSize: 32,
                fontFamily: 'Pretendard',
                fontWeight: '400',
                lineHeight: "56px",
                marginLeft: '384px',
            }}>{time}
            </div>

        </div>
    )
}

export default UserListItem
