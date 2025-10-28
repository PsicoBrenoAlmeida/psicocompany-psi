// utils/supabaseClient.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database.types'

let supabaseInstance: ReturnType<typeof createPagesBrowserClient<Database>> | null = null

export const createClient = () => {
  if (supabaseInstance) {
    return supabaseInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('🔑 Supabase URL:', supabaseUrl)
  console.log('🔑 Supabase Key existe?', supabaseKey ? 'SIM' : 'NÃO')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas!')
    throw new Error('Configuração do Supabase está incompleta')
  }

  supabaseInstance = createPagesBrowserClient<Database>({
    supabaseUrl,
    supabaseKey,
  })

  return supabaseInstance
}