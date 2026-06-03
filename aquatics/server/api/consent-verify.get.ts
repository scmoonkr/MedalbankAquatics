export default defineEventHandler(async (event) => {
  const { token } = getQuery(event)
  return $fetch(`http://localhost:6630/api/consent/verify/${token}`)
})
