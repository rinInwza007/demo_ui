interface ImportMetaEnv {
  readonly VITE_USE_FAKE_API: string // จำไว้ว่าเป็น string เสมอ ('true' | 'false')
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
