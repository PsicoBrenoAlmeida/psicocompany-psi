'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabaseClient'
import { useToast } from '@/components/ui/Toast'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const { showToast } = useToast()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  useEffect(() => {
    // Supabase manda via hash (#access_token=...)
    const hash = window.location.hash
    const access_token = hash.split('access_token=')[1]?.split('&')[0]
    
    if (!access_token) {
      setTokenError(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!password || !confirm) {
      showToast('Preencha todos os campos', 'warning')
      return
    }

    if (password !== confirm) {
      showToast('As senhas não coincidem', 'error')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      showToast('Senha redefinida com sucesso! Faça login novamente.', 'success')
      setTimeout(() => router.push('/login'), 800)
    } catch (err: unknown) {
      const error = err as Error
      showToast(error?.message || 'Erro ao redefinir senha', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (tokenError) {
    return (
      <main className="mx-auto max-w-lg px-6 py-12 text-center">
        <h2 className="text-xl font-bold mb-3">Token inválido ou expirado</h2>
        <p className="text-gray-600 mb-6">Clique em &quot;esqueci a senha&quot; novamente para gerar um novo link.</p>
        <a href="/forgot-password" className="text-violet-600 font-semibold underline">
          Gerar novo link
        </a>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold mb-3">Definir nova senha</h1>
      <p className="text-gray-600 mb-6">
        Digite sua nova senha abaixo.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirmar nova senha</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 text-white px-4 py-2 font-semibold hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </main>
  )
}