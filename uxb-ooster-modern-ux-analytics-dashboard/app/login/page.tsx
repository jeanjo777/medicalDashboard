'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#c5c3d1] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="rounded-2xl lg:rounded-3xl bg-[#f5f4f0] p-6 sm:p-8 shadow-2xl">
          {/* Logo / Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4 shadow-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black">MediCare</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Espace Medecin - Connexion</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dr.konan@medicare.com"
                required
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-black border border-gray-200 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                required
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-black border border-gray-200 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Doctor Accounts Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-[10px] sm:text-xs text-gray-500 text-center mb-3">Comptes disponibles</p>
            <div className="space-y-2">
              {[
                { name: 'Pr Karama', email: 'pr.karama@medicare.com', specialty: 'Centre Medico Social SIFCA', pwd: 'Karama2026!' },
                { name: 'Dr ZAGO Mario', email: 'dr.zago@medicare.com', specialty: 'Medecin Chef PALMCI', pwd: 'Zago2026!' },
                { name: 'Dr Administrateur', email: 'dr.admin@medicare.com', specialty: 'Administration', pwd: 'Admin2026!' },
              ].map((doc) => (
                <button
                  key={doc.email}
                  type="button"
                  onClick={() => {
                    setEmail(doc.email)
                    setPassword(doc.pwd)
                  }}
                  className="w-full rounded-xl bg-white p-3 text-left border border-gray-100 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                      {doc.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-black">{doc.name}</div>
                      <div className="text-[10px] text-gray-500">{doc.specialty}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
