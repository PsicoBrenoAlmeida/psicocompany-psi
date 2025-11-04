// app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Se já estiver logado, redireciona para o dashboard
      if (user) {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <main className="home-page">
          <div className="loading">
            <div className="spinner"></div>
          </div>
        </main>
        <style jsx>{styles}</style>
      </>
    )
  }

  return (
    <>
      <main className="home-page">
        <div className="home-container">
          
          {/* Logo/Brand */}
          <div className="brand">
            <div className="brand-icon">👨‍⚕️</div>
            <h1>Portal do Psicólogo</h1>
            <p>Psicocompany</p>
          </div>

          {/* Welcome Text */}
          <div className="welcome-text">
            <h2>Bem-vindo!</h2>
            <p>Acesse sua conta para gerenciar sua agenda, pacientes e atendimentos</p>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link href="/login" className="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Já tenho conta
            </Link>

            <Link href="/cadastro-rapido" className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Criar minha conta
            </Link>
          </div>

          {/* Features */}
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Agenda Inteligente</h3>
              <p>Gerencie seus horários e atendimentos</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Gestão de Pacientes</h3>
              <p>Acompanhe o histórico completo</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Controle Financeiro</h3>
              <p>Organize seus ganhos e pagamentos</p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{styles}</style>
    </>
  )
}

const styles = `
  .home-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 50%, #ddd8f0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 120px 24px 60px;
    position: relative;
    overflow: hidden;
  }

  .home-page::before {
    content: '';
    position: absolute;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(124, 101, 181, 0.08) 0%, transparent 70%);
    top: -200px;
    right: -100px;
    animation: float 20s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(30px, -30px); }
  }

  .home-container {
    max-width: 600px;
    margin: 0 auto;
    position: relative;
    z-index: 2;
  }

  /* Brand */
  .brand {
    text-align: center;
    margin-bottom: 40px;
  }

  .brand-icon {
    font-size: 64px;
    margin-bottom: 16px;
    animation: bounce 2s ease-in-out infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .brand h1 {
    font-size: 36px;
    font-weight: 800;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .brand p {
    font-size: 16px;
    color: #7c65b5;
    font-weight: 600;
  }

  /* Welcome Text */
  .welcome-text {
    text-align: center;
    margin-bottom: 40px;
  }

  .welcome-text h2 {
    font-size: 28px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 12px;
  }

  .welcome-text p {
    font-size: 16px;
    color: #6b5d7a;
    line-height: 1.6;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 60px;
  }

  .btn-primary,
  .btn-secondary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 18px 32px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .btn-primary {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 28px rgba(124, 101, 181, 0.4);
  }

  .btn-secondary {
    background: white;
    color: #7c65b5;
    border-color: #7c65b5;
  }

  .btn-secondary:hover {
    background: #7c65b5;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.2);
  }

  /* Features */
  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px;
  }

  .feature-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.08);
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 24px rgba(124, 101, 181, 0.15);
  }

  .feature-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .feature-card h3 {
    font-size: 15px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .feature-card p {
    font-size: 13px;
    color: #6b5d7a;
    line-height: 1.4;
  }

  /* Loading */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(124, 101, 181, 0.1);
    border-top-color: #7c65b5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .home-page {
      padding: 100px 20px 40px;
    }

    .brand h1 {
      font-size: 28px;
    }

    .brand-icon {
      font-size: 48px;
    }

    .welcome-text h2 {
      font-size: 24px;
    }

    .welcome-text p {
      font-size: 15px;
    }

    .features {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .brand h1 {
      font-size: 24px;
    }

    .welcome-text h2 {
      font-size: 20px;
    }

    .btn-primary,
    .btn-secondary {
      padding: 16px 24px;
      font-size: 15px;
    }
  }
`