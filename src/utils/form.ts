export function sanitizeInput(value: string): string {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '/': '&#x2F;',
  }
  const reg = /[&<>"'/]/g
  return value.replace(reg, match => map[match as keyof typeof map])
}
