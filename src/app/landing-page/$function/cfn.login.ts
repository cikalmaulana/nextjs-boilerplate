"use client"

import { clientEncrypt, clientDecrypt } from "@/utils/crypto/client"
import type { IRq_Login, IRs_Login } from "@/api/types/type.login"
import type { IRs_Common } from "@/api/types/common"
import type { TransitionStartFunction } from "react"
import { ACT_Login } from "../$action/act.login"
import { ES_LoginMessage } from "../$constant/cconstant"
import { emailChecker, xpEmail } from "@/utils/checker.email"

interface I_LoginProps {
    data: IRq_Login
    transit: TransitionStartFunction
    whileError: (error: string) => void
    whileSuccess?: (token: string) => void
}

export function CFN_Login(props: I_LoginProps) {
    const checkEmail = emailChecker(props.data.email)(xpEmail)

    props.transit(async () => {
        if (!checkEmail) {
            return props.whileError(ES_LoginMessage.EMAIL_NOT_VALID)
        }
        const { payload, sessionKey } = await clientEncrypt(props.data)
        const encryptedResult = await ACT_Login(payload)
        const decrypted = await clientDecrypt<IRs_Common<IRs_Login>>(encryptedResult, sessionKey)

        if (!decrypted.ok || !decrypted.data) {
            return props.whileError("Failed to process response")
        }

        const result = decrypted.data
        if (result.status !== 200) {
            return props.whileError(result.message)
        }
        props.whileSuccess?.(result.data.accessToken)
    })
}