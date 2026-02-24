import { webcrypto } from "crypto"
import type { EncryptedPayload, CryptoResult } from "./types"
import { logger } from "../logger"

const crypto = webcrypto as unknown as Crypto

// ─── Singleton Key Pair ────────────────────────────────────────────────────────
// Priority:
//   1. ENV (SERVER_CRYPTO_PUBLIC_KEY + SERVER_CRYPTO_PRIVATE_KEY)
//      - untuk multi-instance / horizontal scaling
//
//   2. Auto-generate in-memory
//      - untuk single instance / development
//      - key baru tiap server restart, rotate tiap 1 jam

interface KeyStore {
    keyPair: CryptoKeyPair | null
    publicKeyBase64: string | null
    createdAt: number
    fromEnv: boolean
}

const store: KeyStore = {
    keyPair: null,
    publicKeyBase64: null,
    createdAt: 0,
    fromEnv: false,
}

const KEY_TTL_MS = 1000 * 60 * 60 // 1 jam (hanya berlaku kalau tidak dari env)

async function ensureKeyPair(): Promise<CryptoKeyPair> {
    // Pakai key dari ENV jika ada
    if (store.keyPair && store.fromEnv) return store.keyPair

    const isExpired = Date.now() - store.createdAt > KEY_TTL_MS
    if (store.keyPair && !isExpired) return store.keyPair

    const envPublicKey = process.env.SERVER_CRYPTO_PUBLIC_KEY
    const envPrivateKey = process.env.SERVER_CRYPTO_PRIVATE_KEY

    if (envPublicKey && envPrivateKey) {
        const publicKey = await crypto.subtle.importKey(
            "spki",
            Buffer.from(envPublicKey, "base64"),
            { name: "ECDH", namedCurve: "P-256" },
            true,
        []
        )
        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            Buffer.from(envPrivateKey, "base64"),
            { name: "ECDH", namedCurve: "P-256" },
            true,
            ["deriveKey", "deriveBits"]
        )

        store.keyPair = { publicKey, privateKey }
        store.publicKeyBase64 = envPublicKey
        store.createdAt = Date.now()
        store.fromEnv = true

        return store.keyPair
    }

    // ── Fallback: auto-generate (single instance / dev) ──
    const keyPair = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey", "deriveBits"]
    )

    const exported = await crypto.subtle.exportKey("spki", keyPair.publicKey)
    store.keyPair = keyPair
    store.publicKeyBase64 = Buffer.from(exported).toString("base64")
    store.createdAt = Date.now()
    store.fromEnv = false

    logger.warn("Key pair auto-generated (in-memory)", {
        path: "utils/crypto", 
        source: "generated",
    })
    return store.keyPair
}

// ─── Public Key (untuk dikirim ke client) ─────────────────────────────────────

export async function getServerPublicKeyBase64(): Promise<string> {
    await ensureKeyPair()
    return store.publicKeyBase64!
}

// ─── Shared Key Derivation ─────────────────────────────────────────────────────

async function deriveSharedKey(
    serverPrivateKey: CryptoKey,
    clientPublicKeyBase64: string,
    usage: KeyUsage[]
): Promise<CryptoKey> {
    const buffer = Buffer.from(clientPublicKeyBase64, "base64")
    const clientPublicKey = await crypto.subtle.importKey(
        "spki",
        buffer,
        { name: "ECDH", namedCurve: "P-256" },
        false,
        []
    )

    return crypto.subtle.deriveKey(
        { name: "ECDH", public: clientPublicKey },
        serverPrivateKey,
        { name: "AES-GCM", length: 256 },
        false,
        usage
    )
}

// ─── Decrypt (client → server) ─────────────────────────────────────────────────

export async function serverDecrypt<T>(
    payload: EncryptedPayload
): Promise<CryptoResult<T>> {
    try {
        const { keyPair } = await ensureKeyPair().then(kp => ({ keyPair: kp }))
        const sharedKey = await deriveSharedKey(
            keyPair.privateKey,
            payload.clientPublicKey,
            ["decrypt"]
        )

        const iv = Buffer.from(payload.iv, "base64")
        const ciphertext = Buffer.from(payload.ciphertext, "base64")

        const decrypted = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv, tagLength: 128 },
            sharedKey,
            ciphertext
        )

        const data = JSON.parse(new TextDecoder().decode(decrypted)) as T
        return { ok: true, data }
    } catch (e) {
        logger.error("serverDecrypt failed", {
            path: "utils/crypto/serverDecrypt",
            err: e instanceof Error ? e.message : String(e),
        })
        return { ok: false, error: "Decryption failed" }
    }
}

// ─── Encrypt (server → client) ─────────────────────────────────────────────────

export async function serverEncrypt<T>(
    data: T,
    clientPublicKeyBase64: string
): Promise<EncryptedPayload> {
    const keyPair = await ensureKeyPair()
    const sharedKey = await deriveSharedKey(
        keyPair.privateKey,
        clientPublicKeyBase64,
        ["encrypt"]
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(JSON.stringify(data))

    const ciphertext = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv, tagLength: 128 },
        sharedKey,
        encoded
    )

    return {
        clientPublicKey: clientPublicKeyBase64, // echo back biar client tau ini untuk dia
        iv: Buffer.from(iv).toString("base64"),
        ciphertext: Buffer.from(ciphertext).toString("base64"),
    }
}
