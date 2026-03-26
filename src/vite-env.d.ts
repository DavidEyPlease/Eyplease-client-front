/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_NUMBER?: string
  readonly VITE_BUILD_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
