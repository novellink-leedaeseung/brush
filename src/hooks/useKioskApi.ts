import { useState } from 'react'
import { getAuthUser, getKioskAuth } from '@/api/ApiAxios'

export type StatusType = "info" | "success" | "error"

export interface KioskAuthState {
  status: StatusType
  message: string
  data: any
  isLoading: boolean
}

export const useKioskApi = () => {
  const [kioskAuthState, setKioskAuthState] = useState<KioskAuthState>({
    status: 'info',
    message: '',
    data: null,
    isLoading: false
  })

  const [userAuthState, setUserAuthState] = useState<KioskAuthState>({
    status: 'info',
    message: '',
    data: null,
    isLoading: false
  })

  const authenticateKiosk = async (kioskId: string) => {
    setKioskAuthState(prev => ({ ...prev, isLoading: true, status: 'info', message: '사용자 목록 불러오는 중…' }))
    
    try {
      const result = await getKioskAuth(kioskId)
      setKioskAuthState({
        status: 'success',
        message: '불러오기 완료',
        data: result,
        isLoading: false
      })
      return result
    } catch (error: any) {
      console.error(error)
      setKioskAuthState({
        status: 'error',
        message: '불러오기에 실패했습니다.',
        data: null,
        isLoading: false
      })
      throw error
    }
  }

  const authenticateUser = async (userId: string, kioskId: string) => {
    setUserAuthState(prev => ({ ...prev, isLoading: true, status: 'info', message: '사용자 정보 확인 중…' }))
    
    try {
      const result = await getAuthUser(userId, "PHONE", kioskId)
      setUserAuthState({
        status: 'success',
        message: '사용자 인증 완료',
        data: result,
        isLoading: false
      })
      return result
    } catch (error: any) {
      console.error(error)
      setUserAuthState({
        status: 'error',
        message: '사용자 인증에 실패했습니다.',
        data: null,
        isLoading: false
      })
      throw error
    }
  }

  return {
    kioskAuthState,
    userAuthState,
    authenticateKiosk,
    authenticateUser
  }
}
