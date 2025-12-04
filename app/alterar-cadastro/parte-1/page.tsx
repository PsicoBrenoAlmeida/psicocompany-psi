'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'

interface Education {
  title: string
  year: string
}

export default function AlterarCadastroParte1() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'premium'>('basic')

  // Dados Pessoais
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [crpNumber, setCrpNumber] = useState('')

  // Perfil Profissional
  const [specialties, setSpecialties] = useState<string[]>([])
  const [approaches, setApproaches] = useState<string[]>([])
  const [shortBio, setShortBio] = useState('')
  const [fullBio, setFullBio] = useState('')
  const [pricePerSession, setPricePerSession] = useState('')
  const [sessionDuration, setSessionDuration] = useState('50')

  // Afinidade (OPCIONAIS)
  const [gender, setGender] = useState('')
  const [race, setRace] = useState('')
  const [sexualOrientation, setSexualOrientation] = useState('')
  const [pronouns, setPronouns] = useState('')

  // Formação
  const [educationList, setEducationList] = useState<Education[]>([])
  const [educationTitle, setEducationTitle] = useState('')
  const [educationYear, setEducationYear] = useState('')

  // Listas
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

  // ✅ CORRIGIDO: useEffect sem loop infinito
  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('📥 Carregando dados do usuário...')
        setInitialLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          console.log('❌ Usuário não autenticado')
          router.push('/login')
          return
        }

        console.log('✅ Usuário encontrado:', user.id)
        setUserId(user.id)
        setEmail(user.email || '')

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('📋 Profile data:', profileData)

        if (profileData) {
          setFullName(profileData.full_name || '')
          setPhone(profileData.phone || '')
        }

        const { data: psychData } = await supabase
          .from('psychologists')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        console.log('🧠 Psych data:', psychData)

        if (psychData) {
          setSpecialties(psychData.specialties || [])
          setApproaches(psychData.approaches || [])
          setShortBio(psychData.short_bio || '')
          setFullBio(psychData.full_bio || '')
          setEducationList(psychData.education_list || [])
          setPricePerSession(psychData.price_per_session?.toString() || '')
          setSessionDuration(psychData.session_duration?.toString() || '50')
          setCrpNumber(psychData.crp || '')
          setGender(psychData.gender || '')
          setRace(psychData.race || '')
          setSexualOrientation(psychData.sexual_orientation || '')
          setPronouns(psychData.pronouns || '')
          setCurrentPlan(psychData.plan_type || 'basic')
        }

        console.log('✅ Dados carregados com sucesso!')
      } catch (error) {
        console.error('🔴 Erro ao carregar dados:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ← Executa APENAS 1 vez

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
  }

  const toggleSpecialty = (specialty: string) => {
    if (specialties.includes(specialty)) {
      setSpecialties(specialties.filter(s => s !== specialty))
    } else {
      const maxSpecialties = currentPlan === 'premium' ? 10 : 5
      
      if (specialties.length < maxSpecialties) {
        setSpecialties([...specialties, specialty])
      } else {
        if (currentPlan === 'basic') {
          setMessage({ 
            type: 'error', 
            text: `⚠️ Plano Essencial permite apenas 5 áreas. Mude para Premium para adicionar até 10!` 
          })
        } else {
          setMessage({ type: 'error', text: 'Máximo de 10 áreas de especialização' })
        }
        setTimeout(() => setMessage(null), 4000)
      }
    }
  }

  const toggleApproach = (approach: string) => {
    if (approaches.includes(approach)) {
      setApproaches(approaches.filter(a => a !== approach))
    } else {
      const maxApproaches = currentPlan === 'premium' ? 5 : 2
      
      if (approaches.length < maxApproaches) {
        setApproaches([...approaches, approach])
      } else {
        if (currentPlan === 'basic') {
          setMessage({ 
            type: 'error', 
            text: `⚠️ Plano Essencial permite apenas 2 abordagens. Mude para Premium para adicionar até 5!` 
          })
        } else {
          setMessage({ type: 'error', text: 'Máximo de 5 abordagens terapêuticas' })
        }
        setTimeout(() => setMessage(null), 4000)
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

  const validatePremiumFeatures = () => {
    if (currentPlan === 'basic') {
      if (specialties.length > 5) {
        setMessage({ 
          type: 'error', 
          text: `❌ Você selecionou ${specialties.length} áreas, mas o Plano Essencial permite apenas 5. Mude para Premium ou remova ${specialties.length - 5} áreas.` 
        })
        return false
      }
      
      if (approaches.length > 2) {
        setMessage({ 
          type: 'error', 
          text: `❌ Você selecionou ${approaches.length} abordagens, mas o Plano Essencial permite apenas 2. Mude para Premium ou remova ${approaches.length - 2} abordagens.` 
        })
        return false
      }
    }
    
    return true
  }

  const handleSave = async () => {
    try {
      console.log('💾 Iniciando salvamento...')
      setLoading(true)
      setMessage(null)

      // VALIDAR PLANO
      console.log('🔍 Validando plano...')
      if (!validatePremiumFeatures()) {
        setLoading(false)
        return
      }

      console.log('✅ Plano validado')

      // Validações básicas
      if (!fullName.trim()) {
        throw new Error('Nome completo é obrigatório')
      }
      if (!crpNumber.trim()) {
        throw new Error('CRP é obrigatório')
      }
      if (specialties.length === 0) {
        throw new Error('Selecione pelo menos uma área de especialização')
      }
      if (approaches.length === 0) {
        throw new Error('Selecione pelo menos uma abordagem terapêutica')
      }
      if (!shortBio.trim() || shortBio.length < 50) {
        throw new Error('Bio resumida deve ter no mínimo 50 caracteres')
      }
      if (!fullBio.trim() || fullBio.length < 100) {
        throw new Error('Bio completa deve ter no mínimo 100 caracteres')
      }
      if (!pricePerSession || parseFloat(pricePerSession) <= 0) {
        throw new Error('Valor da sessão inválido')
      }
      if (educationList.length === 0) {
        throw new Error('Adicione pelo menos uma formação')
      }

      console.log('✅ Validações OK')
      console.log('👤 UserID:', userId)

      // Atualizar perfil
      console.log('📝 Atualizando profiles...')
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone
        })
        .eq('user_id', userId)
        .select()    // ← ADICIONE
        .single()    // ← ADICIONE

      console.log('📝 Update profiles completou! Erro?', profileError)

      if (profileError) {
        console.error('❌ Erro ao atualizar profiles:', profileError)
        throw profileError
      }
      console.log('✅ Profiles atualizado')

      // Atualizar dados do psicólogo
      console.log('🧠 Atualizando psychologists...')
      const price = Number(pricePerSession)
      const duration = Number(sessionDuration || 50)
      
      const updateData = {
        crp: crpNumber,
        specialties,
        approaches,
        short_bio: shortBio,
        full_bio: fullBio,
        education_list: educationList,
        price_per_session: price,
        session_duration: duration,
        gender: gender || null,
        race: race || null,
        sexual_orientation: sexualOrientation || null,
        pronouns: pronouns || null
      }

      console.log('📦 Dados a serem salvos:', updateData)

      const { error: psychError } = await supabase
      .from('psychologists')
      .update(updateData)
      .eq('user_id', userId)
      .select()    // ← ADICIONE
      .single()    // ← ADICIONE

    console.log('🧠 Update psychologists completou! Erro?', psychError) // ← ADICIONE

      if (psychError) {
        console.error('❌ Erro ao atualizar psychologists:', psychError)
        throw psychError
      }

      console.log('✅ Psychologists atualizado')
      console.log('🎉 Parte 1 salva com sucesso!')
      
      setMessage({ type: 'success', text: '✓ Dados salvos! Continuando para Parte 2...' })

      setTimeout(() => {
        console.log('🚀 Redirecionando para Parte 2...')
        router.push('/alterar-cadastro/parte-2')
      }, 1500)

    } catch (error) {
      console.error('🔴 ERRO COMPLETO:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      console.log('🏁 Finally - resetando loading')
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <>
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
        <style jsx>{styles}</style>
      </>
    )
  }

  return (
    <>
      <div className="page">
        <div className="container">
          
          {/* Header */}
          <div className="header">
            <div>
              <h1>Alterar Cadastro - Parte 1</h1>
              <p>Dados Pessoais e Perfil Profissional</p>
            </div>
            <div className="header-actions">
              <Link href="/dashboard" className="btn-back">
                ← Dashboard
              </Link>
            </div>
          </div>

          {/* Indicador de Plano */}
          <div className={`plan-indicator ${currentPlan}`}>
            <div className="plan-badge">
              {currentPlan === 'premium' ? '💎 Premium' : '⭐ Essencial'}
            </div>
            <div className="plan-limits">
              <span>Especialidades: {specialties.length}/{currentPlan === 'premium' ? '10' : '5'}</span>
              <span>Abordagens: {approaches.length}/{currentPlan === 'premium' ? '5' : '2'}</span>
            </div>
            {currentPlan === 'basic' && (
              <Link href="/alterar-cadastro/parte-2#plano" className="btn-upgrade">
                Mudar para Premium
              </Link>
            )}
          </div>

          {/* Conteúdo */}
          <div className="content-card">
            
            {/* DADOS PESSOAIS */}
            <section>
              <h2>👤 Dados Pessoais</h2>
              
              <div className="form-group">
                <label>Nome completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[\u200B-\u200D\uFEFF]/g, '')
                    setFullName(cleaned)
                  }}
                />
              </div>

              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <span className="hint">E-mail não pode ser alterado</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>

                <div className="form-group">
                  <label>CRP *</label>
                  <input
                    type="text"
                    value={crpNumber}
                    disabled
                    style={{ opacity: 0.7, cursor: 'not-allowed', background: 'rgba(124, 101, 181, 0.05)' }}
                  />
                  <span className="hint">CRP não pode ser alterado. Entre em contato com o suporte se necessário.</span>
                </div>
              </div>

              <h3 style={{ marginTop: '32px', marginBottom: '8px' }}>Afinidade e Inclusão</h3>
              <p className="subtitle" style={{ marginBottom: '16px' }}>Campos opcionais para ajudar pacientes a te encontrar</p>

              <div className="form-row">
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
              </div>

              <div className="form-row">
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
                  <label>Pronomes</label>
                  <select value={pronouns} onChange={(e) => setPronouns(e.target.value)}>
                    <option value="">Prefiro não informar</option>
                    <option value="Ele/Dele">Ele/Dele</option>
                    <option value="Ela/Dela">Ela/Dela</option>
                    <option value="Elu/Delu">Elu/Delu</option>
                  </select>
                </div>
              </div>
            </section>

            {/* PERFIL PROFISSIONAL */}
            <section style={{ marginTop: '48px' }}>
              <h2>🧠 Perfil Profissional</h2>
              <p className="subtitle">Áreas de Especialização ({currentPlan === 'premium' ? 'até 10' : 'até 5'})</p>
              
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
              <span className="hint">{specialties.length}/{currentPlan === 'premium' ? '10' : '5'} selecionadas</span>

              <h3 style={{ marginTop: '32px' }}>Abordagens Terapêuticas ({currentPlan === 'premium' ? 'até 5' : 'até 2'})</h3>

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
              <span className="hint">{approaches.length}/{currentPlan === 'premium' ? '5' : '2'} selecionadas</span>

              <h3 style={{ marginTop: '32px' }}>Biografia</h3>

              <div className="form-group">
                <label>Bio Resumida * (50-250 caracteres)</label>
                <textarea
                    placeholder="Descrição curta que aparecerá na busca"
                    value={shortBio}
                    onChange={(e) => {
                      const cleaned = e.target.value
                        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove caracteres invisíveis
                        .replace(/\r\n/g, '\n') // Normaliza quebras de linha
                        .slice(0, 250)
                      setShortBio(cleaned)
                    }}
                    maxLength={250}
                    rows={3}
                  />
                <span className="hint">{shortBio.length}/250 caracteres</span>
              </div>

              <div className="form-group">
                <label>Bio Completa * (100-2000 caracteres)</label>
                <textarea
                    placeholder="Descrição detalhada do seu perfil"
                    value={fullBio}
                    onChange={(e) => {
                      const cleaned = e.target.value
                        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove caracteres invisíveis
                        .replace(/\r\n/g, '\n') // Normaliza quebras de linha
                        .slice(0, 2000)
                      setFullBio(cleaned)
                    }}
                    maxLength={2000}
                    rows={6}
                  />
                <span className="hint">{fullBio.length}/2000 caracteres</span>
              </div>

              <h3 style={{ marginTop: '32px' }}>Valores</h3>

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
                  <label>Duração da sessão</label>
                  <select value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)}>
                    <option value="40">40 min</option>
                    <option value="50">50 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>
              </div>
            </section>

            {/* FORMAÇÃO */}
            <section style={{ marginTop: '48px' }}>
              <h2>🎓 Formação e Cursos</h2>

              <div className="education-input-group">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 3 }}>
                    <label>Título da formação</label>
                    <input
                      type="text"
                      placeholder="Ex: Psicologia - USP"
                      value={educationTitle}
                      onChange={(e) => setEducationTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Ano</label>
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
            </section>

            {/* Mensagem */}
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Botões */}
            <div className="actions">
              <Link href="/dashboard" className="btn-secondary">
                Cancelar
              </Link>
              <button 
                className="btn-primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Salvando...
                  </>
                ) : (
                  'Salvar e Continuar →'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{styles}</style>
    </>
  )
}

