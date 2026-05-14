import { NextRequest, NextResponse } from 'next/server'
import { authenticateDoctor, createSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    )
  }

  const doctor = await authenticateDoctor(email, password)

  if (!doctor) {
    return NextResponse.json(
      { error: 'Email ou mot de passe incorrect' },
      { status: 401 }
    )
  }

  const token = await createSession(doctor)

  const response = NextResponse.json({ doctor })
  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  return response
}
