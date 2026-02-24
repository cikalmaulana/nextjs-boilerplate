"use server"

import { serverDecrypt, serverEncrypt } from "@/utils/crypto/server"
import { API_Login } from "@/api/login"
import type { EncryptedPayload } from "@/utils/crypto/types"
import type { IRq_Login } from "@/api/types/type.login"

export async function ACT_Login(encrypted: EncryptedPayload): Promise<EncryptedPayload> {
    const decrypted = await serverDecrypt<IRq_Login>(encrypted)
    if (!decrypted.ok || !decrypted.data) {
        return serverEncrypt(
            { status: 400, message: "Invalid payload" },
            encrypted.clientPublicKey
        )
    }
    const result = await API_Login(decrypted.data)
    return serverEncrypt(result, encrypted.clientPublicKey)
}