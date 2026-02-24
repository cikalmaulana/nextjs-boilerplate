// Hanya jalan di browser (client component)
// Menggunakan native Web Crypto API

import type { EncryptedPayload, CryptoResult } from "./types"

// ─── Server Public Key Cache ───────────────────────────────────────────────────

let _serverPublicKey: CryptoKey | null = null
let _serverPublicKeyBase64: string | null = null
let _fetchedAt = 0
const KEY_TTL_MS = 1000 * 60 * 4

async function getServerPublicKey(): Promise<{ key: CryptoKey; base64: string }> {
    const isExpired = Date.now() - _fetchedAt > KEY_TTL_MS

    if (!_serverPublicKey || isExpired) {
        const res = await fetch("/server/crypto/public-key")
        if (!res.ok) throw new Error("Failed to fetch server public key")

        const { key } = await res.json() as { key: string }

        const buffer = Uint8Array.from(atob(key), c => c.charCodeAt(0))
        _serverPublicKey = await window.crypto.subtle.importKey(
            "spki",
            buffer,
            { name: "ECDH", namedCurve: "P-256" },
            false,
            []
        )
        _serverPublicKeyBase64 = key
        _fetchedAt = Date.now()
    }

    return { key: _serverPublicKey!, base64: _serverPublicKeyBase64! }
}

// ─── SessionKey Key Management ──────────────────────────────────────────────────
// Disimpan per "session request". sessionKey  key dibuat baru tiap memanggil encrypt
// Private key disimpan sementara di closure buat decrypt response

interface SessionKeySession {
    publicKeyBase64: string
    privateKey: CryptoKey
}

async function generateSessionKey(): Promise<SessionKeySession> {
    const pair = await window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey", "deriveBits"]
    )

    const exported = await window.crypto.subtle.exportKey("spki", pair.publicKey)
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)))

    return { publicKeyBase64, privateKey: pair.privateKey }
}

// ─── Shared Key ────────────────────────────────────────────────────────────────

async function deriveSharedKey(
    serverPublicKey: CryptoKey,
    clientPrivateKey: CryptoKey,
    usage: KeyUsage[]
): Promise<CryptoKey> {
    return window.crypto.subtle.deriveKey(
        { name: "ECDH", public: serverPublicKey },
        clientPrivateKey,
        { name: "AES-GCM", length: 256 },
        false,
        usage
    )
}

// ─── clientEncrypt ─────────────────────────────────────────────────────────────
// Encrypt data dari client, return payload + privateKey untuk decrypt response

export async function clientEncrypt<T>(data: T): Promise<{
    payload: EncryptedPayload
    sessionKey: CryptoKey // Session Key untuk decrypt response server
}> {
    const serverKey = await getServerPublicKey()
    const sessionKey = await generateSessionKey()

    const sharedKey = await deriveSharedKey(serverKey.key, sessionKey.privateKey, ["encrypt"])

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(JSON.stringify(data))

    const ciphertext = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv, tagLength: 128 },
        sharedKey,
        encoded
    )

    return {
        payload: {
            clientPublicKey: sessionKey.publicKeyBase64,
            iv: btoa(String.fromCharCode(...iv)),
            ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
        },
        sessionKey: sessionKey.privateKey,
    }
}

// ─── clientDecrypt ─────────────────────────────────────────────────────────────
// Decrypt response dari server menggunakan SessionKeyPrivateKey yang sama

export async function clientDecrypt<T>(
    payload: EncryptedPayload,
    sessionKey: CryptoKey
): Promise<CryptoResult<T>> {
    try {
        const serverKey = await getServerPublicKey()
        const sharedKey = await deriveSharedKey(serverKey.key, sessionKey, ["decrypt"])

        const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0))
        const ciphertext = Uint8Array.from(atob(payload.ciphertext), c => c.charCodeAt(0))

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv, tagLength: 128 },
            sharedKey,
            ciphertext
        )

        const data = JSON.parse(new TextDecoder().decode(decrypted)) as T
        return { ok: true, data }
    } catch (e) {
        return { ok: false, error: "Decryption failed" }
    }
}
