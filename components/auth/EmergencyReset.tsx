// components/auth/EmergencyReset.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function EmergencyReset() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mostra botão após 8 segundos (indica loading infinito)
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleReset = async () => {
    setLoading(true);
    const supabase = createClientComponentClient();
    
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Erro ao fazer signOut:', e);
    }
    
    // Limpa tudo
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpa cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Recarrega página
    window.location.href = '/';
  };

  if (!show) return null;

  return (
    <button 
      onClick={handleReset}
      disabled={loading}
      className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-5 py-3 rounded-lg shadow-2xl z-[9999] flex items-center gap-2 animate-pulse"
      style={{ 
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Limpando...
        </>
      ) : (
        <>
          🔄 Página travada? Clique aqui
        </>
      )}
    </button>
  );
}