/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_PAGE_SIZE: string
  readonly VITE_TITLE_TEXT: string
  readonly VITE_THEME_COLOR: string
  readonly VITE_KIOSK_ID: string
  readonly TOUUTHBRUSHMODAL_TIMEOUT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}