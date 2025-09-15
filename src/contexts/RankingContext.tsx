import React, { createContext, useContext, useState, useCallback } from 'react'

export interface BrushingRecord {
  id: string
  name: string
  className: string
  profileImage: string
  brushingTime: Date // 양치 완료 시간 (1초 단위 정밀도)
  mealType: 'lunch' | 'outside'
  duration: number // 양치 소요 시간 (초)
}

export interface RankedUser extends BrushingRecord {
  rank: number
  borderColor: string
}

interface RankingContextType {
  records: BrushingRecord[]
  rankedUsers: RankedUser[]
  currentUserRank: number | null
  addRecord: (record: Omit<BrushingRecord, 'id'>) => void
  setCurrentUser: (userId: string) => void
  getCurrentUserRecord: () => RankedUser | null
}

const RankingContext = createContext<RankingContextType | undefined>(undefined)

// 순위 색상 지정
const getRankBorderColor = (rank: number): string => {
  if (rank === 1) return '#F56358'
  if (rank === 2) return '#F46059'
  if (rank === 3) return '#F89049'
  return '#E5E5E5' // 4위 이하
}

export const RankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<BrushingRecord[]>([
    // 초기 데이터 (테스트용)
    {
      id: '1',
      name: '김민준',
      className: '1-2반',
      profileImage: '/assets/images/man.png',
      brushingTime: new Date('2024-01-15T12:20:10.000Z'),
      mealType: 'lunch',
      duration: 120
    },
    {
      id: '2',
      name: '이서연',
      className: '5-1반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date('2024-01-15T12:22:50.000Z'),
      mealType: 'lunch',
      duration: 115
    },
    {
      id: '3',
      name: '박하준',
      className: '1-3반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date('2024-01-15T12:25:20.000Z'),
      mealType: 'lunch',
      duration: 110
    },
    {
      id: '4',
      name: '최지우',
      className: '2-2반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date('2024-01-15T12:30:42.000Z'),
      mealType: 'lunch',
      duration: 105
    },
    {
      id: '5',
      name: '정서윤',
      className: '3-1반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date('2024-01-15T13:30:45.000Z'),
      mealType: 'outside',
      duration: 100
    }
  ])
  
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)

  // 기록을 양치 완료 시간 순으로 정렬하여 순위 계산
  const calculateRanking = useCallback((records: BrushingRecord[]): RankedUser[] => {
    const sorted = [...records].sort((a, b) => a.brushingTime.getTime() - b.brushingTime.getTime())
    
    return sorted.map((record, index) => ({
      ...record,
      rank: index + 1,
      borderColor: getRankBorderColor(index + 1)
    }))
  }, [])

  const rankedUsers = calculateRanking(records)

  // 새로운 기록 추가
  const addRecord = useCallback((newRecord: Omit<BrushingRecord, 'id'>) => {
    const record: BrushingRecord = {
      ...newRecord,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    
    setRecords(prev => {
      const updated = [...prev, record]
      return updated
    })

    // 새로 추가된 사용자의 순위 계산
    const tempRanked = calculateRanking([...records, record])
    const newUserRank = tempRanked.find(u => u.id === record.id)?.rank || null
    setCurrentUserRank(newUserRank)
  }, [records, calculateRanking])

  // 현재 사용자 설정
  const setCurrentUser = useCallback((userId: string) => {
    const userRank = rankedUsers.find(user => user.id === userId)?.rank || null
    setCurrentUserRank(userRank)
  }, [rankedUsers])

  // 현재 사용자 기록 조회
  const getCurrentUserRecord = useCallback((): RankedUser | null => {
    if (currentUserRank === null) return null
    return rankedUsers.find(user => user.rank === currentUserRank) || null
  }, [rankedUsers, currentUserRank])

  return (
    <RankingContext.Provider value={{
      records,
      rankedUsers,
      currentUserRank,
      addRecord,
      setCurrentUser,
      getCurrentUserRecord
    }}>
      {children}
    </RankingContext.Provider>
  )
}

export const useRanking = () => {
  const context = useContext(RankingContext)
  if (context === undefined) {
    throw new Error('useRanking must be used within a RankingProvider')
  }
  return context
}
