// nuxt.config.ts
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'

// 루트 .env(모든 앱 공유)에서 NUXT_PUBLIC_API_BASE 등을 읽는다.
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

export default defineNuxtConfig({
  ssr: true,
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  css: [
    '~/assets/css/main.css',
    '~/assets/css/default.css',
    '@fortawesome/fontawesome-free/css/all.min.css',
  ],

  app: {
    baseURL: '/',
    head: {
      title: 'Medalbank',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon/favicon-96x96.png' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
        // 나눔고딕 (DataTable 전용) - Google Fonts
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '편리하고 체계화된 대한민국 수영의 오늘' },
      ],
    },

    // 넉스트 로딩화면 안보이게
    loading: false
  },
  components: true,

  runtimeConfig: {
    // 서버 사이드에서만 접근 가능한 환경 변수
    public: {
      // env 미설정(운영 기본) 시 공개 API 도메인을 사용한다. 브라우저에서 호출되므로 localhost는 안 됨.
      // 로컬 개발은 .env 의 NUXT_PUBLIC_API_BASE=http://localhost:6630 으로 덮어쓴다.
      serverBase: process.env.NUXT_PUBLIC_SERVER_BASE || 'https://api.medalbank.com',
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.medalbank.com',
      imageBbApiKey: process.env.ImgBBKey,
    }
  },


  devServer: {
    host: 'localhost',
    port: 6633
  },

  vite: {
    server: {
      hmr: {
        port: 24679 // 다른 포트 번호 사용
      }
    }
  },

  // SSR 활성화 (SEO 최적화)
  ssr: true,
  nitro: {
    compressPublicAssets: false,  // gzip/brotli 비활성화
    serveStatic: true,            // static 파일 직접 전송
    prerender: {
      routes: ['/'] // 필요한 경우 특정 라우트 프리렌더링
    }
  },

  compatibilityDate: '2025-05-06',

  // 넉스트 링크 안보이게
  devtools: false,
})
