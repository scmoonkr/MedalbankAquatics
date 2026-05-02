export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  return $fetch(`http://localhost:6630/api/admin/meets/${id}`, { method: 'PUT', body })
})
