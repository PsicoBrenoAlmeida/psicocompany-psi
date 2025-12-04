'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useToast } from '@/components/ui/Toast'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Ajuste isso para onde o usuário deve ser redirecionado para DEFINIR a nova senha
// após clicar no link do e-mail (precisa existir a página /reset-password se você for usá-la).
const APP_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://psi.psicocompany.com.br'
const RESET_REDIRECT = `${APP_URL}/reset-password`

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      showToast('Informe um e-mail válido.', 'warning')
      return
    }
    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: RESET_REDIRECT,
      })
      if (error) throw error
      showToast('Enviamos um link para redefinir sua senha (verifique o e-mail).', 'success')
      setEmail('')
    } catch (err: any) {
      showToast(err?.message || 'Não foi possível enviar o e-mail. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-bold mb-2">Esqueci minha senha</h1>
      <p className="text-sm text-gray-600 mb-6">
        Informe o seu e-mail cadastrado. Vamos enviar um link para você definir uma nova senha.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="voce@exemplo.com"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-violet-600 px-4 py-2 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? 'Enviando…' : 'Enviar link'}
        </button>

        <div className="text-xs text-gray-500">
          Ao continuar, você concorda com nossos{' '}
          <a className="underline hover:text-violet-700" href="/termos">
            Termos de Uso
          </a>
          .
        </div>
      </form>
    </main>
  )
}