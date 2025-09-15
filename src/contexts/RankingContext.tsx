import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

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
  isLoading: boolean
  addRecord: (record: Omit<BrushingRecord, 'id'>) => void
  setCurrentUser: (userId: string) => void
  getCurrentUserRecord: () => RankedUser | null
  clearAllRecords: () => void
}

const RankingContext = createContext<RankingContextType | undefined>(undefined)

// 순위 색상 지정
const getRankBorderColor = (rank: number): string => {
  if (rank === 1) return '#F56358'
  if (rank === 2) return '#F46059'
  if (rank === 3) return '#F89049'
  return '#E5E5E5' // 4위 이하
}

// localStorage 키
const STORAGE_KEY = 'brushing-ranking-records'
const CURRENT_USER_KEY = 'brushing-current-user-rank'

// 초기 더미 데이터
const getInitialRecords = (): BrushingRecord[] => {
  const today = new Date()
  const baseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 20, 0) // 오늘 12:20:00
  
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
      brushingTime: new Date(baseTime.getTime() + 160000), // +2분 40초
      mealType: 'lunch',
      duration: 115
    },
    {
      id: 'initial-3',
      name: '박하준',
      className: '1-3반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date(baseTime.getTime() + 310000), // +5분 10초
      mealType: 'lunch',
      duration: 110
    },
    {
      id: 'initial-4',
      name: '최지우',
      className: '2-2반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date(baseTime.getTime() + 642000), // +10분 42초
      mealType: 'lunch',
      duration: 105
    },
    {
      id: 'initial-5',
      name: '정서윤',
      className: '3-1반',
      profileImage: '/assets/images/woman.png',
      brushingTime: new Date(baseTime.getTime() + 4245000), // +1시간 10분 45초
      mealType: 'outside',
      duration: 100
    }
  ]
}

// localStorage에서 데이터 로드
const loadRecordsFromStorage = (): BrushingRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    console.log('📀 localStorage에서 로드된 데이터:', stored)
    
    if (stored) {
      const parsedRecords = JSON.parse(stored)
      console.log('📀 파싱된 기록들:', parsedRecords)
      
      // Date 객체로 변환
      const records = parsedRecords.map((record: any) => ({
        ...record,
        brushingTime: new Date(record.brushingTime)
      }))
      
      console.log('📀 변환된 기록들:', records)
      return records
    }
  } catch (error) {
    console.error('❌ 랭킹 데이터 로드 실패:', error)
  }
  
  console.log('📀 초기 데이터 사용')
  return getInitialRecords()
}

// localStorage에 데이터 저장
const saveRecordsToStorage = (records: BrushingRecord[]) => {
  try {
    const dataToSave = JSON.stringify(records)
    localStorage.setItem(STORAGE_KEY, dataToSave)
    console.log('💾 localStorage에 저장:', records.length, '개 기록')
  } catch (error) {
    console.error('❌ 랭킹 데이터 저장 실패:', error)
  }
}

// 현재 사용자 순위 로드
const loadCurrentUserRank = (): number | null => {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY)
    const rank = stored ? parseInt(stored, 10) : null
    console.log('👤 현재 사용자 순위 로드:', rank)
    return rank
  } catch (error) {
    console.error('❌ 현재 사용자 순위 로드 실패:', error)
    return null
  }
}

// 현재 사용자 순위 저장
const saveCurrentUserRank = (rank: number | null) => {
  try {
    if (rank !== null) {
      localStorage.setItem(CURRENT_USER_KEY, rank.toString())
      console.log('👤 현재 사용자 순위 저장:', rank)
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
      console.log('👤 현재 사용자 순위 제거')
    }
  } catch (error) {
    console.error('❌ 현재 사용자 순위 저장 실패:', error)
  }
}

