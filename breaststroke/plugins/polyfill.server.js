// plugins/polyfill.server.js
export default defineNuxtPlugin(() => {
  // 서버 사이드에서 전역 객체 설정
  if (process.server) {
    // FormData 폴리필
    if (!globalThis.FormData) {
      try {
        // Node.js 환경에서 FormData 사용
        const { FormData } = require('formdata-node')
        globalThis.FormData = FormData
      } catch (error) {
        // formdata-node가 없으면 기본 구현 사용
        globalThis.FormData = class FormData {
          constructor() {
            this._data = new Map()
          }
          append(name, value) {
            this._data.set(name, value)
          }
          get(name) {
            return this._data.get(name)
          }
        }
      }
    }
    
    // window와 self 객체 폴리필
    if (!globalThis.window) {
      globalThis.window = globalThis
    }
    if (!globalThis.self) {
      globalThis.self = globalThis
    }
  }
})