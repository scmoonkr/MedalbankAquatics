import { proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  return proxyRequest(event, 'http://localhost:6630/api/admin/upload-images')
})
