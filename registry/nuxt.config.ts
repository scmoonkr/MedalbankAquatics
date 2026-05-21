import { fileURLToPath, URL } from 'url'
import { resolve, dirname } from 'path'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '../../.env') })

export default defineNuxtConfig({
  devtools: { enabled: false },
  devServer: { port: 6632 },

  runtimeConfig: {
    mongoAddr: process.env.MONGODB_ADDR    || '221.143.48.153:4529',
    mongoUser: process.env.MONGO_USERNAME  || 'mscadmin',
    mongoPwd:  process.env.MONGO_PWD       || '~Mscadmin',
    mongoDb:   process.env.MONGO_DBNAME_BR || 'Breaststroke',
  },

  css: ['~/assets/css/registry.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: '대한민국 경영 전 종목 종합순위표. Korean Swimming Registry.' },
      ],
      link: [
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
})
