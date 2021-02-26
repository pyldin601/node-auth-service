import crypto from 'crypto'

export function generateTokenForUser(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    crypto.randomBytes(48, (error, buffer) => {
      if (error) {
        reject(error)
        return
      }
      resolve(buffer.toString('hex'))
    })
  })
}
