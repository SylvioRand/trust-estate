import { useState } from 'react'
import './App.css'

interface User {
  id: string
  email: string
  emailVerified: boolean
  firstName: string
  lastName: string
  phone: string
  role: string
  creditBalance: number
  createdAt: string
  sellerStats?: {
    totalListings: number
    averageRating: number
  }
}

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUser(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
        return
      }

      setUser(data)
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏠 Trust Estate</h1>
          <p className="text-purple-300">Plateforme immobilière Madagascar</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Connexion</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-purple-200 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-purple-200 text-sm mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="mt-6 bg-green-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
            <h3 className="text-xl font-semibold text-green-400 mb-4">✅ Connecté !</h3>
            <div className="space-y-2 text-white">
              <p><span className="text-gray-400">Nom:</span> {user.firstName} {user.lastName}</p>
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">Téléphone:</span> {user.phone}</p>
              <p><span className="text-gray-400">Rôle:</span> {user.role}</p>
              <p><span className="text-gray-400">Crédits:</span> {user.creditBalance} 💰</p>
              <p><span className="text-gray-400">Email vérifié:</span> {user.emailVerified ? '✅' : '❌'}</p>
              {user.sellerStats && (
                <>
                  <p><span className="text-gray-400">Annonces:</span> {user.sellerStats.totalListings}</p>
                  <p><span className="text-gray-400">Note moyenne:</span> {user.sellerStats.averageRating} ⭐</p>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-4">ID: {user.id}</p>
          </div>
        )}

        {/* Test Hint */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Test avec:</p>
          <code className="text-purple-300 text-xs">steinleisilva2.0@gmail.com</code>
        </div>
      </div>
    </div>
  )
}

export default App
