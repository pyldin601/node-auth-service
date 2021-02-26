import { sign } from 'jsonwebtoken'

export function createAccessToken(
  tokenSecret: string,
  tokenLifetime: number,
  userId: number,
): string {
  const exp = Math.floor(Date.now() / 1000) + tokenLifetime
  return sign({ exp, uid: userId }, tokenSecret, {})
}
