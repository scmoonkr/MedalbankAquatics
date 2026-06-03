export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return $fetch('http://localhost:6630/api/consent', {
    method: 'POST',
    body,
  })
})
