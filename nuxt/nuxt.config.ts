import { fileURLToPath } from 'url'

export default defineNuxtConfig({
  devtools: { enabled: false },

  devServer: { port: 6631 },

  css: ['~/assets/css/shared.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/images/medalbankaquatics.png' },
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
      { dir: fileURLToPath(new URL('../html/images', import.meta.url)), baseURL: '/images', maxAge: 0 },
      { dir: fileURLToPath(new URL('../html/data',   import.meta.url)), baseURL: '/data',   maxAge: 0 },
    ],
  },

  routeRules: {
    '/backend/**': { ssr: false },
  },

})
