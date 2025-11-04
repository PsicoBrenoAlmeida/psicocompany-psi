'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'

export default function CompletarPerfilParte2() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(5)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 5 - Logística
  const [ageGroups, setAgeGroups] = useState<string[]>([])
  const [modality, setModality] = useState<string[]>(['online'])
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [languages, setLanguages] = useState<string[]>(['Português'])

  // Step 6 - Dados Bancários
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountType, setBankAccountType] = useState('corrente')
  const [bankAgency, setBankAgency] = useState('')
  const [bankAccount, setBankAccount] = useState('')

  const ageGroupsList = [
    { label: 'Crianças (0-12 anos)', value: 'Crianças (0-12 anos)', premium: true },
    { label: 'Adolescentes (13-17 anos)', value: 'Adolescentes (13-17 anos)', premium: true },
    { label: 'Adultos (18-59 anos)', value: 'Adultos (18-59 anos)', premium: false },
    { label: 'Idosos (60+ anos)', value: 'Idosos (60+ anos)', premium: false },
    { label: 'Casais', value: 'Casais', premium: true },
    { label: 'Famílias', value: 'Famílias', premium: true }
  ]

  const languagesList = [
    'Português',
    'Inglês',
    'Espanhol',
    'Francês',
    'Italiano',
    'Alemão',
    'Mandarim',
    'Libras'
  ]

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setInitialLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data: psychData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (psychData) {
        // Carregar dados da Parte 2 (se já existirem)
        setPixKeyType(psychData.pix_key_type || 'cpf')
        setPixKey(psychData.pix_key || '')
        setBankName(psychData.bank_name || '')
        setBankAccountType(psychData.bank_account_type || 'corrente')
        setBankAgency(psychData.bank_agency || '')
        setBankAccount(psychData.bank_account || '')
        
        if (psychData.age_groups) setAgeGroups(psychData.age_groups)
        if (psychData.modality) setModality(psychData.modality)
        if (psychData.city) setCity(psychData.city)
        if (psychData.state_location) setState(psychData.state_location)
        if (psychData.languages) setLanguages(psychData.languages)
      } else {
        // Se não tem dados, significa que não completou a Parte 1
        setMessage({ type: 'error', text: 'Complete a Parte 1 primeiro!' })
        setTimeout(() => {
          router.push('/completar-perfil/parte-1')
        }, 2000)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const toggleAgeGroup = (group: string) => {
    if (ageGroups.includes(group)) {
      setAgeGroups(ageGroups.filter(g => g !== group))
    } else {
      setAgeGroups([...ageGroups, group])
    }
  }

  const toggleModality = (mod: string) => {
    if (modality.includes(mod)) {
      if (mod === 'online') return // Online é obrigatório
      setModality(modality.filter(m => m !== mod))
    } else {
      setModality([...modality, mod])
    }
  }

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (lang === 'Português') return // Português é obrigatório
      setLanguages(languages.filter(l => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  const validateStep5 = () => {
    if (ageGroups.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos uma faixa etária' })
      return false
    }
    return true
  }

  const validateStep6 = () => {
    if (!pixKey.trim()) {
      setMessage({ type: 'error', text: 'Chave PIX é obrigatória' })
      return false
    }
    return true
  }

  const handleNext = () => {
    setMessage(null)
    
    if (currentStep === 5 && !validateStep5()) return
    
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 5) {
      setCurrentStep(currentStep - 1)
      setMessage(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Se está no step 5 e clica em voltar, vai para a Parte 1
      router.push('/completar-perfil/parte-1')
    }
  }

  const handleContinueToPart3 = async () => {
    if (!validateStep6()) return

    try {
      setLoading(true)
      setMessage(null)

      console.log('💾 Salvando Parte 2...')

      const updateData: any = {
        age_groups: ageGroups,
        modality: modality,
        city: city || null,
        state_location: state || null,
        languages,
        pix_key_type: pixKeyType,
        pix_key: pixKey,
        bank_name: bankName || null,
        bank_account_type: bankAccountType,
        bank_agency: bankAgency || null,
        bank_account: bankAccount || null
      }

      const { error } = await supabase
        .from('psychologists')
        .update(updateData)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao atualizar:', error)
        throw error
      }

      console.log('✅ Parte 2 salva!')

      // Redirecionar para Parte 3
      router.push('/completar-perfil/parte-3')

    } catch (error: any) {
      console.error('🔴 ERRO:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao salvar dados'
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <div className="completar-perfil-page">
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>
        
        <div className="perfil-container">
          {/* Sidebar */}
          <div className="progress-sidebar">
            <Link href="/dashboard" className="logo-link">
              <h1 className="logo">Psicocompany</h1>
            </Link>

            <div className="progress-info">
              <h3>Parte 2 de 3</h3>
              <p>Logística e Pagamento</p>
            </div>

            <div className="progress-steps">
              {[
                { num: 5, title: 'Logística', desc: 'Atendimento' },
                { num: 6, title: 'Pagamento', desc: 'Dados bancários' }
              ].map((step) => (
                <div 
                  key={step.num}
                  className={`progress-step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                >
                  <div className="step-number">
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <div className="step-info">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="back-to-part1">
              <Link href="/completar-perfil/parte-1" className="link-back">
                ← Voltar para Parte 1
              </Link>
            </div>
          </div>

          {/* Formulário */}
          <div className="form-container">
            <div className="form-card">
              
              {/* STEP 5 - Logística */}
              {currentStep === 5 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Logística de Atendimento</h2>
                    <p>Defina como e quem você atende</p>
                  </div>

                  <div className="form-group">
                    <label>Faixa etária que atende *</label>
                    <div className="premium-info-box">
                      💡 Você pode selecionar <strong>todas as faixas</strong>. No Plano <strong>Essencial</strong>, apenas Adultos e Idosos estarão disponíveis. Com o Plano <strong className="premium-text">Premium</strong>, todas as faixas (incluindo Crianças, Adolescentes, Casais e Famílias) estarão disponíveis.
                    </div>
                    <div className="selection-grid">
                      {ageGroupsList.map((group) => (
                        <button
                          key={group.value}
                          type="button"
                          className={`selection-tag ${ageGroups.includes(group.value) ? 'selected' : ''} ${group.premium ? 'premium' : ''}`}
                          onClick={() => toggleAgeGroup(group.value)}
                        >
                          {group.label}
                          {group.premium && <span className="premium-badge">PREMIUM</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Modalidade de atendimento *</label>
                    <div className="premium-info-box">
                      💡 Você pode selecionar <strong>todas as modalidades</strong>. No Plano <strong>Essencial</strong>, apenas Online está disponível. Com o Plano <strong className="premium-text">Premium</strong>, Presencial e Híbrido também estarão disponíveis.
                    </div>
                    <div className="selection-grid">
                      <button
                        type="button"
                        className={`selection-tag ${modality.includes('online') ? 'selected' : ''}`}
                        onClick={() => toggleModality('online')}
                      >
                        Online
                        <span className="required-badge">OBRIGATÓRIO</span>
                      </button>
                      <button
                        type="button"
                        className={`selection-tag premium ${modality.includes('presencial') ? 'selected' : ''}`}
                        onClick={() => toggleModality('presencial')}
                      >
                        Presencial
                        <span className="premium-badge">PREMIUM</span>
                      </button>
                      <button
                        type="button"
                        className={`selection-tag premium ${modality.includes('hibrido') ? 'selected' : ''}`}
                        onClick={() => toggleModality('hibrido')}
                      >
                        Híbrido
                        <span className="premium-badge">PREMIUM</span>
                      </button>
                    </div>
                  </div>

                  {(modality.includes('presencial') || modality.includes('hibrido')) && (
                    <div className="conditional-fields">
                      <div className="info-box" style={{ marginBottom: '20px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <p>Você selecionou atendimento presencial ou híbrido. Informe sua localização:</p>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Cidade</label>
                          <input
                            type="text"
                            placeholder="São Paulo"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Estado</label>
                          <input
                            type="text"
                            placeholder="SP"
                            value={state}
                            onChange={(e) => setState(e.target.value.toUpperCase())}
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '32px' }}>
                    <label>Idiomas de atendimento *</label>
                    <div className="selection-grid">
                      {languagesList.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={`selection-tag ${languages.includes(lang) ? 'selected' : ''}`}
                          onClick={() => toggleLanguage(lang)}
                          disabled={lang === 'Português'}
                        >
                          {lang}
                          {lang === 'Português' && <span className="required-badge">OBRIGATÓRIO</span>}
                        </button>
                      ))}
                    </div>
                    <span className="hint">Português é obrigatório</span>
                  </div>
                </div>
              )}

              {/* STEP 6 - Dados Bancários */}
              {currentStep === 6 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Dados para Recebimento</h2>
                    <p>Configure como você vai receber pelos atendimentos</p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de chave PIX *</label>
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
                        placeholder="Cole sua chave PIX"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="section-divider">
                    <span>Dados bancários opcionais</span>
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

                  <div className="info-box" style={{ marginTop: '32px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <p><strong>Próximo passo:</strong> Escolha de plano, documentos e revisão final</p>
                  </div>
                </div>
              )}

              {/* Mensagem */}
              {message && (
                <div className={`message ${message.type}`}>
                  {message.type === 'success' ? '✓' : '⚠'} {message.text}
                </div>
              )}

              {/* Botões */}
              <div className="form-actions">
                <button type="button" className="btn-back" onClick={handleBack} disabled={loading}>
                  ← Voltar
                </button>

                {currentStep < 6 ? (
                  <button type="button" className="btn-next" onClick={handleNext}>
                    Próximo →
                  </button>
                ) : (
                  <button type="button" className="btn-submit" onClick={handleContinueToPart3} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Salvando...
                      </>
                    ) : (
                      'Continuar para Parte 3 →'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .completar-perfil-page {
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

        .perfil-container {
          display: grid;
          grid-template-columns: 320px 1fr;
          min-height: 100vh;
          position: relative;
          z-index: 1;
        }

        .progress-sidebar {
          background: white;
          padding: 40px 32px;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .logo-link {
          text-decoration: none;
          display: block;
          margin-bottom: 32px;
        }

        .logo {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .progress-info {
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(124, 101, 181, 0.1) 0%, rgba(169, 150, 221, 0.1) 100%);
          border-radius: 12px;
          margin-bottom: 32px;
        }

        .progress-info h3 {
          font-size: 14px;
          font-weight: 700;
          color: #7c65b5;
          margin-bottom: 4px;
        }

        .progress-info p {
          font-size: 12px;
          color: #6b5d7a;
        }

        .progress-steps {
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
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

        .back-to-part1 {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 2px solid rgba(124, 101, 181, 0.1);
        }

        .link-back {
          display: block;
          padding: 12px 16px;
          text-align: center;
          color: #7c65b5;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .link-back:hover {
          background: rgba(124, 101, 181, 0.05);
        }

        .form-container {
          padding: 80px 40px;
          display: flex;
          justify-content: center;
        }

        .form-card {
          width: 100%;
          max-width: 900px;
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

        .premium-info-box {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
          border: 2px solid rgba(251, 191, 36, 0.3);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          color: #92400e;
          margin-top: 12px;
          line-height: 1.5;
        }

        .premium-text {
          color: #f59e0b;
          font-weight: 700;
        }

        .selection-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
          margin-top: 16px;
        }

        .selection-tag {
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid rgba(124, 101, 181, 0.2);
          background: white;
          color: #6b5d7a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .selection-tag:hover:not(:disabled) {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        .selection-tag.selected {
          border-color: #7c65b5;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
        }

        .selection-tag.premium {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .selection-tag.premium:hover:not(:disabled) {
          border-color: #f59e0b;
          background: rgba(251, 191, 36, 0.05);
        }

        .selection-tag.premium.selected {
          border-color: #f59e0b;
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }

        .premium-badge {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .required-badge {
          display: inline-block;
          background: linear-gradient(135deg, #6b5d7a 0%, #9b8fab 100%);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .selection-tag:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .conditional-fields {
          animation: slideDown 0.3s ease;
          margin-top: 24px;
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
        .form-group select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid rgba(124, 101, 181, 0.15);
          font-size: 15px;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #7c65b5;
          box-shadow: 0 0 0 4px rgba(124, 101, 181, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .hint {
          display: block;
          font-size: 12px;
          color: #9b8fab;
          margin-top: 6px;
        }

        .info-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(59, 130, 246, 0.1);
        }

        .info-box svg {
          color: #3b82f6;
          flex-shrink: 0;
        }

        .info-box p {
          font-size: 13px;
          color: #6b5d7a;
          line-height: 1.5;
        }

        .section-divider {
          margin: 32px 0 24px;
          text-align: center;
          position: relative;
        }

        .section-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(124, 101, 181, 0.2);
        }

        .section-divider span {
          position: relative;
          background: white;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 600;
          color: #6b5d7a;
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

        .loading-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 50%, #ddd8f0 100%);
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid rgba(124, 101, 181, 0.1);
          border-top-color: #7c65b5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .loading-page p {
          color: #6b5d7a;
          font-size: 16px;
        }

        @media (max-width: 1024px) {
          .perfil-container {
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

          .form-container {
            padding: 40px 24px;
          }

          .form-card {
            padding: 32px 24px;
          }
        }

        @media (max-width: 640px) {
          .selection-grid {
            grid-template-columns: 1fr;
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