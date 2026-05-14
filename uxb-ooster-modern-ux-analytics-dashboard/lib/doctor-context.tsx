'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface Doctor {
  id: string
  name: string
  email: string
  specialty: string
  establishment: string
  phone: string
  onmci?: string
}

interface DoctorContextValue {
  doctor: Doctor | null
  loading: boolean
  logout: () => Promise<void>
}

const DoctorContext = createContext<DoctorContextValue>({
  doctor: null,
  loading: true,
  logout: async () => {},
})

export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.doctor) setDoctor(data.doctor)
      })
      .finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <DoctorContext.Provider value={{ doctor, loading, logout }}>
      {children}
    </DoctorContext.Provider>
  )
}

export function useDoctor() {
  return useContext(DoctorContext)
}
