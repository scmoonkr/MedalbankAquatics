export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return $fetch(`http://localhost:6630/api/admin/images/${id}`, { method: 'DELETE' })
})
