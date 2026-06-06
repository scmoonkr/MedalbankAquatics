import { fileURLToPath, URL } from 'url'
import { resolve, dirname } from 'path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

export default defineNuxtConfig({
  devtools: { enabled: false },
  devServer: { port: 6632 },
  modules: ['nuxt-auth-utils'],

  runtimeConfig: {
    mongoAddr:         process.env.MONGODB_ADDR       || '221.143.48.153:4529',
    mongoUser:         process.env.MONGO_USERNAME     || 'mscadmin',
    mongoPwd:          process.env.MONGO_PWD          || '~Mscadmin',
    mongoDb:           process.env.MONGO_DBNAME_BR    || 'Breaststroke',
    naverClientId:     process.env.NAVER_CLIENT_ID     || '',
    naverClientSecret: process.env.NAVER_CLIENT_SECRET  || '',
    siteUrl:           process.env.NUXT_SITE_URL        || '',
    allowedNaverIds:   process.env.ALLOWED_NAVER_IDS   || '',
    uploadDir:         process.env.UPLOAD_DIR          || '',
    downloadDir:       process.env.DOWNLOAD_DIR        || '',
    nvidiaApiKey:      process.env.NVIDIA_API_KEY       || '',
    nvidiaModelName:   process.env.NVIDIA_MODEL_NAME    || 'meta/llama-3.1-8b-instruct',
    // nuxt-auth-utils: NUXT_SESSION_PASSWORD는 런타임에서만 읽히므로 빌드 시 bake
    // HTTP 배포 환경에서는 Secure 쿠키 비활성화 (HTTPS 전환 시 제거)
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        secure: (process.env.NUXT_SITE_URL || '').startsWith('https'),
      },
    },
    public: {
      naverFormInsert: process.env.NAVER_FORM_INSERT || '',
    },
  },

  css: ['~/assets/css/registry.css', '~/assets/css/modal.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: '대한민국 경영 전 종목 종합순위표. 메달뱅크.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&family=Nanum+Myeongjo:wght@400;700;800&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  routeRules: {
    '/backend/**': { ssr: false },
  },

  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name:      'time-id',
        path:      '/time/:id(\\d+)',
        file:      '~/pages/time/[[id]].vue',
        meta:      { ssr: false },
      })
    },
  },
})
