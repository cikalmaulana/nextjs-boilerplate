// Endpoint ini diperlukan agar client dapat fetch server public key
// Public key boleh diketahui siapa aja yang penting private keynya aman di server

import { NextResponse } from "next/server"
import { getServerPublicKeyBase64 } from "@/utils/crypto/server"

export async function GET() {
    const key = await getServerPublicKeyBase64()
    return NextResponse.json({ key, algorithm: "ECDH-P256" }, {
        headers: { "Cache-Control": "public, max-age=240" } // cache 4 menit
    })
}
