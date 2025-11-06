export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json
  } catch {
    return null
  }
}


