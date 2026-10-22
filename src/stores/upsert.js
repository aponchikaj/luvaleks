/** Insert-or-replace by id, keeping list order stable. */
export function upsertById(list, item) {
  const i = list.findIndex((x) => x.id === item.id)
  if (i === -1) return [...list, item]
  const next = list.slice()
  next[i] = { ...list[i], ...item }
  return next
}

export const removeById = (list, id) => list.filter((x) => x.id !== id)
