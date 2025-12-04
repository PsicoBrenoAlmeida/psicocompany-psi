'use client'

import { createClient as createSbClient, type SupabaseClient } from '@supabase/supabase-js'

// Guarda global para sobreviver a HMR no Next.js (evita múltiplas instâncias em dev)
const globalForSupabase = globalThis as unknown as {
  __psicocompany_supabase?: SupabaseClient
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function _newClient() {
  if (!url || !anon) {
    // loga uma vez só
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Supabase não configurado: verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
    throw new Error('Configuração do Supabase está incompleta')
  }

  return createSbClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // chave estável para não “colidir” com outras instâncias
      storageKey: 'sb-auth-psicocompany',
    },
  })
}

/**
 * Mantém a mesma assinatura antiga.
 * Sempre retorna a MESMA instância (singleton).
 */
export function createClient(): SupabaseClient {
  if (!globalForSupabase.__psicocompany_supabase) {
    globalForSupabase.__psicocompany_supabase = _newClient()
  }
  return globalForSupabase.__psicocompany_supabase
}

export default createClient
