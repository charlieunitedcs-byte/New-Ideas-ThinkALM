/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_AUTH_SECRET: string;
  readonly VITE_ENABLE_AI_FALLBACK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
