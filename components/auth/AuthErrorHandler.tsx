// components/auth/AuthErrorHandler.tsx
'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AuthErrorHandler() {
  const router = useRouter();
  
  useEffect(() => {
    const supabase = createClientComponentClient();
    let errorCount = 0;
    const MAX_ERRORS = 2; // Após 2 erros, limpa tudo

    // Listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);
        
        // Detecta erro de refresh token
        if (event === 'TOKEN_REFRESHED' && !session) {
          errorCount++;
          console.warn(`⚠️ Erro de refresh token (${errorCount}/${MAX_ERRORS})`);
          
          if (errorCount >= MAX_ERRORS) {
            console.error('❌ Token corrompido detectado - limpando sessão');
            await cleanupAndRedirect();
          }
        } else if (session) {
          // Reset contador se sessão válida
          errorCount = 0;
        }
      }
    );

    // Verifica sessão inicial e detecta erro imediatamente
    const checkInitialSession = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error && error.message.includes('Invalid Refresh Token')) {
          console.error('❌ Token inválido na inicialização');
          await cleanupAndRedirect();
        }
      } catch (err) {
        console.error('❌ Erro ao verificar sessão:', err);
        // Não redireciona aqui, deixa o fluxo normal
      }
    };

    // Função de limpeza
    const cleanupAndRedirect = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Erro ao fazer signOut:', e);
      }
      
      // Limpa storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Limpa cookies do Supabase
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Redireciona
      router.push('/login');
      router.refresh();
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}