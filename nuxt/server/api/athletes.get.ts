export default defineEventHandler(async () => {
  return $fetch('http://localhost:6630/api/athletes')
})
