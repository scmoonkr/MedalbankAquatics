import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../.env') })

export default defineNuxtConfig({
  devtools: { enabled: false },
  devServer: { port: 6633 },

  runtimeConfig: {
    mongoAddr: process.env.MONGODB_ADDR    || '221.143.48.153:4529',
    mongoUser: process.env.MONGO_USERNAME  || 'mscadmin',
    mongoPwd:  process.env.MONGO_PWD       || '~Mscadmin',
    mongoDb:   process.env.MONGO_DBNAME_BR || 'Breaststroke',
    public: {
      naverFormInsert: process.env.NAVER_FORM_INSERT || '',
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: '수영 주식시장. Swim Stock Exchange by Medalbank.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Pretendard:wght@300;400;500;600&display=swap',
        },
      ],
    },
  },
})
