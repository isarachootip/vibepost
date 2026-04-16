import { NextResponse } from "next/server"
import { auth } from "./auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (isOnDashboard) {
    if (!isLoggedIn) return NextResponse.redirect(new URL('/login', req.nextUrl))
    return NextResponse.next()
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
