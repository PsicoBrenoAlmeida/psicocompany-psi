'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import Image from 'next/image'

interface Education {
  title: string
  year: string
}

export default function AlterarCadastroPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('dados-pessoais')
  const [userId, setUserId] = useState<string | null>(null)

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

  // Formação
  const [educationList, setEducationList] = useState<Education[]>([])
  const [educationTitle, setEducationTitle] = useState('')
  const [educationYear, setEducationYear] = useState('')

  // Valores
  const [pricePerSession, setPricePerSession] = useState('')
  const [sessionDuration, setSessionDuration] = useState('50')

  // Afinidade
  const [race, setRace] = useState('')
  const [sexualOrientation, setSexualOrientation] = useState('')
  const [pronouns, setPronouns] = useState('')

  // Logística
  const [ageGroups, setAgeGroups] = useState<string[]>([])
  const [modality, setModality] = useState<string[]>(['online'])
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [languages, setLanguages] = useState<string[]>(['Português'])

  // Dados Bancários
  const [pixKeyType, setPixKeyType] = useState('cpf')
  const [pixKey, setPixKey] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountType, setBankAccountType] = useState('corrente')
  const [bankAgency, setBankAgency] = useState('')
  const [bankAccount, setBankAccount] = useState('')

  // Documentos
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [crpUrl, setCrpUrl] = useState<string | null>(null)
  const [crpPreview, setCrpPreview] = useState<string | null>(null)
  const [uploadingCrp, setUploadingCrp] = useState(false)
  const crpInputRef = useRef<HTMLInputElement>(null)

  // Plano
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'premium'>('basic')

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

  const ageGroupsList = [
    'Crianças (0-12 anos)',
    'Adolescentes (13-17 anos)',
    'Adultos (18-59 anos)',
    'Idosos (60+ anos)',
    'Casais',
    'Famílias'
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

  const loadUserData = useCallback(async () => {
    try {
      setInitialLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      // Carregar dados do perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileData) {
        setFullName(profileData.full_name || '')
        setPhone(profileData.phone || '')
      }

      // Carregar dados do psicólogo
      const { data: psychData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (psychData) {
        // Perfil Profissional
        setSpecialties(psychData.specialties || [])
        setApproaches(psychData.approaches || [])
        setShortBio(psychData.short_bio || '')
        setFullBio(psychData.full_bio || '')
        
        // Formação
        setEducationList(psychData.education_list || [])
        
        // Valores
        setPricePerSession(psychData.price_per_session?.toString() || '')
        setSessionDuration(psychData.session_duration?.toString() || '50')
        
        // CRP
        setCrpNumber(psychData.crp || '')
        
        // Afinidade
        setRace(psychData.race || '')
        setSexualOrientation(psychData.sexual_orientation || '')
        setPronouns(psychData.pronouns || '')
        
        // Logística
        setAgeGroups(psychData.age_groups || [])
        setModality(psychData.modality || ['online'])
        setCity(psychData.city || '')
        setState(psychData.state_location || '')
        setLanguages(psychData.languages || ['Português'])
        
        // Dados Bancários
        setPixKeyType(psychData.pix_key_type || 'cpf')
        setPixKey(psychData.pix_key || '')
        setBankName(psychData.bank_name || '')
        setBankAccountType(psychData.bank_account_type || 'corrente')
        setBankAgency(psychData.bank_agency || '')
        setBankAccount(psychData.bank_account || '')
        
        // Documentos
        setAvatarUrl(psychData.avatar_url || null)
        setAvatarPreview(psychData.avatar_url || null)
        setCrpUrl(psychData.crp_document_url || null)
        setCrpPreview(psychData.crp_document_url || null)
        
        // Plano
        setCurrentPlan(psychData.plan_type || 'basic')
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setInitialLoading(false)
    }
  }, [router, supabase])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

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
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 8)}`
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

  const toggleAgeGroup = (group: string) => {
    if (ageGroups.includes(group)) {
      setAgeGroups(ageGroups.filter(g => g !== group))
    } else {
      setAgeGroups([...ageGroups, group])
    }
  }

  const toggleModality = (mod: string) => {
    if (modality.includes(mod)) {
      if (mod === 'online') return
      setModality(modality.filter(m => m !== mod))
    } else {
      setModality([...modality, mod])
    }
  }

  const toggleLanguage = (lang: string) => {
    if (languages.includes(lang)) {
      if (lang === 'Português') return
      setLanguages(languages.filter(l => l !== lang))
    } else {
      setLanguages([...languages, lang])
    }
  }

  // Upload de Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (file.size > 2097152) {
        throw new Error('Arquivo muito grande. Máximo: 2MB')
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('Tipo não permitido. Use: jpg, png ou webp')
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setMessage(null)
      
      await uploadAvatar(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      setMessage({ type: 'error', text: errorMessage })
      setAvatarPreview(avatarUrl)
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      setUploadingAvatar(true)
      setMessage(null)

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)

      const { error: updateError } = await supabase
        .from('psychologists')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: '✓ Foto atualizada!' })
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar foto'
      setMessage({ type: 'error', text: errorMessage })
      setAvatarPreview(avatarUrl)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Upload de CRP
  const handleCrpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (file.size > 5242880) {
        throw new Error('Arquivo muito grande. Máximo: 5MB')
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        throw new Error('Tipo não permitido. Use: jpg, png ou pdf')
      }
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCrpPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setCrpPreview('PDF')
      }
      
      setMessage(null)
      
      await uploadCrp(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      setMessage({ type: 'error', text: errorMessage })
      setCrpPreview(crpUrl)
    }
  }

  const uploadCrp = async (file: File) => {
    try {
      setUploadingCrp(true)
      setMessage(null)

      const fileExt = file.name.split('.').pop()
      const fileName = `crp-${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      if (crpUrl) {
        const oldPath = crpUrl.split('crp-documents/')[1]
        if (oldPath) {
          await supabase.storage.from('crp-documents').remove([oldPath])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('crp-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('crp-documents')
        .getPublicUrl(filePath)

      setCrpUrl(publicUrl)

      const { error: updateError } = await supabase
        .from('psychologists')
        .update({ crp_document_url: publicUrl })
        .eq('user_id', userId)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: '✓ Documento atualizado!' })
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar documento'
      setMessage({ type: 'error', text: errorMessage })
      setCrpPreview(crpUrl)
    } finally {
      setUploadingCrp(false)
    }
  }

  const handleSaveChanges = async () => {
    try {
      setLoading(true)
      setMessage(null)

      console.log('💾 Salvando alterações...')

      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone
        })
        .eq('user_id', userId)

      if (profileError) throw profileError

      // Atualizar dados do psicólogo
      const price = Number(pricePerSession)
      const duration = Number(sessionDuration || 50)
      
      const { error: psychError } = await supabase
        .from('psychologists')
        .update({
          crp: crpNumber,
          specialties,
          approaches,
          short_bio: shortBio,
          full_bio: fullBio,
          education_list: educationList,
          price_per_session: price,
          session_duration: duration,
          race,
          sexual_orientation: sexualOrientation,
          pronouns,
          age_groups: ageGroups,
          modality,
          city: city || null,
          state_location: state || null,
          languages,
          pix_key_type: pixKeyType,
          pix_key: pixKey,
          bank_name: bankName || null,
          bank_account_type: bankAccountType,
          bank_agency: bankAgency || null,
          bank_account: bankAccount || null
        })
        .eq('user_id', userId)

      if (psychError) throw psychError

      console.log('✅ Alterações salvas!')
      setMessage({ type: 'success', text: '✓ Alterações salvas com sucesso!' })

      setTimeout(() => {
        setMessage(null)
      }, 3000)

    } catch (error) {
      console.error('🔴 ERRO:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar alterações'
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    )
  }

  return (
    <>
      <div className="alterar-cadastro-page">
        <div className="container">
          <div className="header">
            <div>
              <h1>Alterar Cadastro</h1>
              <p>Atualize suas informações profissionais</p>
            </div>
            <Link href="/dashboard" className="btn-back-dash">
              ← Voltar ao Dashboard
            </Link>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'dados-pessoais' ? 'active' : ''}`}
              onClick={() => setActiveTab('dados-pessoais')}
            >
              👤 Dados Pessoais
            </button>
            <button 
              className={`tab ${activeTab === 'perfil-profissional' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil-profissional')}
            >
              🧠 Perfil Profissional
            </button>
            <button 
              className={`tab ${activeTab === 'formacao' ? 'active' : ''}`}
              onClick={() => setActiveTab('formacao')}
            >
              🎓 Formação
            </button>
            <button 
              className={`tab ${activeTab === 'logistica' ? 'active' : ''}`}
              onClick={() => setActiveTab('logistica')}
            >
              📅 Logística
            </button>
            <button 
              className={`tab ${activeTab === 'bancarios' ? 'active' : ''}`}
              onClick={() => setActiveTab('bancarios')}
            >
              💰 Dados Bancários
            </button>
            <button 
              className={`tab ${activeTab === 'documentos' ? 'active' : ''}`}
              onClick={() => setActiveTab('documentos')}
            >
              📄 Documentos
            </button>
            <button 
              className={`tab ${activeTab === 'plano' ? 'active' : ''}`}
              onClick={() => setActiveTab('plano')}
            >
              💎 Plano
            </button>
          </div>

          {/* Conteúdo */}
          <div className="content-card">
            
            {/* DADOS PESSOAIS */}
            {activeTab === 'dados-pessoais' && (
              <div className="tab-content">
                <h2>Dados Pessoais</h2>
                
                <div className="form-group">
                  <label>Nome completo *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                  <span className="hint">E-mail não pode ser alterado aqui</span>
                </div>

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
                    onChange={(e) => setCrpNumber(formatCRP(e.target.value))}
                    maxLength={9}
                  />
                </div>

                <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Afinidade e Inclusão</h3>

                <div className="form-group">
                  <label>Cor/Raça *</label>
                  <select value={race} onChange={(e) => setRace(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="Branca">Branca</option>
                    <option value="Preta">Preta</option>
                    <option value="Parda">Parda</option>
                    <option value="Amarela">Amarela</option>
                    <option value="Indígena">Indígena</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Orientação Sexual *</label>
                  <select value={sexualOrientation} onChange={(e) => setSexualOrientation(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="Heterossexual">Heterossexual</option>
                    <option value="Homossexual">Homossexual</option>
                    <option value="Bissexual">Bissexual</option>
                    <option value="Pansexual">Pansexual</option>
                    <option value="Assexual">Assexual</option>
                    <option value="Outra">Outra</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Pronomes de Tratamento *</label>
                  <select value={pronouns} onChange={(e) => setPronouns(e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="Ele/Dele">Ele/Dele</option>
                    <option value="Ela/Dela">Ela/Dela</option>
                    <option value="Elu/Delu">Elu/Delu</option>
                  </select>
                </div>
              </div>
            )}

            {/* PERFIL PROFISSIONAL */}
            {activeTab === 'perfil-profissional' && (
              <div className="tab-content">
                <h2>Áreas de Especialização</h2>
                <p className="subtitle">Selecione até 10 áreas em que você atende</p>
                
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

                <h2 style={{ marginTop: '48px' }}>Abordagens Terapêuticas</h2>
                <p className="subtitle">Selecione até 5 abordagens que você utiliza</p>

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

                <h2 style={{ marginTop: '48px' }}>Biografia</h2>

                <div className="form-group">
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

                <h2 style={{ marginTop: '48px' }}>Valores</h2>

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
              </div>
            )}

            {/* FORMAÇÃO */}
            {activeTab === 'formacao' && (
              <div className="tab-content">
                <h2>Formações e Cursos</h2>
                <p className="subtitle">Adicione sua formação acadêmica e cursos relevantes</p>

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
              </div>
            )}

            {/* LOGÍSTICA */}
            {activeTab === 'logistica' && (
              <div className="tab-content">
                <h2>Faixa Etária</h2>
                <p className="subtitle">Selecione as faixas etárias que você atende</p>

                <div className="selection-grid">
                  {ageGroupsList.map((group) => (
                    <button
                      key={group}
                      type="button"
                      className={`selection-tag ${ageGroups.includes(group) ? 'selected' : ''}`}
                      onClick={() => toggleAgeGroup(group)}
                    >
                      {group}
                    </button>
                  ))}
                </div>

                <h2 style={{ marginTop: '48px' }}>Modalidade de Atendimento</h2>

                <div className="selection-grid">
                  <button
                    type="button"
                    className={`selection-tag ${modality.includes('online') ? 'selected' : ''}`}
                    onClick={() => toggleModality('online')}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    className={`selection-tag ${modality.includes('presencial') ? 'selected' : ''}`}
                    onClick={() => toggleModality('presencial')}
                  >
                    Presencial
                  </button>
                  <button
                    type="button"
                    className={`selection-tag ${modality.includes('hibrido') ? 'selected' : ''}`}
                    onClick={() => toggleModality('hibrido')}
                  >
                    Híbrido
                  </button>
                </div>

                {(modality.includes('presencial') || modality.includes('hibrido')) && (
                  <div style={{ marginTop: '32px' }}>
                    <h3>Localização</h3>
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

                <h2 style={{ marginTop: '48px' }}>Idiomas de Atendimento</h2>

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
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DADOS BANCÁRIOS */}
            {activeTab === 'bancarios' && (
              <div className="tab-content">
                <h2>Dados para Recebimento</h2>
                <p className="subtitle">Configure como você vai receber pelos atendimentos</p>

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
              </div>
            )}

            {/* DOCUMENTOS */}
            {activeTab === 'documentos' && (
              <div className="tab-content">
                <h2>Foto de Perfil</h2>
                <p className="subtitle">Foto profissional que aparecerá no seu perfil</p>

                <div className="upload-area">
                  {avatarPreview ? (
                    <div className="preview-container">
                      <div className="avatar-preview">
                        <Image 
                          src={avatarPreview} 
                          alt="Preview" 
                          width={200}
                          height={200}
                          className="preview-image"
                        />
                      </div>
                      <button 
                        type="button"
                        className="btn-change-photo"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? 'Enviando...' : 'Trocar foto'}
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="upload-placeholder"
                      onClick={() => avatarInputRef.current?.click()}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <h3>Clique para enviar sua foto</h3>
                      <p>JPG, PNG ou WEBP (máx. 2MB)</p>
                    </div>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>

                <h2 style={{ marginTop: '48px' }}>Comprovante do CRP</h2>
                <p className="subtitle">Documento de registro no CRP</p>

                <div className="upload-area">
                  {crpPreview ? (
                    <div className="preview-container">
                      {crpPreview === 'PDF' ? (
                        <div className="pdf-preview">
                          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          <p>PDF do CRP enviado</p>
                        </div>
                      ) : (
                        <div className="document-preview">
                          <Image 
                            src={crpPreview} 
                            alt="CRP Preview" 
                            width={300}
                            height={400}
                            className="preview-doc-image"
                          />
                        </div>
                      )}
                      <button 
                        type="button"
                        className="btn-change-photo"
                        onClick={() => crpInputRef.current?.click()}
                        disabled={uploadingCrp}
                      >
                        {uploadingCrp ? 'Enviando...' : 'Trocar documento'}
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="upload-placeholder"
                      onClick={() => crpInputRef.current?.click()}
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      <h3>Clique para enviar o documento</h3>
                      <p>JPG, PNG ou PDF (máx. 5MB)</p>
                    </div>
                  )}
                  <input
                    ref={crpInputRef}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleCrpChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* PLANO */}
            {activeTab === 'plano' && (
              <div className="tab-content">
                <h2>Seu Plano Atual</h2>
                <p className="subtitle">Informações sobre seu plano e benefícios</p>

                <div className="current-plan-card">
                  <div className="plan-badge">
                    {currentPlan === 'premium' ? '💎 Premium' : '⭐ Essencial'}
                  </div>
                  <h3>Plano {currentPlan === 'premium' ? 'Premium' : 'Essencial'}</h3>
                  {currentPlan === 'premium' ? (
                    <>
                      <div className="plan-price">R$ 300/mês</div>
                      <ul className="plan-benefits">
                        <li>✓ Sem comissão por sessão</li>
                        <li>✓ Destaque nas buscas</li>
                        <li>✓ Badge Premium no perfil</li>
                        <li>✓ Até 10 áreas de especialização</li>
                        <li>✓ Até 5 abordagens terapêuticas</li>
                        <li>✓ Todas modalidades e faixas etárias</li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <div className="plan-price">20% de comissão/sessão</div>
                      <ul className="plan-benefits">
                        <li>✓ Perfil visível na plataforma</li>
                        <li>✓ Até 5 áreas de especialização</li>
                        <li>✓ Até 2 abordagens terapêuticas</li>
                        <li>✓ Atendimento online</li>
                        <li>✓ Adultos e idosos</li>
                      </ul>
                    </>
                  )}
                </div>

                <div className="info-box" style={{ marginTop: '24px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p>Para alterar seu plano, entre em contato com o suporte através do e-mail: <strong>suporte@psicocompany.com</strong></p>
                </div>
              </div>
            )}

            {/* Mensagem */}
            {message && (
              <div className={`message ${message.type}`}>
                {message.type === 'success' ? '✓' : '⚠'} {message.text}
              </div>
            )}

            {/* Botão Salvar */}
            <button 
              className="btn-save"
              onClick={handleSaveChanges}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="btn-spinner"></div>
                  Salvando...
                </>
              ) : (
                '✓ Salvar Alterações'
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .alterar-cadastro-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 100%);
          padding: 100px 20px 40px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header h1 {
          font-size: 36px;
          font-weight: 900;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .header p {
          font-size: 16px;
          color: #6b5d7a;
        }

        .btn-back-dash {
          padding: 12px 24px;
          border-radius: 10px;
          background: white;
          color: #7c65b5;
          text-decoration: none;
          font-weight: 600;
          border: 2px solid rgba(124, 101, 181, 0.2);
          transition: all 0.3s ease;
        }

        .btn-back-dash:hover {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .tab {
          padding: 12px 20px;
          border-radius: 10px;
          background: white;
          border: 2px solid rgba(124, 101, 181, 0.1);
          color: #6b5d7a;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .tab:hover {
          border-color: rgba(124, 101, 181, 0.3);
          background: rgba(124, 101, 181, 0.05);
        }

        .tab.active {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          border-color: transparent;
        }

        .content-card {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.12);
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
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

        .tab-content h2 {
          font-size: 24px;
          font-weight: 800;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .subtitle {
          color: #6b5d7a;
          font-size: 15px;
          margin-bottom: 24px;
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

        .selection-tag:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .upload-area {
          margin: 24px 0;
        }

        .upload-placeholder {
          border: 3px dashed rgba(124, 101, 181, 0.3);
          border-radius: 16px;
          padding: 48px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(124, 101, 181, 0.02);
        }

        .upload-placeholder:hover {
          border-color: #7c65b5;
          background: rgba(124, 101, 181, 0.05);
        }

        .upload-placeholder svg {
          color: #7c65b5;
          margin-bottom: 16px;
        }

        .upload-placeholder h3 {
          font-size: 18px;
          font-weight: 700;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .upload-placeholder p {
          color: #9b8fab;
          font-size: 14px;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .avatar-preview {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #7c65b5;
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.2);
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .document-preview {
          max-width: 400px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid rgba(124, 101, 181, 0.2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .preview-doc-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .pdf-preview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px;
          background: rgba(124, 101, 181, 0.05);
          border-radius: 12px;
        }

        .pdf-preview svg {
          color: #7c65b5;
        }

        .pdf-preview p {
          font-size: 16px;
          font-weight: 600;
          color: #2d1f3e;
        }

        .btn-change-photo {
          padding: 12px 24px;
          border-radius: 10px;
          border: 2px solid #7c65b5;
          background: white;
          color: #7c65b5;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-change-photo:hover:not(:disabled) {
          background: #7c65b5;
          color: white;
        }

        .btn-change-photo:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .current-plan-card {
          background: linear-gradient(135deg, rgba(124, 101, 181, 0.05) 0%, rgba(169, 150, 221, 0.05) 100%);
          border: 2px solid rgba(124, 101, 181, 0.2);
          border-radius: 16px;
          padding: 32px;
          margin-top: 24px;
        }

        .plan-badge {
          display: inline-block;
          padding: 6px 16px;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .current-plan-card h3 {
          font-size: 24px;
          font-weight: 800;
          color: #2d1f3e;
          margin-bottom: 12px;
        }

        .plan-price {
          font-size: 28px;
          font-weight: 900;
          color: #7c65b5;
          margin-bottom: 20px;
        }

        .plan-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .plan-benefits li {
          padding: 8px 0;
          color: #2d1f3e;
          font-size: 15px;
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

        .btn-save {
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
          margin-top: 32px;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(124, 101, 181, 0.4);
        }

        .btn-save:disabled {
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
          .alterar-cadastro-page {
            padding: 80px 16px 40px;
          }

          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .header h1 {
            font-size: 28px;
          }

          .tabs {
            flex-wrap: nowrap;
            overflow-x: auto;
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
        }
      `}</style>
    </>
  )
}