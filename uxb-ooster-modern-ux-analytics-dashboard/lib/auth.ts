import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'medicare-secret-key-change-in-production-2026'
)

export interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  establishment: string
  phone: string
  onmci?: string
}

const DOCTORS: { email: string; doctor: Doctor; password: string }[] = [
  {
    email: 'pr.karama@medicare.com',
    password: 'Karama2026!',
    doctor: {
      id: 'doc-001',
      name: 'Pr Karama',
      email: 'pr.karama@medicare.com',
      specialty: 'Medecin - Service Medical',
      establishment: 'Centre Medico Social SIFCA',
      phone: '27 21 75 75 59',
    },
  },
  {
    email: 'dr.zago@medicare.com',
    password: 'Zago2026!',
    doctor: {
      id: 'doc-002',
      name: 'Dr ZAGO Mario',
      email: 'dr.zago@medicare.com',
      specialty: 'Medecin du Travail - Medecin Chef PALMCI',
      establishment: 'PALMCI',
      phone: '21 75 75 53',
      onmci: '5215',
    },
  },
  {
    email: 'dr.admin@medicare.com',
    password: 'Admin2026!',
    doctor: {
      id: 'doc-003',
      name: 'Dr Administrateur',
      email: 'dr.admin@medicare.com',
      specialty: 'Administration',
      establishment: 'MediCare',
      phone: '',
    },
  },
]

export async function authenticateDoctor(
  email: string,
  password: string
): Promise<Doctor | null> {
  const entry = DOCTORS.find((d) => d.email === email.toLowerCase())
  if (!entry) return null

  if (entry.password !== password) return null

  return entry.doctor
}

export async function createSession(doctor: Doctor): Promise<string> {
  const token = await new SignJWT({
    id: doctor.id,
    name: doctor.name,
    email: doctor.email,
    specialty: doctor.specialty,
    establishment: doctor.establishment,
    phone: doctor.phone,
    onmci: doctor.onmci,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)

  return token
}

export async function verifySession(): Promise<Doctor | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      specialty: payload.specialty as string,
      establishment: payload.establishment as string,
      phone: payload.phone as string,
      onmci: payload.onmci as string | undefined,
    }
  } catch {
    return null
  }
}

export function getDoctorsList(): Omit<Doctor, 'email'>[] {
  return DOCTORS.map((d) => ({
    id: d.doctor.id,
    name: d.doctor.name,
    specialty: d.doctor.specialty,
  }))
}
