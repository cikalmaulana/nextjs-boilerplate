"use client"

import { CE_Button } from "@/components/ui/Button"
import { useState, useTransition } from "react"
import { CFN_Login } from "../$function/cfn.login"
import { CE_Input } from "@/components/ui/Input"
import { IRq_Login } from "@/api/types/type.login"

export function CE_LandingPageLoginForm() {
    const [form, setForm] = useState<IRq_Login>({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleSubmit = () => {
        CFN_Login({
            data: { 
                email: form.email, 
                password: form.password
            },
            transit: startTransition,
            whileError: setError
        })
    }

    const setField = (field: keyof typeof form, value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            <CE_Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
            />

            <CE_Input
                label="Password"
                type="password"
                passwordToggle
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
            />

            <div className="text-right text-sm">
                <a href="#" className="text-bri-blue hover:underline">Forgot password?</a>
            </div>

            <CE_Button onClick={handleSubmit} fullWidth loading={isPending}>
                Login
            </CE_Button>
        </div>
    )
}