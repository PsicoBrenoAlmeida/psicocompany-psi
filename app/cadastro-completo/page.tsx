// app/cadastro-completo/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'

export default function CadastroCompletoPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Dados do cadastro rápido (vem da URL)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [crp, setCrp] = useState('')

  // Passo 1 - Conta e Senha
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Passo 2 - Dados Profissionais
  const [specialties, setSpecialties] = useState<string[]>([])
  const [approach, setApproach] = useState('')
  const [pricePerSession, setPricePerSession] = useState('')
  const [sessionDuration, setSessionDuration] = useState('50')
  const [gender, setGender] = useState('')
  const [education, setEducation] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [fullBio, setFullBio] = useState('')

  // Passo 3 - Dados Bancários
  const [bankName, setBankName] = useState('')
  const [bankAccountType, setBankAccountType] = useState('corrente')
  const [bankAgency, setBankAgency] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')

  const [acceptTerms, setAcceptTerms] = useState(false)

  // Carregar dados da URL
  useEffect(() => {
    const urlEmail = searchParams.get('email')
    const urlName = searchParams.get('name')
    const urlPhone = searchParams.get('phone')
    const urlCrp = searchParams.get('crp')

    if (urlEmail) setEmail(decodeURIComponent(urlEmail))
    if (urlName) setFullName(decodeURIComponent(urlName))
    if (urlPhone) setPhone(decodeURIComponent(urlPhone))
    if (urlCrp) setCrp(decodeURIComponent(urlCrp))
  }, [searchParams])

  const specialtiesList = [
    'Ansiedade', 'Depressão', 'TCC', 'Psicanálise', 'ACT',
    'DBT', 'Terapia de Casal', 'Terapia Familiar', 'TDAH',
    'Transtornos Alimentares', 'Luto', 'Trauma', 'Burnout'
  ]

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty))
    } else {
      if (specialties.length < 5) {
        setSpecialties([...specialties, specialty])
      } else {
        setMessage({ type: 'error', text: 'Máximo de 5 especialidades' })
      }
    }
  }

  const validateStep1 = () => {
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Senha deve ter no mínimo 6 caracteres' })
      return false
    }
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (specialties.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos uma especialidade' })
      return false
    }
    if (!approach.trim()) {
      setMessage({ type: 'error', text: 'Abordagem é obrigatória' })
      return false
    }
    if (!pricePerSession || parseFloat(pricePerSession) <= 0) {
      setMessage({ type: 'error', text: 'Valor da sessão inválido' })
      return false
    }
    if (!shortBio.trim()) {
      setMessage({ type: 'error', text: 'Bio resumida é obrigatória' })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!pixKey.trim()) {
      setMessage({ type: 'error', text: 'Chave PIX é obrigatória' })
      return false
    }
    if (!acceptTerms) {
      setMessage({ type: 'error', text: 'Você deve aceitar os termos de uso' })
      return false
    }
    return true
  }

  const handleNext = () => {
    setMessage(null)
    
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setMessage(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
  if (!validateStep3()) return

  try {
    setLoading(true)
    setMessage(null)

    console.log('🚀 INICIANDO CADASTRO COMPLETO')
    console.log('📋 Dados do formulário:', {
      email,
      fullName,
      phone,
      crp,
      specialties,
      approach,
      pricePerSession,
      pixKey
    })

    // 1. Criar usuário no Supabase Auth
    console.log('👤 Passo 1: Criando usuário no Auth...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: 'psychologist'
        }
      }
    })

    console.log('👤 Resultado Auth:', { authData, authError })

    if (authError) {
      console.error('❌ Erro no Auth:', authError)
      throw authError
    }
    if (!authData.user) {
      console.error('❌ Usuário não foi criado')
      throw new Error('Erro ao criar usuário')
    }

    console.log('✅ Usuário criado:', authData.user.id)

    // 2. Criar perfil básico
    console.log('📝 Passo 2: Criando perfil...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        user_type: 'psychologist',
        full_name: fullName,
        email: email,
        phone: phone,
        bio: fullBio || shortBio
      })

    console.log('📝 Resultado Profile:', { profileError })

    if (profileError) {
      console.error('❌ Erro no Profile:', profileError)
      throw profileError
    }

    console.log('✅ Perfil criado')

    // 3. Criar registro de psicólogo
    console.log('🧠 Passo 3: Criando registro de psicólogo...')
    
    const psychologistData = {
      user_id: authData.user.id,
      crp: crp,
      specialties: specialties,
      approach: approach,
      price_per_session: parseFloat(pricePerSession),
      session_duration: parseInt(sessionDuration),
      gender: gender || null,
      education: education || null,
      experience_years: experienceYears ? parseInt(experienceYears) : null,
      short_bio: shortBio,
      full_bio: fullBio || shortBio,
      bank_name: bankName || null,
      bank_account_type: bankAccountType,
      bank_agency: bankAgency || null,
      bank_account: bankAccount || null,
      pix_key_type: pixKeyType,
      pix_key: pixKey,
      is_accepting_patients: false
    }

    console.log('🧠 Dados do psicólogo:', psychologistData)

    const { error: psychologistError } = await supabase
      .from('psychologists')
      .insert(psychologistData)

    console.log('🧠 Resultado Psychologist:', { psychologistError })

    if (psychologistError) {
      console.error('❌ Erro no Psychologist:', psychologistError)
      throw psychologistError
    }

    console.log('✅ Psicólogo criado')

    // 4. Atualizar status do lead (se existir)
    console.log('📊 Passo 4: Atualizando lead...')
    const { error: leadUpdateError } = await supabase
      .from('psychologist_leads')
      .update({ status: 'approved' })
      .eq('email', email)

    if (leadUpdateError) {
      console.warn('⚠️ Erro ao atualizar lead (não crítico):', leadUpdateError)
    }

    console.log('✅ CADASTRO COMPLETO COM SUCESSO!')

    // 5. Sucesso
    setMessage({ 
      type: 'success', 
      text: 'Cadastro concluído! Aguarde aprovação...' 
    })

    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)

  } catch (error: any) {
    console.error('🔴 ERRO FINAL NO CADASTRO:', error)
    console.error('🔴 Tipo do erro:', typeof error)
    console.error('🔴 Erro completo:', JSON.stringify(error, null, 2))
    
    setMessage({ 
      type: 'error', 
      text: error.message || 'Erro ao finalizar cadastro. Veja o console para mais detalhes.'
    })
  } finally {
    setLoading(false)
  }
}

  return (
    <>
      <div className="cadastro-completo-page">
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        
        <div className="cadastro-container">
          {/* Sidebar - Progresso */}
          <div className="progress-sidebar">
            <Link href="/" className="logo-link">
              <h1 className="logo">Psicocompany</h1>
            </Link>

            <div className="progress-steps">
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-number">
                  {currentStep > 1 ? '✓' : '1'}
                </div>
                <div className="step-info">
                  <h3>Conta e Senha</h3>
                  <p>Crie sua senha de acesso</p>
                </div>
              </div>

              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-number">
                  {currentStep > 2 ? '✓' : '2'}
                </div>
                <div className="step-info">
                  <h3>Dados Profissionais</h3>
                  <p>Especialidades e valores</p>
                </div>
              </div>

              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-info">
                  <h3>Dados Bancários</h3>
                  <p>Para receber pagamentos</p>
                </div>
              </div>
            </div>

            <div className="help-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p>Precisa de ajuda? <a href="mailto:suporte@psicocompany.com">Fale conosco</a></p>
            </div>
          </div>

          {/* Formulário */}
          <div className="form-container">
            <div className="form-card">
              
              {/* PASSO 1 - Conta e Senha */}
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Crie sua senha de acesso</h2>
                    <p>Use uma senha forte para proteger sua conta</p>
                  </div>

                  <div className="info-recap">
                    <h4>Seus dados:</h4>
                    <p><strong>Nome:</strong> {fullName}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>CRP:</strong> {crp}</p>
                  </div>

                  <div className="form-group">
                    <label>Senha *</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <span className="hint">Mínimo de 6 caracteres</span>
                  </div>

                  <div className="form-group">
                    <label>Confirmar senha *</label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PASSO 2 - Dados Profissionais */}
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Dados Profissionais</h2>
                    <p>Conte mais sobre sua prática profissional</p>
                  </div>

                  <div className="form-group">
                    <label>Especialidades * (máx. 5)</label>
                    <div className="specialties-grid">
                      {specialtiesList.map((specialty) => (
                        <button
                          key={specialty}
                          type="button"
                          className={`specialty-tag ${specialties.includes(specialty) ? 'selected' : ''}`}
                          onClick={() => toggleSpecialty(specialty)}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                    <span className="hint">{specialties.length}/5 selecionadas</span>
                  </div>

                  <div className="form-group">
                    <label>Abordagem terapêutica *</label>
                    <input
                      type="text"
                      placeholder="Ex: TCC, Psicanálise, Humanista..."
                      value={approach}
                      onChange={(e) => setApproach(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Valor por sessão (R$) *</label>
                      <input
                        type="number"
                        placeholder="180.00"
                        value={pricePerSession}
                        onChange={(e) => setPricePerSession(e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="form-group">
                      <label>Duração (minutos)</label>
                      <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}>
                        <option value="40">40 min</option>
                        <option value="50">50 min</option>
                        <option value="60">60 min</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Gênero</label>
                      <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Anos de experiência</label>
                      <input
                        type="number"
                        placeholder="5"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Formação</label>
                    <input
                      type="text"
                      placeholder="Ex: Psicologia - USP, Especialização em TCC"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio resumida * (máx. 160 caracteres)</label>
                    <textarea
                      placeholder="Descrição curta que aparecerá na busca"
                      value={shortBio}
                      onChange={(e) => setShortBio(e.target.value.slice(0, 160))}
                      maxLength={160}
                      rows={2}
                    />
                    <span className="hint">{shortBio.length}/160 caracteres</span>
                  </div>

                  <div className="form-group">
                    <label>Bio completa (opcional)</label>
                    <textarea
                      placeholder="Descrição detalhada que aparecerá no seu perfil"
                      value={fullBio}
                      onChange={(e) => setFullBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* PASSO 3 - Dados Bancários */}
              {currentStep === 3 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Dados para recebimento</h2>
                    <p>Configure como você vai receber pelos atendimentos</p>
                  </div>

                  <div className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                      <line x1="2" y1="10" x2="22" y2="10"></line>
                    </svg>
                    <h3>Chave PIX (obrigatório)</h3>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de chave *</label>
                      <select value={pixKeyType} onChange={(e) => setPixKeyType(e.target.value)}>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="phone">Telefone</option>
                        <option value="random">Chave aleatória</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Chave PIX *</label>
                      <input
                        type="text"
                        placeholder={
                          pixKeyType === 'cpf' ? '000.000.000-00' :
                          pixKeyType === 'phone' ? '(11) 98765-4321' :
                          pixKeyType === 'email' ? 'seu@email.com' :
                          'Cole sua chave'
                        }
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="section-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    <h3>Dados bancários (opcional)</h3>
                  </div>

                  <div className="form-group">
                    <label>Banco</label>
                    <input
                      type="text"
                      placeholder="Ex: Banco do Brasil, Nubank..."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de conta</label>
                      <select value={bankAccountType} onChange={(e) => setBankAccountType(e.target.value)}>
                        <option value="corrente">Conta Corrente</option>
                        <option value="poupanca">Poupança</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Agência</label>
                      <input
                        type="text"
                        placeholder="0001"
                        value={bankAgency}
                        onChange={(e) => setBankAgency(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Conta</label>
                      <input
                        type="text"
                        placeholder="12345-6"
                        value={bankAccount}
                        onChange={(e) => setBankAccount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="terms-container">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                    />
                    <label htmlFor="terms" className="terms-label">
                      Concordo com os{' '}
                      <Link href="/termos" className="terms-link" target="_blank">
                        Termos de Uso
                      </Link>
                      {' '}e{' '}
                      <Link href="/privacidade" className="terms-link" target="_blank">
                        Política de Privacidade
                      </Link>
                    </label>
                  </div>
                </div>
              )}

              {/* Mensagem */}
              {message && (
                <div className={`message ${message.type}`}>
                  {message.type === 'success' ? '✓' : '⚠'} {message.text}
                </div>
              )}

              {/* Botões de navegação */}
              <div className="form-actions">
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn-back"
                    onClick={handleBack}
                    disabled={loading}
                  >
                    ← Voltar
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    className="btn-next"
                    onClick={handleNext}
                  >
                    Próximo →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-submit"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Finalizando...
                      </>
                    ) : (
                      'Finalizar cadastro'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cadastro-completo-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 50%, #ddd8f0 100%);
          position: relative;
          overflow-x: hidden;
        }

        .bg-decoration {
          position: fixed;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124, 101, 181, 0.08) 0%, transparent 70%);
          animation: float 20s ease-in-out infinite;
          z-index: 0;
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

        .cadastro-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        /* Sidebar de progresso */
        .progress-sidebar {
          background: white;
          padding: 40px 32px;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .logo-link {
          text-decoration: none;
          display: block;
          margin-bottom: 48px;
        }

        .logo {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .progress-steps {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-bottom: 48px;
        }

        .progress-step {
          display: flex;
          gap: 16px;
          opacity: 0.5;
          transition: all 0.3s ease;
        }

        .progress-step.active {
          opacity: 1;
        }

        .progress-step.completed {
          opacity: 0.8;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(124, 101, 181, 0.1);
          color: #9b8fab;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .progress-step.active .step-number {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(124, 101, 181, 0.3);
        }

        .progress-step.completed .step-number {
          background: #22c55e;
          color: white;
        }

        .step-info h3 {
          font-size: 14px;
          font-weight: 700;
          color: #2d1f3e;
          margin-bottom: 4px;
        }

        .step-info p {
          font-size: 12px;
          color: #9b8fab;
        }

        .help-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(124, 101, 181, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(124, 101, 181, 0.1);
        }

        .help-box svg {
          color: #7c65b5;
          flex-shrink: 0;
        }

        .help-box p {
          font-size: 13px;
          color: #6b5d7a;
          line-height: 1.5;
        }

        .help-box a {
          color: #7c65b5;
          text-decoration: none;
          font-weight: 600;
        }

        .help-box a:hover {
          text-decoration: underline;
        }

        /* Container do formulário */
        .form-container {
          padding: 80px 40px;
          display: flex;
          justify-content: center;
        }

        .form-card {
          width: 100%;
          max-width: 700px;
          background: white;
          border-radius: 20px;
          padding: 48px;
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.12);
        }

        .form-step {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-header {
          margin-bottom: 32px;
        }

        .step-header h2 {
          font-size: 28px;
          font-weight: 800;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .step-header p {
          color: #6b5d7a;
          font-size: 15px;
        }

        .info-recap {
          background: rgba(124, 101, 181, 0.05);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 32px;
        }

        .info-recap h4 {
          font-size: 14px;
          font-weight: 700;
          color: #7c65b5;
          margin-bottom: 12px;
        }

        .info-recap p {
          font-size: 14px;
          color: #2d1f3e;
          margin-bottom: 6px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 32px 0 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid rgba(124, 101, 181, 0.1);
        }

        .section-title svg {
          color: #7c65b5;
        }

        .section-title h3 {
          font-size: 18px;
          font-weight: 700;
          color: #2d1f3e;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid rgba(124, 101, 181, 0.15);
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group textarea {
          resize: vertical;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #7c65b5;
          box-shadow: 0 0 0 4px rgba(124, 101, 181, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .password-input {
          position: relative;
        }

        .password-input input {
          padding-right: 48px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .toggle-password:hover {
          opacity: 1;
        }

        .hint {
          display: block;
          font-size: 12px;
          color: #9b8fab;
          margin-top: 6px;
        }

        .specialties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .specialty-tag {
          padding: 10px 16px;
          border-radius: 8px;
          border: 2px solid rgba(124, 101, 181, 0.2);
          background: white;
          color: #6b5d7a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .specialty-tag:hover {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        .specialty-tag.selected {
          border-color: #7c65b5;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
        }

        .terms-container {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 32px;
        }

        .terms-container input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #7c65b5;
          cursor: pointer;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .terms-label {
          color: #6b5d7a;
          font-size: 14px;
          line-height: 1.5;
          cursor: pointer;
          user-select: none;
        }

        .terms-link {
          color: #7c65b5;
          text-decoration: none;
          font-weight: 600;
        }

        .terms-link:hover {
          text-decoration: underline;
        }

        .message {
          padding: 16px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
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

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .btn-back {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid rgba(124, 101, 181, 0.2);
          background: white;
          color: #7c65b5;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-back:hover:not(:disabled) {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        .btn-next,
        .btn-submit {
          flex: 2;
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

        .btn-next:hover,
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

        /* Responsivo */
        @media (max-width: 1024px) {
          .cadastro-container {
            grid-template-columns: 1fr;
          }

          .progress-sidebar {
            position: relative;
            height: auto;
            padding: 24px;
          }

          .progress-steps {
            flex-direction: row;
            overflow-x: auto;
          }

          .progress-step {
            flex-direction: column;
            align-items: center;
            text-align: center;
            min-width: 120px;
          }

          .form-container {
            padding: 40px 24px;
          }

          .form-card {
            padding: 32px 24px;
          }
        }

        @media (max-width: 640px) {
          .specialties-grid {
            grid-template-columns: 1fr 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-back {
            order: 2;
          }

          .btn-next,
          .btn-submit {
            order: 1;
          }
        }
      `}</style>
    </>
  )
}