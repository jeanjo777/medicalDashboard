import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function GET() {
  const doctor = await verifySession()

  if (!doctor) {
    return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })
  }

  return NextResponse.json({ doctor })
}
