import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname === '/') {
        const url = request.nextUrl.clone()
        url.pathname = '/landing-page'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/:path*',
}
