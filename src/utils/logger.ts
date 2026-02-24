// src/utils/logger.ts

type LogLevel = 'info' | 'warn' | 'error'

interface LogMeta extends Record<string, unknown> {
    err?: string
    path?: string
    userId?: string
}

function log(level: LogLevel, message: string, meta?: LogMeta) {
    if (typeof window !== 'undefined') return

    const payload = {
        level,
        message,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        ...meta,
    }

    const output = JSON.stringify(payload)

    if (level === 'error') console.error(output)
    else if (level === 'warn') console.warn(output)
    else console.log(output)
}

export const logger = {
    info: (message: string, meta?: LogMeta) => log('info', message, meta),
    warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
    error: (message: string, meta?: LogMeta) => log('error', message, meta),
}