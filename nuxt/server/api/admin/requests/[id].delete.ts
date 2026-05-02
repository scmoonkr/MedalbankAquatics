export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return $fetch(`http://localhost:6630/api/admin/requests/${id}`, { method: 'DELETE' })
})
