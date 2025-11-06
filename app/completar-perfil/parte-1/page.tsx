'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'

interface Education {
  title: string
  year: string
}

export default function CompletarPerfilParte1() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  // Step 1 - Áreas e Abordagens
  const [specialties, setSpecialties] = useState<string[]>([])
  const [approaches, setApproaches] = useState<string[]>([])

  // Step 2 - Formação e Bio
  const [educationList, setEducationList] = useState<Education[]>([])
  const [educationTitle, setEducationTitle] = useState('')
  const [educationYear, setEducationYear] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [fullBio, setFullBio] = useState('')

  // Step 3 - Dados Pessoais
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [pricePerSession, setPricePerSession] = useState('')
  const [sessionDuration, setSessionDuration] = useState('50')

  // Step 4 - Afinidade e Inclusão
  const [crpNumber, setCrpNumber] = useState('')
  const [gender, setGender] = useState('')
  const [race, setRace] = useState('')
  const [sexualOrientation, setSexualOrientation] = useState('')
  const [pronouns, setPronouns] = useState('')

  // Listas de opções
  const specialtiesList = [
    'Ansiedade e Crises de Pânico',
    'Depressão e Desmotivação',
    'Estresse e Síndrome de Burnout',
    'TDAH (Déficit de Atenção e Hiperatividade)',
    'Transtorno Bipolar (TAB)',
    'TOC (Transtorno Obsessivo-Compulsivo)',
    'Fobias e Medos Intensos',
    'Transtornos Alimentares',
    'Dependências (Química, Jogos, Internet)',
    'Transtorno de Estresse Pós-Traumático (TEPT)',
    'Autismo (TEA)',
    'Trauma e Abuso',
    'Conflitos Amorosos (Namoro, casamento)',
    'Separação, Divórcio e Recomeços',
    'Conflitos Familiares (Pais, Filhos, Irmãos)',
    'Dependência Emocional e Codependência',
    'Relacionamentos Abusivos ou Tóxicos',
    'Habilidades Sociais e Comunicação',
    'Orientação Sexual e Identidade de Gênero',
    'Bullying, Assédio e Violência',
    'Saúde Mental na Imigração/Adaptação Cultural',
    'Infância e Adolescência (Foco)',
    'Gestação, Maternidade e Paternidade',
    'Autoconhecimento e Propósito de Vida',
    'Autoestima e Autoconfiança',
    'Procrastinação e Organização',
    'Estresse no Trabalho e Carreira',
    'Orientação Profissional e de Carreira',
    'Dificuldades de Sono e Insônia',
    'Autocobrança e Perfeccionismo',
    'Luto e Perdas (Morte, Emprego, etc.)',
    'Regulação Emocional e Controle de Impulsos',
    'Espiritualidade e Existencialismo',
    'Imagem Corporal e Autoaceitação',
    'Suporte em Doenças Crônicas e Dor'
  ]

  const approachesList = [
    'Terapia Cognitivo-Comportamental (TCC)',
    'Terapia de Aceitação e Compromisso (ACT)',
    'Terapia Comportamental Dialética (DBT)',
    'Terapia Analítica Funcional (FAP)',
    'Terapia do Esquema',
    'Psicanálise / Psicodinâmica',
    'Psicologia Analítica (Junguiana)',
    'Análise do Comportamento (Behaviorismo)',
    'Terapia Sistêmica / Familiar',
    'Terapia Humanista / Centrada na Pessoa',
    'Fenomenológica / Existencial',
    'Gestalt-Terapia',
    'Terapia EMDR (para Trauma e Estresse)',
    'Terapia Breve (Focada em Solução)',
    'Terapias Baseadas em Mindfulness e Compaixão',
    'Terapia Integrativa',
    'Neuropsicologia Clínica',
    'Arteterapia / Expressão Criativa',
    'Hipnoterapia / Hipnose Clínica',
    'Psicodrama'
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
      setEmail(user.email || '')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileData) {
        setWhatsapp(profileData.phone || '')
      }

      const { data: psychData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (psychData) {
        setSpecialties(psychData.specialties || [])
        setPricePerSession(psychData.price_per_session?.toString() || '')
        setSessionDuration(psychData.session_duration?.toString() || '50')
        setShortBio(psychData.short_bio || '')
        setFullBio(psychData.full_bio || '')
        
        if (psychData.approaches) setApproaches(psychData.approaches)
        if (psychData.education_list) setEducationList(psychData.education_list)
        if (psychData.crp) setCrpNumber(psychData.crp)
        if (psychData.gender) setGender(psychData.gender)
        if (psychData.race) setRace(psychData.race)
        if (psychData.sexual_orientation) setSexualOrientation(psychData.sexual_orientation)
        if (psychData.pronouns) setPronouns(psychData.pronouns)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty))
    } else {
      if (specialties.length < 10) {
        setSpecialties([...specialties, specialty])
      } else {
        setMessage({ type: 'error', text: 'Máximo de 10 áreas de especialização' })
        setTimeout(() => setMessage(null), 3000)
      }
    }
  }

  const toggleApproach = (approach: string) => {
    if (approaches.includes(approach)) {
      setApproaches(approaches.filter(a => a !== approach))
    } else {
      if (approaches.length < 5) {
        setApproaches([...approaches, approach])
      } else {
        setMessage({ type: 'error', text: 'Máximo de 5 abordagens terapêuticas' })
        setTimeout(() => setMessage(null), 3000)
      }
    }
  }

  const addEducation = () => {
    if (!educationTitle.trim() || !educationYear.trim()) {
      setMessage({ type: 'error', text: 'Preencha título e ano da formação' })
      setTimeout(() => setMessage(null), 3000)
      return
    }
    setEducationList([...educationList, { title: educationTitle, year: educationYear }])
    setEducationTitle('')
    setEducationYear('')
  }

  const removeEducation = (index: number) => {
    setEducationList(educationList.filter((_, i) => i !== index))
  }

  const validateStep1 = () => {
    if (specialties.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos uma área de especialização' })
      return false
    }
    if (approaches.length === 0) {
      setMessage({ type: 'error', text: 'Selecione pelo menos uma abordagem terapêutica' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (educationList.length === 0) {
      setMessage({ type: 'error', text: 'Adicione pelo menos uma formação ou curso' })
      return false
    }
    if (!shortBio.trim() || shortBio.length < 50) {
      setMessage({ type: 'error', text: 'Bio resumida deve ter no mínimo 50 caracteres' })
      return false
    }
    if (!fullBio.trim() || fullBio.length < 100) {
      setMessage({ type: 'error', text: 'Bio completa deve ter no mínimo 100 caracteres' })
      return false
    }
    return true
  }

  const validateStep3 = () => {
    if (!pricePerSession || parseFloat(pricePerSession) <= 0) {
      setMessage({ type: 'error', text: 'Valor da sessão inválido' })
      return false
    }
    return true
  }

  const validateStep4 = () => {
    // Dados de afinidade são todos opcionais - apenas avançar
    return true
  }

  const handleNext = () => {
    setMessage(null)
    
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    if (currentStep === 3 && !validateStep3()) return
    
    if (currentStep < 4) {
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

  const handleContinueToParte2 = async () => {
    console.log('🚀 INÍCIO')

    if (!validateStep4()) {
      console.log('❌ Validação falhou')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      console.log('💾 SALVANDO...')
      console.log('👤 userId:', userId)
      if (!userId) throw new Error('Usuário não identificado')

      const price = Number(pricePerSession)
      const duration = Number(sessionDuration || 50)
      if (!Number.isFinite(price) || price <= 0) throw new Error('Valor da sessão inválido')

      const updateData = {
        specialties,
        approaches,
        price_per_session: price,
        session_duration: duration,
        short_bio: shortBio,
        full_bio: fullBio,
        education_list: educationList,
        gender: gender || null,
        race: race || null,
        sexual_orientation: sexualOrientation || null,
        pronouns: pronouns || null,
      }

      console.log('📦 Dados:', updateData)

      // 🔎 Checagem de existência
      console.log('🔎 Verificando se já existe registro do psicólogo...')
      const { data: existing, error: checkErr } = await supabase
        .from('psychologists')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (checkErr) {
        console.error('❌ Erro ao checar existência:', checkErr)
        throw checkErr
      }
      console.log('🔎 Existe?', !!existing)

      let data, error

      if (!existing) {
        console.log('🆕 Inserindo registro...')
        const insertPayload = { user_id: userId, ...updateData }

        ;({ data, error } = await supabase
          .from('psychologists')
          .insert([insertPayload])
          .select()
          .single())
      } else {
        console.log('✏️ Atualizando registro...')
        ;({ data, error } = await supabase
          .from('psychologists')
          .update(updateData)
          .eq('user_id', userId)
          .select()
          .single())
      }

      console.log('✅ Resposta recebida!', { data, error })

      if (error) throw error
      if (!data) throw new Error('Nenhum registro foi salvo/atualizado (verifique policies e user_id).')

      console.log('🎉 SUCESSO!')
      setMessage({ type: 'success', text: 'Dados salvos com sucesso!' })

      setTimeout(() => {
        console.log('➡️ Redirecionando para Parte 2...')
        router.push('/completar-perfil/parte-2')
      }, 1200)

    } catch (error) {
      console.error('🔴 ERRO COMPLETO:', error)

      let msg = 'Erro ao salvar: '

      if (typeof error === 'object' && error !== null) {
        const err = error as { message?: string; code?: string }
        
        if (err.message?.toLowerCase?.().includes('jwt')) {
          msg = 'Sua sessão expirou. Faça login novamente.'
          setTimeout(() => router.push('/login'), 1500)
        } else if (
          err.message?.toLowerCase?.().includes('permission') ||
          err.message?.toLowerCase?.().includes('policy') ||
          err.code === 'PGRST301'
        ) {
          msg = 'Você não tem permissão. Verifique as policies de RLS da tabela psychologists.'
        } else if (
          err.code === '23505' ||
          err.message?.toLowerCase?.().includes('unique') ||
          err.message?.toLowerCase?.().includes('duplicate')
        ) {
          msg = 'Violação de unicidade. Verifique UNIQUE em user_id ou registros duplicados.'
        } else if (
          err.code === '23502' ||
          err.message?.toLowerCase?.().includes('not null')
        ) {
          msg = 'Erro de Preenchimento: Um campo obrigatório não foi enviado. Verifique o console.'
        } else if (
          err.message?.toLowerCase?.().includes('column') &&
          err.message?.toLowerCase?.().includes('does not exist')
        ) {
          msg = 'Coluna inexistente no payload. Confira nomes e tipos das colunas.'
        } else if (err.message) {
          msg += err.message
        } else {
          msg += 'Tente novamente.'
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        msg += errorMessage
      }

      setMessage({ type: 'error', text: msg })
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
              <h3>Parte 1 de 2</h3>
              <p>Perfil Profissional</p>
            </div>

            <div className="progress-steps">
              {[
                { num: 1, title: 'Áreas e Abordagens', desc: 'Especialização' },
                { num: 2, title: 'Formação e Bio', desc: 'Experiência' },
                { num: 3, title: 'Dados Profissionais', desc: 'Valores e contato' },
                { num: 4, title: 'Afinidade', desc: 'Inclusão (opcional)' }
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
          </div>

          {/* Formulário */}
          <div className="form-container">
            <div className="form-card">
              
              {/* STEP 1 - Áreas e Abordagens */}
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Áreas de Especialização</h2>
                    <p>Selecione até 10 áreas em que você atende</p>
                    <div className="premium-info-box">
                      💡 Você pode selecionar até <strong>10 áreas</strong>. No final do cadastro, se escolher o Plano <strong>Essencial</strong>, ficará limitado a 5 áreas. Com o Plano <strong className="premium-text">Premium</strong>, todas as 10 estarão disponíveis.
                    </div>
                  </div>

                  <div className="selection-grid">
                    {specialtiesList.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        className={`selection-tag ${specialties.includes(specialty) ? 'selected' : ''}`}
                        onClick={() => toggleSpecialty(specialty)}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                  <span className="hint">{specialties.length}/10 selecionadas</span>

                  <div className="step-header" style={{ marginTop: '48px' }}>
                    <h2>Abordagens Terapêuticas</h2>
                    <p>Selecione até 5 abordagens que você utiliza</p>
                    <div className="premium-info-box">
                      💡 Você pode selecionar até <strong>5 abordagens</strong>. No Plano <strong>Essencial</strong>, apenas 2 estarão ativas. Com o Plano <strong className="premium-text">Premium</strong>, todas as 5 estarão disponíveis.
                    </div>
                  </div>

                  <div className="selection-grid">
                    {approachesList.map((approach) => (
                      <button
                        key={approach}
                        type="button"
                        className={`selection-tag ${approaches.includes(approach) ? 'selected' : ''}`}
                        onClick={() => toggleApproach(approach)}
                      >
                        {approach}
                      </button>
                    ))}
                  </div>
                  <span className="hint">{approaches.length}/5 selecionadas</span>
                </div>
              )}

              {/* STEP 2 - Formação e Bio */}
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Formações e Cursos</h2>
                    <p>Adicione sua formação acadêmica e cursos relevantes</p>
                  </div>

                  <div className="education-input-group">
                    <div className="form-row">
                      <div className="form-group" style={{ flex: 3 }}>
                        <label>Título da formação ou curso</label>
                        <input
                          type="text"
                          placeholder="Ex: Psicologia - USP"
                          value={educationTitle}
                          onChange={(e) => setEducationTitle(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Ano de Conclusão</label>
                        <input
                          type="text"
                          placeholder="2020"
                          value={educationYear}
                          onChange={(e) => setEducationYear(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <button type="button" className="btn-add" onClick={addEducation}>
                      + Adicionar
                    </button>
                  </div>

                  {educationList.length > 0 && (
                    <div className="education-list">
                      {educationList.map((edu, idx) => (
                        <div key={idx} className="education-item">
                          <div>
                            <strong>{edu.title}</strong>
                            <span> - {edu.year}</span>
                          </div>
                          <button type="button" onClick={() => removeEducation(idx)} className="btn-remove">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '32px' }}>
                    <label>Bio Resumida * (máx. 250 caracteres)</label>
                    <textarea
                      placeholder="Descrição curta que aparecerá na busca"
                      value={shortBio}
                      onChange={(e) => setShortBio(e.target.value.slice(0, 250))}
                      maxLength={250}
                      rows={3}
                    />
                    <span className="hint">{shortBio.length}/250 caracteres</span>
                  </div>

                  <div className="form-group">
                    <label>Bio Completa * (máx. 2000 caracteres)</label>
                    <textarea
                      placeholder="Descrição detalhada que aparecerá no seu perfil"
                      value={fullBio}
                      onChange={(e) => setFullBio(e.target.value.slice(0, 2000))}
                      maxLength={2000}
                      rows={6}
                    />
                    <span className="hint">{fullBio.length}/2000 caracteres</span>
                  </div>
                </div>
              )}

              {/* STEP 3 - Dados Profissionais */}
              {currentStep === 3 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Dados Profissionais</h2>
                    <p>Valores da sessão e informações de contato</p>
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
                      <label>Duração da sessão (minutos)</label>
                      <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}>
                        <option value="40">40 min</option>
                        <option value="50">50 min</option>
                        <option value="60">60 min</option>
                      </select>
                    </div>
                  </div>

                  <div className="info-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <p>Os dados abaixo <strong>não aparecerão no seu perfil</strong> e são usados exclusivamente para comunicação da equipe de suporte.</p>
                  </div>

                  <div className="form-group">
                    <label>E-mail (comunicação interna)</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>WhatsApp (comunicação interna)</label>
                    <input
                      type="tel"
                      placeholder="(11) 98765-4321"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4 - Afinidade e Inclusão */}
              {currentStep === 4 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Dados de Afinidade e Inclusão</h2>
                    <p>Ajude pacientes a encontrar profissionais com quem se identificam</p>
                    <div className="optional-badge">
                      ℹ️ Todos os campos desta etapa são <strong>opcionais</strong>
                    </div>
                  </div>

                  {/* CRP - SOMENTE LEITURA */}
                  <div className="info-box crp-info" style={{ marginBottom: '32px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <p><strong>CRP cadastrado:</strong> {crpNumber || 'Carregando...'}</p>
                      <p style={{ fontSize: '12px', color: '#9b8fab', marginTop: '4px' }}>
                        O número do CRP não pode ser alterado. Se precisar corrigir, entre em contato com o suporte.
                      </p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Gênero</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                      <option value="">Prefiro não informar</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Não-binário">Não-binário</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cor/Raça</label>
                    <select value={race} onChange={(e) => setRace(e.target.value)}>
                      <option value="">Prefiro não informar</option>
                      <option value="Branca">Branca</option>
                      <option value="Preta">Preta</option>
                      <option value="Parda">Parda</option>
                      <option value="Amarela">Amarela</option>
                      <option value="Indígena">Indígena</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Orientação Sexual</label>
                    <select value={sexualOrientation} onChange={(e) => setSexualOrientation(e.target.value)}>
                      <option value="">Prefiro não informar</option>
                      <option value="Heterossexual">Heterossexual</option>
                      <option value="Homossexual">Homossexual</option>
                      <option value="Bissexual">Bissexual</option>
                      <option value="Pansexual">Pansexual</option>
                      <option value="Assexual">Assexual</option>
                      <option value="Outra">Outra</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Pronomes de Tratamento</label>
                    <select value={pronouns} onChange={(e) => setPronouns(e.target.value)}>
                      <option value="">Prefiro não informar</option>
                      <option value="Ele/Dele">Ele/Dele</option>
                      <option value="Ela/Dela">Ela/Dela</option>
                      <option value="Elu/Delu">Elu/Delu</option>
                    </select>
                  </div>

                  <div className="info-box" style={{ marginTop: '24px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                    <p>
                      <strong>Por que pedimos isso?</strong><br/>
                      Esses dados ajudam pacientes a encontrar profissionais com os quais possam se identificar melhor, criando um ambiente mais acolhedor e inclusivo.
                    </p>
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
                {currentStep > 1 && (
                  <button type="button" className="btn-back" onClick={handleBack} disabled={loading}>
                    ← Voltar
                  </button>
                )}

                {currentStep < 4 ? (
                  <button type="button" className="btn-next" onClick={handleNext}>
                    Próximo →
                  </button>
                ) : (
                  <button type="button" className="btn-submit" onClick={handleContinueToParte2} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Salvando...
                      </>
                    ) : (
                      'Continuar para Parte 2 →'
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

        .optional-badge {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%);
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          color: #1e40af;
          margin-top: 12px;
          line-height: 1.5;
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
        }

        .selection-tag:hover {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        .selection-tag.selected {
          border-color: #7c65b5;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
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

        .hint {
          display: block;
          font-size: 12px;
          color: #9b8fab;
          margin-top: 6px;
        }

        .education-input-group {
          background: rgba(124, 101, 181, 0.05);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .btn-add {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 2px dashed #7c65b5;
          background: white;
          color: #7c65b5;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-add:hover {
          background: rgba(124, 101, 181, 0.05);
        }

        .education-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }

        .education-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: rgba(124, 101, 181, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(124, 101, 181, 0.1);
        }

        .education-item strong {
          color: #2d1f3e;
          font-weight: 700;
        }

        .education-item span {
          color: #6b5d7a;
        }

        .btn-remove {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-remove:hover {
          background: #ef4444;
          color: white;
        }

        .info-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 10px;
          border: 1px solid rgba(59, 130, 246, 0.1);
          margin-bottom: 24px;
        }

        .info-box.crp-info {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .info-box.crp-info svg {
          color: #22c55e;
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