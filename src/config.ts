// config.ts
export interface AppConfig {
  kioskId: string
  titleText: string
  timeout: number
  slideTime: number
  apiBaseUrl: string
  toothbrushModalTimeout: number
}

export const config: AppConfig = {
  kioskId: "MTA001",
  titleText: "양치!",
  timeout: 60,
  slideTime: 3,
  apiBaseUrl: "http://127.0.0.1:3001",
  toothbrushModalTimeout: 5000,
}
