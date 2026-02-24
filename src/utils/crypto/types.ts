// Shared types antara client dan server

export interface EncryptedPayload {
  clientPublicKey: string // base64 sessionKey public key dari client
  iv: string              // base64 IV untuk AES-GCM
  ciphertext: string      // base64 encrypted data
}

export interface CryptoResult<T> {
    ok: boolean
    data?: T
    error?: string
}
