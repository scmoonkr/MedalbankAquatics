export default defineEventHandler(async (event) => {
  const { id } = getQuery(event)
  return $fetch(`http://localhost:6630/api/athletes/${id}`)
})
