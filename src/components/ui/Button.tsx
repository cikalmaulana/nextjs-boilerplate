"use client"

import { ButtonHTMLAttributes, ReactNode } from "react"

type TVariant = "primary" | "secondary" | "danger" | "ghost"
type TSize = "sm" | "md" | "lg"

interface I_Props extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: TVariant
    size?: TSize
    loading?: boolean
    fullWidth?: boolean
}

export function CE_Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    ...props
}: I_Props) {

    const base = "rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"

    const variants: Record<TVariant, string> = {
        primary: "bg-bri-blue text-white hover:bg-blue-700 active:scale-[.98]",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-[.98]",
        danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[.98]",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100"
    }

    const sizes: Record<TSize, string> = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg"
    }

    const isDisabled = disabled || loading

    return (
        <button
            {...props}
            disabled={isDisabled}
            className={`
                ${base}
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? "w-full" : ""}
                ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                ${className}
            `}
        >
            {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {children}
        </button>
    )
}
