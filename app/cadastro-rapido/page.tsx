// app/cadastro-rapido/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'

export default function CadastroRapidoPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Dados básicos
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [crp, setCrp] = useState('')

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const formatCRP = (value: string) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 8)}` // Permite até 8 dígitos (2 + 6)
}

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    if (!fullName.trim()) {
      setMessage({ type: 'error', text: 'Nome completo é obrigatório' })
      return false
    }

    if (!email.trim() || !validateEmail(email)) {
      setMessage({ type: 'error', text: 'Email válido é obrigatório' })
      return false
    }

    if (!phone.trim()) {
      setMessage({ type: 'error', text: 'Telefone é obrigatório' })
      return false
    }

    if (!crp.trim()) {
      setMessage({ type: 'error', text: 'CRP é obrigatório' })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      setMessage(null)

      console.log('🚀 Iniciando salvamento...')
      console.log('📋 Dados:', { fullName, email, phone, crp })

      // Salvar lead no banco (tabela psychologist_leads)
      const { data, error: leadError } = await supabase
        .from('psychologist_leads')
        .insert({
          full_name: fullName,
          email: email,
          phone: phone,
          crp: crp,
          status: 'pending'
        })

      console.log('📥 Resposta do Supabase:', { data, error: leadError })

      if (leadError) {
        console.error('❌ Erro detalhado do Supabase:', {
          message: leadError.message,
          details: leadError.details,
          hint: leadError.hint,
          code: leadError.code
        })
        throw new Error(`Erro ao salvar: ${leadError.message}`)
      }

      console.log('✅ Lead salvo com sucesso!')

      setMessage({ 
        type: 'success', 
        text: 'Dados salvos! Redirecionando para completar cadastro...' 
      })

      // Redirecionar para o cadastro completo com os dados preenchidos
      setTimeout(() => {
        router.push(`/cadastro-completo?email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}&phone=${encodeURIComponent(phone)}&crp=${encodeURIComponent(crp)}`)
      }, 2000)

    } catch (error: any) {
      console.error('🔴 ERRO FINAL:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao salvar dados. Veja o console para detalhes.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="cadastro-rapido-page">
        {/* Decorações de fundo */}
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        
        <div className="cadastro-container">
          {/* Lado esquerdo - Branding */}
          <div className="branding-side">
            <Link href="/" className="logo-link">
              <h1 className="logo">Psicocompany</h1>
            </Link>
            <div className="badge-pro">👨‍⚕️ Para Psicólogos</div>
            <h2 className="branding-title">
              Transforme sua prática em <span className="gradient-text">consultório digital</span>
            </h2>
            <p className="branding-subtitle">
              Comece seu cadastro agora e tenha acesso a uma plataforma completa 
              para atender seus pacientes online.
            </p>
            
            <div className="features">
              <div className="feature">
                <div className="feature-icon">💼</div>
                <div>
                  <h3>Gestão Completa</h3>
                  <p>Agenda, prontuários e pagamentos em um só lugar</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">💰</div>
                <div>
                  <h3>Receba por Pix</h3>
                  <p>Pagamentos rápidos e seguros direto na sua conta</p>
                </div>
              </div>
              <div className="feature">
                <div className="feature-icon">🎯</div>
                <div>
                  <h3>Pacientes Qualificados</h3>
                  <p>Conecte-se com quem realmente precisa de ajuda</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="form-side">
            <div className="cadastro-card">
              <div className="progress-bar">
                <div className="progress-step active">
                  <div className="step-circle">1</div>
                  <span>Dados básicos</span>
                </div>
                <div className="progress-line"></div>
                <div className="progress-step">
                  <div className="step-circle">2</div>
                  <span>Cadastro completo</span>
                </div>
              </div>

              <div className="form-header">
                <h2 className="form-title">Comece seu cadastro</h2>
                <p className="form-subtitle">Preencha seus dados básicos para começar</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="form-group">
                  <label>Nome completo *</label>
                  <input
                    type="text"
                    placeholder="Maria Silva Santos"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label>E-mail profissional *</label>
                  <input
                    type="email"
                    placeholder="maria@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="hint">Usaremos para login e comunicações</span>
                </div>

                <div className="form-group">
                  <label>Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={15}
                  />
                  <span className="hint">Para contato e confirmações</span>
                </div>

                <div className="form-group">
                  <label>CRP (Conselho Regional de Psicologia) *</label>
                  <input
                    type="text"
                    placeholder="06/123456"
                    value={crp}
                    onChange={(e) => setCrp(formatCRP(e.target.value))}
                    maxLength={9}
                  />
                  <span className="hint">Será verificado para aprovação</span>
                </div>

                {/* Mensagem */}
                {message && (
                  <div className={`message ${message.type}`}>
                    {message.type === 'success' ? '✓' : '⚠'} {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      Continuar cadastro
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="info-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <p>
                  Seus dados estão seguros e serão usados apenas para validação 
                  profissional e comunicação sobre a plataforma.
                </p>
              </div>

              <div className="login-section">
                <p className="login-text">Já tem cadastro?</p>
                <Link href="/login" className="btn-login">
                  Fazer login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cadastro-rapido-page {
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

        /* Container principal */
        .cadastro-container {
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

        .cadastro-card {
          width: 100%;
          max-width: 480px;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.12);
          position: relative;
        }

        .cadastro-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          border-radius: 20px 20px 0 0;
        }

        /* Progress Bar */
        .progress-bar {
          display: flex;
          align-items: center;
          margin-bottom: 32px;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(124, 101, 181, 0.1);
          color: #9b8fab;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .progress-step.active .step-circle {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
        }

        .progress-step span {
          font-size: 12px;
          color: #9b8fab;
          font-weight: 600;
        }

        .progress-step.active span {
          color: #7c65b5;
        }

        .progress-line {
          height: 2px;
          flex: 1;
          background: rgba(124, 101, 181, 0.2);
          margin: 0 8px;
          margin-bottom: 28px;
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

        .hint {
          display: block;
          font-size: 12px;
          color: #9b8fab;
          margin-top: 6px;
        }

        .info-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          margin-bottom: 20px;
        }

        .info-box svg {
          color: #3b82f6;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-box p {
          font-size: 13px;
          color: #6b5d7a;
          line-height: 1.5;
        }

        .message {
          padding: 16px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.success {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
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

        .login-section {
          text-align: center;
          margin-top: 24px;
        }

        .login-text {
          color: #6b5d7a;
          font-size: 14px;
          margin-bottom: 16px;
        }

        .btn-login {
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

        .btn-login:hover {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        /* Responsivo */
        @media (max-width: 968px) {
          .cadastro-container {
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
          .cadastro-rapido-page {
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

          .cadastro-card {
            padding: 32px 24px;
          }

          .progress-step span {
            font-size: 11px;
          }
        }
      `}</style>
    </>
  )
}