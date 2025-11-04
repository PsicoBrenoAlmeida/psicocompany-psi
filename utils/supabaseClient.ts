// utils/supabaseClient.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log('🔑 Supabase URL:', supabaseUrl)
  console.log('🔑 Supabase Key existe?', supabaseKey ? 'SIM' : 'NÃO')

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas!')
    throw new Error('Configuração do Supabase está incompleta')
  }

  // Criar cliente sem tipagem genérica (para evitar problemas de tipos)
  return createBrowserClient(supabaseUrl, supabaseKey)
}