"use server"

import { IRs_Common } from "./types/common";
import { IRq_Login, IRs_Login } from "./types/type.login";

export async function API_Login(props: IRq_Login): Promise<IRs_Common<IRs_Login>>{
    const dummy: IRs_Login = {
        "accessToken": "xxx",
        "refreshToken": "yyy",
        "userId": "1",
        "name": "John Doe"
    }

    return {
        message: "Login successful",
        status: 200,
        data: dummy
    }
}