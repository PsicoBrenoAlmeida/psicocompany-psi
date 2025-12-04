// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import { useToast } from '@/components/ui/Toast'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string}>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors: {email?: string, password?: string} = {}
    
    if (!email) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido'
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showToast('Por favor, corrija os erros no formulário', 'error')
      return
    }
    
    setLoading(true)

    try {
      console.log('🔐 Tentando fazer login...') // Debug
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(), // Remove espaços em branco
        password
      })

      console.log('📊 Resposta do login:', { data, error }) // Debug

      if (error) {
        console.error('❌ Erro no login:', error) // Debug
        
        // Mensagens de erro mais amigáveis
        let message = 'Erro ao fazer login'
        
        if (error.message.includes('Invalid login credentials')) {
          message = 'E-mail ou senha incorretos'
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Por favor, confirme seu e-mail antes de fazer login'
        } else if (error.message.includes('Invalid email')) {
          message = 'E-mail inválido'
        } else {
          message = error.message
        }
        
        showToast(message, 'error')
        return // Para aqui se houver erro
      }

      // Se chegou aqui, login foi bem-sucedido
      console.log('✅ Login bem-sucedido!') // Debug
      showToast('Login realizado com sucesso!', 'success')
      
      // Pequeno delay para o toast aparecer antes do redirect
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh() // Força atualização da sessão
      }, 500)
      
    } catch (err: any) {
      console.error('❌ Erro catch:', err) // Debug
      showToast(err?.message || 'Ocorreu um erro ao fazer login. Tente novamente.', 'error')
    } finally {
      // Garante que loading seja resetado SEMPRE
      setLoading(false)
    }
  }

  return (
    <>
      <div className="login-page">
        {/* Decorações de fundo */}
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        
        <div className="login-container">
          {/* Lado esquerdo - Branding */}
          <div className="branding-side">
            <Link href="/" className="logo-link">
              <h1 className="logo">Psicocompany</h1>
            </Link>
            <div className="badge-pro">👨‍⚕️ Para Psicólogos</div>
            <h2 className="branding-title">
              Bem-vindo de volta ao seu <span className="gradient-text">consultório digital</span>
            </h2>
            <p className="branding-subtitle">
              Acesse sua conta e continue gerenciando seus atendimentos, 
              pacientes e agenda profissional.
            </p>
            
            <div className="features">
              <div className="feature">
                <div className="feature-icon">📅</div>
                <div>
                  <h3>Agenda Completa</h3>
                  <p>Gerencie seus horários e atendimentos</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">👥</div>
                <div>
                  <h3>Pacientes</h3>
                  <p>Acesse histórico e prontuários</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">💰</div>
                <div>
                  <h3>Financeiro</h3>
                  <p>Acompanhe seus ganhos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="form-side">
            <div className="login-card">
              <div className="form-header">
                <h2 className="form-title">Entrar na conta</h2>
                <p className="form-subtitle">Acesse seu painel profissional</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>E-mail profissional</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors({...errors, email: undefined})
                    }}
                    onBlur={() => {
                      if (email && !validateEmail(email)) {
                        setErrors({...errors, email: 'E-mail inválido'})
                      }
                    }}
                    className={errors.email ? 'error' : ''}
                    disabled={loading}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label>Senha</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setErrors({...errors, password: undefined})
                      }}
                      className={errors.password ? 'error' : ''}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-options">
                  <div className="checkbox-container">
                    <input 
                      type="checkbox" 
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <label htmlFor="remember">Lembrar-me</label>
                  </div>
                  <Link href="/forgot-password" className="forgot-link">
                    Esqueceu a senha?
                  </Link>
                </div>

                <button 
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Entrando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">ou</span>
                <div className="divider-line"></div>
              </div>

              <div className="signup-section">
                <p className="signup-text">Ainda não tem cadastro?</p>
                <Link href="/cadastro-rapido" className="btn-signup">
                  Criar conta profissional
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 50%, #ddd8f0 100%);
          position: relative;
          overflow: hidden;
          padding: 80px 24px 40px;
        }

        /* Decorações de fundo */
        .bg-decoration {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124, 101, 181, 0.08) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
        }

        .bg-decoration-1 {
          width: 500px;
          height: 500px;
          top: -250px;
          left: -100px;
        }

        .bg-decoration-2 {
          width: 350px;
          height: 350px;
          bottom: -175px;
          right: -50px;
          animation-delay: -7s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .login-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        /* Lado esquerdo - Branding */
        .branding-side {
          padding: 32px;
          animation: slideInLeft 0.8s ease;
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .logo-link {
          display: inline-block;
          text-decoration: none;
        }

        .logo {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .badge-pro {
          display: inline-block;
          padding: 8px 16px;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 24px;
        }

        .branding-title {
          font-size: 42px;
          font-weight: 900;
          color: #2d1f3e;
          margin-bottom: 20px;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .branding-subtitle {
          font-size: 18px;
          color: #6b5d7a;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }

        .feature:nth-child(1) { animation-delay: 0.2s; }
        .feature:nth-child(2) { animation-delay: 0.3s; }
        .feature:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .feature h3 {
          font-size: 16px;
          font-weight: 700;
          color: #2d1f3e;
          margin-bottom: 4px;
        }

        .feature p {
          font-size: 14px;
          color: #6b5d7a;
          line-height: 1.4;
        }

        /* Lado direito - Formulário */
        .form-side {
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: slideInRight 0.8s ease;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.12);
          position: relative;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          border-radius: 20px 20px 0 0;
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .form-title {
          font-size: 28px;
          font-weight: 800;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .form-subtitle {
          color: #6b5d7a;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid rgba(124, 101, 181, 0.15);
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #7c65b5;
          box-shadow: 0 0 0 4px rgba(124, 101, 181, 0.1);
        }

        .form-group input.error {
          border-color: #ef4444;
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .password-toggle:hover:not(:disabled) {
          opacity: 1;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
        }

        .error-message {
          display: block;
          color: #ef4444;
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-container input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #7c65b5;
          cursor: pointer;
        }

        .checkbox-container input[type="checkbox"]:disabled {
          cursor: not-allowed;
        }

        .checkbox-container label {
          color: #6b5d7a;
          font-size: 14px;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }

        .forgot-link {
          color: #7c65b5;
          font-size: 14px;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #6952a0;
        }

        .btn-submit {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(124, 101, 181, 0.25);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(124, 101, 181, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(124, 101, 181, 0.15);
        }

        .divider-text {
          color: #9b8fab;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .signup-section {
          text-align: center;
        }

        .signup-text {
          color: #6b5d7a;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .btn-signup {
          display: block;
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid rgba(124, 101, 181, 0.2);
          background: white;
          color: #7c65b5;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          transition: all 0.3s ease;
        }

        .btn-signup:hover {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        /* Responsivo */
        @media (max-width: 968px) {
          .login-container {
            grid-template-columns: 1fr;
            gap: 40px;
            max-width: 600px;
          }

          .branding-side {
            text-align: center;
            padding: 20px;
          }

          .branding-title {
            font-size: 32px;
          }

          .features {
            max-width: 400px;
            margin: 0 auto;
          }

          .form-side {
            padding: 0;
          }
        }

        @media (max-width: 640px) {
          .login-page {
            padding: 100px 16px 40px;
          }

          .branding-title {
            font-size: 28px;
          }

          .form-title {
            font-size: 24px;
          }

          .logo {
            font-size: 28px;
          }

          .login-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  )
}