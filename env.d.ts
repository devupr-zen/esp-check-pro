/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_SECRET_KEY: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_WEBHOOK_SECRET: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_STRIPE_PRICE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}