'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabaseClient'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      
      // Pequeno delay para feedback visual
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 300)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={handleLogout} 
        className="logout-button"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="spinner"></div>
            <span>Saindo...</span>
          </>
        ) : (
          <>
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Sair</span>
          </>
        )}
      </button>

      <style jsx>{`
        .logout-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
          margin-top: 12px;
        }

        .logout-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .logout-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .logout-button svg {
          flex-shrink: 0;
        }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}