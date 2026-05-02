export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return $fetch('http://localhost:6630/api/requests', { method: 'POST', body })
})
