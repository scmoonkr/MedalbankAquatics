import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  devtools: { enabled: false },

  runtimeConfig: {
    public: {
      cloudPublicUrl: process.env.CLOUD_PUBLIC_URL ?? '',
    },
  },

  devServer: { port: 6631 },

  css: ['~/assets/css/shared.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
        { property: 'og:type',        content: 'website' },
        { property: 'og:site_name',   content: '메달뱅크 아쿠아틱스' },
        { property: 'og:title',       content: '메달뱅크 아쿠아틱스' },
        { property: 'og:description', content: 'Every heat, every athlete. 수영 대회 전문 사진 서비스.' },
        { property: 'og:image',       content: '/images/open_graph_meta_image.png' },
        { name: 'twitter:card',       content: 'summary_large_image' },
        { name: 'twitter:image',      content: '/images/open_graph_meta_image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,500&family=Nanum+Myeongjo:wght@400;700;800&display=swap',
        },
      ],
    },
  },

  nitro: {
    publicAssets: [
      { dir: fileURLToPath(new URL('../html/data', import.meta.url)), baseURL: '/data', maxAge: 0 },
    ],
  },

  routeRules: {
    '/backend/**': { ssr: false },
  },

})