export const RankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<BrushingRecord[]>([])
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    console.log('🔄 RankingProvider 초기화 시작')
    setIsLoading(true)
    
    // 데이터 로드 함수
    const loadData = () => {
      try {
        console.log('📀 localStorage 상태 확인')
        console.log('- 사용 가능한 키들:', Object.keys(localStorage))
        console.log('- 총 항목 수:', localStorage.length)
        
        const loadedRecords = loadRecordsFromStorage()
        const loadedUserRank = loadCurrentUserRank()
        
        console.log('✅ 데이터 로드 완료:', {
          recordsCount: loadedRecords.length,
          currentUserRank: loadedUserRank,
          firstRecord: loadedRecords[0],
          lastRecord: loadedRecords[loadedRecords.length - 1]
        })
        
        // 상태 업데이트를 배치로 처리
        setRecords(loadedRecords)
        setCurrentUserRank(loadedUserRank)
        setIsInitialized(true)
        
        // DOM 업데이트를 위한 다음 틱에서 로딩 완료
        setTimeout(() => {
          setIsLoading(false)
          console.log('🔄 RankingProvider 초기화 완료')
        }, 50)
        
      } catch (error) {
        console.error('❌ 데이터 로드 중 오류:', error)
        // 오류 발생 시 기본 데이터 설정
        const initialRecords = getInitialRecords()
        setRecords(initialRecords)
        setCurrentUserRank(null)
        setIsInitialized(true)
        setIsLoading(false)
      }
    }
    
    // 즉시 로드 (비동기 처리 제거)
    loadData()
  }, [])

  // 초기화가 완료된 후에만 records 변경 시 localStorage에 저장
  useEffect(() => {
    if (isInitialized && !isLoading && records.length > 0) {
      console.log('💾 records 변경 감지, localStorage에 저장')
      saveRecordsToStorage(records)
    }
  }, [records, isLoading, isInitialized])

  // 초기화가 완료된 후에만 currentUserRank 변경 시 localStorage에 저장
  useEffect(() => {
    if (isInitialized && !isLoading) {
      console.log('💾 currentUserRank 변경 감지, localStorage에 저장')
      saveCurrentUserRank(currentUserRank)
    }
  }, [currentUserRank, isLoading, isInitialized])

  // 기록을 양치 완료 시간 순으로 정렬하여 순위 계산
  const calculateRanking = useCallback((records: BrushingRecord[]): RankedUser[] => {
    const sorted = [...records].sort((a, b) => a.brushingTime.getTime() - b.brushingTime.getTime())
    
    const ranked = sorted.map((record, index) => ({
      ...record,
      rank: index + 1,
      borderColor: getRankBorderColor(index + 1)
    }))
    
    console.log('📊 순위 계산 완료:', ranked)
    return ranked
  }, [])

  const rankedUsers = calculateRanking(records)

  // 새로운 기록 추가
  const addRecord = useCallback((newRecord: Omit<BrushingRecord, 'id'>) => {
    const record: BrushingRecord = {
      ...newRecord,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    
    console.log('➕ 새 기록 추가:', record)
    
    setRecords(prev => {
      const updated = [...prev, record]
      console.log('📝 업데이트된 기록 목록:', updated)
      return updated
    })

    // 새로 추가된 사용자의 순위 계산
    const tempRanked = calculateRanking([...records, record])
    const newUserRank = tempRanked.find(u => u.id === record.id)?.rank || null
    setCurrentUserRank(newUserRank)
    
    console.log('🏆 새 사용자 순위:', newUserRank)
  }, [records, calculateRanking])

  // 현재 사용자 설정
  const setCurrentUser = useCallback((userId: string) => {
    const userRank = rankedUsers.find(user => user.id === userId)?.rank || null
    setCurrentUserRank(userRank)
    console.log('👤 현재 사용자 설정:', userId, '순위:', userRank)
  }, [rankedUsers])

  // 현재 사용자 기록 조회
  const getCurrentUserRecord = useCallback((): RankedUser | null => {
    if (currentUserRank === null) return null
    const user = rankedUsers.find(user => user.rank === currentUserRank) || null
    console.log('👤 현재 사용자 기록 조회:', user)
    return user
  }, [rankedUsers, currentUserRank])

  // 모든 기록 삭제 (개발/테스트용)
  const clearAllRecords = useCallback(() => {
    console.log('🗑️ 모든 랭킹 데이터 초기화')
    setRecords(getInitialRecords())
    setCurrentUserRank(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
  }, [])

  console.log('🔄 RankingProvider 렌더링:', {
    isLoading,
    recordsCount: records.length,
    rankedUsersCount: rankedUsers.length,
    currentUserRank
  })

  return (
    <RankingContext.Provider value={{
      records,
      rankedUsers,
      currentUserRank,
      isLoading,
      addRecord,
      setCurrentUser,
      getCurrentUserRecord,
      clearAllRecords
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
