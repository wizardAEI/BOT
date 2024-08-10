export function decorateContent(c: string, max: number = 50) {
  if (c.length > max) {
    return c.slice(0, max) + ' ......'
  }
  return c
}
