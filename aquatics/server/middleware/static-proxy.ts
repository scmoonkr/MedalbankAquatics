export default defineEventHandler(async (event) => {
  const path = event.path
  if (!path.startsWith('/images/') && !path.startsWith('/data/')) return
  return proxyRequest(event, `http://localhost:6630${path}`)
})
