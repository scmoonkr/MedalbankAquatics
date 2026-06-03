export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return $fetch('http://localhost:6630/api/gallery', { query })
})