const styles = `
  .page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 100%);
    padding: 100px 20px 40px;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .header h1 {
    font-size: 32px;
    font-weight: 900;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .header p {
    font-size: 15px;
    color: #6b5d7a;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .btn-back {
    padding: 10px 20px;
    border-radius: 10px;
    background: white;
    color: #7c65b5;
    text-decoration: none;
    font-weight: 600;
    border: 2px solid rgba(124, 101, 181, 0.2);
    transition: all 0.3s ease;
  }

  .btn-back:hover {
    border-color: #7c65b5;
    background: rgba(124, 101, 181, 0.05);
  }

  .plan-indicator {
    background: white;
    border-radius: 12px;
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    border: 2px solid rgba(124, 101, 181, 0.2);
  }

  .plan-indicator.premium {
    background: linear-gradient(135deg, rgba(124, 101, 181, 0.05), rgba(169, 150, 221, 0.05));
    border-color: #7c65b5;
  }

  .plan-badge {
    padding: 8px 16px;
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 700;
  }

  .plan-limits {
    display: flex;
    gap: 24px;
    font-size: 14px;
    font-weight: 600;
    color: #6b5d7a;
  }

  .btn-upgrade {
    padding: 10px 20px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    color: white;
    text-decoration: none;
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
    transition: all 0.3s ease;
  }

  .btn-upgrade:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
  }

  .content-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(124, 101, 181, 0.12);
  }

  section h2 {
    font-size: 24px;
    font-weight: 800;
    color: #2d1f3e;
    margin-bottom: 16px;
  }

  .subtitle {
    color: #6b5d7a;
    font-size: 15px;
    margin-bottom: 16px;
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

  .selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin: 16px 0 12px;
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
  }

  .education-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(124, 101, 181, 0.05);
    border-radius: 10px;
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

  .message {
    padding: 16px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    margin: 24px 0;
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

  .actions {
    display: flex;
    gap: 16px;
    margin-top: 32px;
  }

  .btn-secondary {
    flex: 1;
    padding: 14px;
    border-radius: 12px;
    border: 2px solid rgba(124, 101, 181, 0.2);
    background: white;
    color: #7c65b5;
    font-size: 15px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    border-color: #7c65b5;
    background: rgba(124, 101, 181, 0.05);
  }

  .btn-primary {
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

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(124, 101, 181, 0.4);
  }

  .btn-primary:disabled {
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
    background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 100%);
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

  @media (max-width: 768px) {
    .page {
      padding: 80px 16px 40px;
    }

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .header h1 {
      font-size: 24px;
    }

    .plan-indicator {
      flex-direction: column;
      align-items: flex-start;
    }

    .plan-limits {
      flex-direction: column;
      gap: 8px;
    }

    .btn-upgrade {
      width: 100%;
      text-align: center;
    }

    .content-card {
      padding: 24px;
    }

    .selection-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .actions {
      flex-direction: column;
    }
  }
`