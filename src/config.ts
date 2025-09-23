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
    logo: string
}

export const config = {
    // ✅ 키오스크 장비 식별자 (연동 장비 ID)
    kioskId: "MTA001",

    // ✅ 화면 상단에 표시할 제목 텍스트
    titleText: "양치!",

    // ✅ 사용자가 일정 시간(초) 동안 터치하지 않으면 메인 홈으로 돌아가는 시간
    timeout: 60,

    // ✅ 홈 화면 공지/슬라이드가 바뀌는 주기 (초 단위)
    slideTime: 3,

    // ✅ API 서버 주소
    apiBaseUrl: "http://127.0.0.1:3001",

    // ✅ 양치 인증 완료 화면이 표시되는 시간 (밀리초 단위)
    toothbrushModalTimeout: 5000,

    // ✅ 점심시간 시작 시각 (24시간제, 시 단위)
    lunchStartTime: 12,

    // ✅ 점심시간 종료 시각 (24시간제, 시 단위)
    lunchEndTime: 13,

    // ✅ 로고 파일명 (public/assets 등 정적 경로에 위치해야 함)
    //    화면 좌측 상단이나 타이틀 영역에 표시할 이미지
    // 파일 업로드 후에는 실제 파일명에 맞게 수정해야 함
    logo: "novellink.png"
}

