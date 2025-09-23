// config.ts
export interface AppConfig {
    kioskId: string
    titleText: string
    timeout: number
    slideTime: number
    apiBaseUrl: string
    toothbrushModalTimeout: number
    lunchStartTime: number
    lunchEndTime: number
}

export const config: AppConfig = {
    // kiosk 연동 장비 이름
    kioskId: "MTA001",
    // 타이틀
    titleText: "양치!",
    // 터치가 없을 때 메인 홈으로 돌아가는 타이머
    timeout: 60,
    // 홈 화면 슬라이드 초
    slideTime: 3,
    // API 서버
    apiBaseUrl: "http://127.0.0.1:3001",
    // 양치인증 화면에 띄울 시간
    toothbrushModalTimeout: 5000,
    // 점심시간 시작시간
    lunchStartTime:12,
    // 점심시간 끝나는 시간
    lunchEndTime:13,
}
