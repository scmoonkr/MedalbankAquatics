// plugins/polyfill.client.js
export default defineNuxtPlugin(() => {
  // 클라이언트 사이드에서 전역 객체 설정
  if (process.client) {
    if (!globalThis.FormData && window.FormData) {
      globalThis.FormData = window.FormData
    }
    if (!globalThis.self && window.self) {
      globalThis.self = window.self
    }
  }
})