"use client"

import { InputHTMLAttributes, ReactNode, useState } from "react"

type TSize = "sm" | "md" | "lg"

interface I_Props extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "prefix"
> {
    label?: string
    error?: string
    helperText?: string
    size?: TSize
    fullWidth?: boolean
    prefix?: ReactNode
    suffix?: ReactNode
    passwordToggle?: boolean
}

export function CE_Input({
    label,
    error,
    helperText,
    size = "md",
    fullWidth = true,
    prefix,
    suffix,
    passwordToggle = false,
    type = "text",
    className = "",
    ...props
}: I_Props) {

    const [showPassword, setShowPassword] = useState(false)

    const actualType =
        passwordToggle && type === "password"
            ? (showPassword ? "text" : "password")
            : type

    const sizes: Record<TSize, string> = {
        sm: "px-2 py-1 text-sm",
        md: "px-3 py-2 text-base",
        lg: "px-4 py-3 text-lg"
    }

    const borderColor = error
        ? "border-red-500 focus:border-red-500"
        : "border-gray-300 focus:border-bri-blue"

    return (
        <div className={`space-y-1 ${fullWidth ? "w-full" : ""}`}>
            {label && (
                <label className="text-sm text-gray-500">
                    {label}
                </label>
            )}

            <div className="relative flex items-center">
                {prefix && (
                    <div className="absolute left-2 text-gray-400">
                        {prefix}
                    </div>
                )}

                <input
                    {...props}
                    type={actualType}
                    className={`
                        w-full border-b outline-none transition-colors text-black
                        ${sizes[size]}
                        ${borderColor}
                        ${prefix ? "pl-8" : ""}
                        ${(suffix || passwordToggle) ? "pr-10" : ""}
                        ${className}
                    `}
                />

                {passwordToggle && type === "password" && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 text-xs text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                )}

                {!passwordToggle && suffix && (
                    <div className="absolute right-2 text-gray-400">
                        {suffix}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500">
                    {error}
                </p>
            )}

            {!error && helperText && (
                <p className="text-xs text-gray-400">
                    {helperText}
                </p>
            )}
        </div>
    )
}
