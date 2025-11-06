'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function AlterarCadastroParte2() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'premium'>('basic')
  const [showPlanModal, setShowPlanModal] = useState(false)

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

  // Listas
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

      const { data: psychData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (psychData) {
        setAgeGroups(psychData.age_groups || [])
        setModality(psychData.modality || ['online'])
        setCity(psychData.city || '')
        setState(psychData.state_location || '')
        setLanguages(psychData.languages || ['Português'])
        
        setPixKeyType(psychData.pix_key_type || 'cpf')
        setPixKey(psychData.pix_key || '')
        setBankName(psychData.bank_name || '')
        setBankAccountType(psychData.bank_account_type || 'corrente')
        setBankAgency(psychData.bank_agency || '')
        setBankAccount(psychData.bank_account || '')
        
        setAvatarUrl(psychData.avatar_url || null)
        setAvatarPreview(psychData.avatar_url || null)
        setCrpUrl(psychData.crp_document_url || null)
        setCrpPreview(psychData.crp_document_url || null)
        
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

  const toggleAgeGroup = (group: string) => {
    if (ageGroups.includes(group)) {
      setAgeGroups(ageGroups.filter(g => g !== group))
    } else {
      // Basic só permite: Adultos e Idosos
      if (currentPlan === 'basic') {
        const allowedBasic = ['Adultos (18-59 anos)', 'Idosos (60+ anos)']
        if (!allowedBasic.includes(group)) {
          setMessage({ 
            type: 'error', 
            text: `⚠️ Plano Essencial permite apenas Adultos e Idosos. Mude para Premium para atender outras faixas etárias!` 
          })
          setTimeout(() => setMessage(null), 4000)
          return
        }
      }
      setAgeGroups([...ageGroups, group])
    }
  }

  const toggleModality = (mod: string) => {
    if (modality.includes(mod)) {
      if (mod === 'online') return // Online é obrigatório
      setModality(modality.filter(m => m !== mod))
    } else {
      // Basic só permite: Online
      if (currentPlan === 'basic' && mod !== 'online') {
        setMessage({ 
          type: 'error', 
          text: `⚠️ Plano Essencial permite apenas atendimento Online. Mude para Premium para atendimento Presencial ou Híbrido!` 
        })
        setTimeout(() => setMessage(null), 4000)
        return
      }
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

      // ✅ SALVAR EM AMBOS OS LUGARES
      
      // 1. Salvar na tabela psychologists
      const { error: psychError } = await supabase
        .from('psychologists')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId)

      if (psychError) throw psychError

      // 2. Salvar na tabela profiles (NOVO!)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId)

      if (profileError) throw profileError

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

  // Validação antes de salvar
  const validatePremiumFeatures = () => {
    if (currentPlan === 'basic') {
      // Validar faixas etárias
      const allowedAgeGroups = ['Adultos (18-59 anos)', 'Idosos (60+ anos)']
      const hasRestrictedAgeGroup = ageGroups.some(group => !allowedAgeGroups.includes(group))
      
      if (hasRestrictedAgeGroup) {
        setMessage({ 
          type: 'error', 
          text: `❌ Plano Essencial permite apenas Adultos e Idosos. Mude para Premium ou ajuste as faixas etárias.` 
        })
        return false
      }

      // Validar modalidade
      const hasRestrictedModality = modality.some(mod => mod !== 'online')
      if (hasRestrictedModality) {
        setMessage({ 
          type: 'error', 
          text: `❌ Plano Essencial permite apenas atendimento Online. Mude para Premium ou remova outras modalidades.` 
        })
        return false
      }
    }
    
    return true
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setMessage(null)

      // Validar plano
      if (!validatePremiumFeatures()) {
        setLoading(false)
        return
      }

      // Validações básicas
      if (ageGroups.length === 0) {
        throw new Error('Selecione pelo menos uma faixa etária')
      }
      if (!pixKey.trim()) {
        throw new Error('Chave PIX é obrigatória')
      }

      console.log('💾 Salvando Parte 2...')

      const { error: psychError } = await supabase
        .from('psychologists')
        .update({
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

      console.log('✅ Dados salvos!')
      setMessage({ type: 'success', text: '✓ Alterações salvas com sucesso!' })

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('🔴 ERRO:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = async (newPlan: 'basic' | 'premium') => {
    try {
      setLoading(true)
      setMessage(null)

      const { error } = await supabase
        .from('psychologists')
        .update({ plan_type: newPlan })
        .eq('user_id', userId)

      if (error) throw error

      setCurrentPlan(newPlan)
      setShowPlanModal(false)
      setMessage({ 
        type: 'success', 
        text: `✓ Plano alterado para ${newPlan === 'premium' ? 'Premium' : 'Essencial'}!` 
      })

      setTimeout(() => setMessage(null), 3000)

    } catch (error) {
      console.error('Erro ao mudar plano:', error)
      setMessage({ type: 'error', text: 'Erro ao alterar plano' })
    } finally {
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
              <h1>Alterar Cadastro - Parte 2</h1>
              <p>Logística, Pagamentos e Documentos</p>
            </div>
            <div className="header-actions">
              <Link href="/alterar-cadastro/parte-1" className="btn-back">
                ← Parte 1
              </Link>
              <Link href="/dashboard" className="btn-back">
                Dashboard
              </Link>
            </div>
          </div>

          {/* Indicador de Plano */}
          <div className={`plan-indicator ${currentPlan}`}>
            <div className="plan-badge">
              {currentPlan === 'premium' ? '💎 Premium' : '⭐ Essencial'}
            </div>
            <div className="plan-limits">
              <span>Faixas etárias: {currentPlan === 'premium' ? 'Todas' : 'Adultos e Idosos'}</span>
              <span>Modalidade: {currentPlan === 'premium' ? 'Todas' : 'Apenas Online'}</span>
            </div>
            <button 
              onClick={() => setShowPlanModal(true)}
              className="btn-change-plan"
            >
              Alterar Plano
            </button>
          </div>

          {/* Conteúdo */}
          <div className="content-card">
            
            {/* LOGÍSTICA */}
            <section>
              <h2>📅 Logística de Atendimento</h2>
              
              <h3>Faixas Etárias *</h3>
              <p className="subtitle">
                {currentPlan === 'premium' 
                  ? 'Selecione as faixas etárias que você atende' 
                  : 'Plano Essencial: Apenas Adultos e Idosos'}
              </p>

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

              <h3 style={{ marginTop: '32px' }}>Modalidade de Atendimento *</h3>
              <p className="subtitle">
                {currentPlan === 'premium' 
                  ? 'Selecione como você atende' 
                  : 'Plano Essencial: Apenas Online'}
              </p>

              <div className="selection-grid">
                <button
                  type="button"
                  className={`selection-tag ${modality.includes('online') ? 'selected' : ''}`}
                  onClick={() => toggleModality('online')}
                >
                  🌐 Online
                </button>
                <button
                  type="button"
                  className={`selection-tag ${modality.includes('presencial') ? 'selected' : ''}`}
                  onClick={() => toggleModality('presencial')}
                >
                  🏢 Presencial
                </button>
                <button
                  type="button"
                  className={`selection-tag ${modality.includes('hibrido') ? 'selected' : ''}`}
                  onClick={() => toggleModality('hibrido')}
                >
                  🔄 Híbrido
                </button>
              </div>

              {(modality.includes('presencial') || modality.includes('hibrido')) && (
                <div style={{ marginTop: '24px' }}>
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
                      <label>Estado (UF)</label>
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

              <h3 style={{ marginTop: '32px' }}>Idiomas de Atendimento *</h3>

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
            </section>

            {/* DADOS BANCÁRIOS */}
            <section style={{ marginTop: '48px' }}>
              <h2>💰 Dados Bancários</h2>

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
            </section>

            {/* DOCUMENTOS */}
            <section style={{ marginTop: '48px' }}>
              <h2>📄 Documentos</h2>
              
              <h3>Foto de Perfil</h3>
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
                    <h4>Clique para enviar sua foto</h4>
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

              <h3 style={{ marginTop: '32px' }}>Comprovante do CRP</h3>
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
                    <h4>Clique para enviar o documento</h4>
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
            </section>

            {/* Mensagem */}
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Botões */}
            <div className="actions">
              <Link href="/alterar-cadastro/parte-1" className="btn-secondary">
                ← Voltar
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
                  '✓ Salvar e Finalizar'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Mudança de Plano */}
      {showPlanModal && (
        <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Escolha seu Plano</h2>
              <button className="modal-close" onClick={() => setShowPlanModal(false)}>✕</button>
            </div>

            <div className="plans-grid">
              {/* Plano Essencial */}
              <div className={`plan-card ${currentPlan === 'basic' ? 'current' : ''}`}>
                <div className="plan-header">
                  <h3>⭐ Essencial</h3>
                  {currentPlan === 'basic' && <span className="current-badge">Plano Atual</span>}
                </div>
                <div className="plan-price">20% por sessão</div>
                <ul className="plan-features">
                  <li>✓ Até 5 especializações</li>
                  <li>✓ Até 2 abordagens</li>
                  <li>✓ Apenas online</li>
                  <li>✓ Adultos e idosos</li>
                </ul>
                {currentPlan !== 'basic' && (
                  <button 
                    className="btn-select-plan"
                    onClick={() => handleChangePlan('basic')}
                    disabled={loading}
                  >
                    Selecionar
                  </button>
                )}
              </div>

              {/* Plano Premium */}
              <div className={`plan-card premium ${currentPlan === 'premium' ? 'current' : ''}`}>
                <div className="plan-header">
                  <h3>💎 Premium</h3>
                  {currentPlan === 'premium' && <span className="current-badge">Plano Atual</span>}
                </div>
                <div className="plan-price">R$ 300/mês</div>
                <ul className="plan-features">
                  <li>✓ Sem comissão</li>
                  <li>✓ Até 10 especializações</li>
                  <li>✓ Até 5 abordagens</li>
                  <li>✓ Todas modalidades</li>
                  <li>✓ Todas faixas etárias</li>
                  <li>✓ Destaque nas buscas</li>
                </ul>
                {currentPlan !== 'premium' && (
                  <button 
                    className="btn-select-plan primary"
                    onClick={() => handleChangePlan('premium')}
                    disabled={loading}
                  >
                    Selecionar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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

  .btn-change-plan {
    padding: 10px 20px;
    border-radius: 10px;
    background: #7c65b5;
    color: white;
    border: none;
    font-weight: 700;
    font-size: 14px;
    white-space: nowrap;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-change-plan:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.4);
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

  section h3 {
    font-size: 18px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 8px;
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

  .selection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin: 16px 0;
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
    margin: 0 auto 16px;
  }

  .upload-placeholder h4 {
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

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 900px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .modal-header h2 {
    font-size: 28px;
    font-weight: 900;
    color: #2d1f3e;
  }

  .modal-close {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .modal-close:hover {
    background: #ef4444;
    color: white;
  }

  .plans-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .plan-card {
    padding: 32px 24px;
    border-radius: 16px;
    border: 2px solid rgba(124, 101, 181, 0.2);
    background: white;
    transition: all 0.3s ease;
  }

  .plan-card:hover {
    border-color: #7c65b5;
    box-shadow: 0 8px 32px rgba(124, 101, 181, 0.15);
  }

  .plan-card.premium {
    border-color: #7c65b5;
    background: linear-gradient(135deg, rgba(124, 101, 181, 0.05), rgba(169, 150, 221, 0.05));
  }

  .plan-card.current {
    border-width: 3px;
  }

  .plan-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .plan-header h3 {
    font-size: 22px;
    font-weight: 800;
    color: #2d1f3e;
  }

  .current-badge {
    padding: 4px 12px;
    background: #10b981;
    color: white;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;
  }

  .plan-price {
    font-size: 24px;
    font-weight: 900;
    color: #7c65b5;
    margin-bottom: 20px;
  }

  .plan-features {
    list-style: none;
    padding: 0;
    margin: 0 0 24px;
  }

  .plan-features li {
    padding: 8px 0;
    color: #2d1f3e;
    font-size: 15px;
  }

  .btn-select-plan {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 2px solid #7c65b5;
    background: white;
    color: #7c65b5;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-select-plan:hover:not(:disabled) {
    background: #7c65b5;
    color: white;
  }

  .btn-select-plan.primary {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    border: none;
  }

  .btn-select-plan.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.4);
  }

  .btn-select-plan:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

    .header-actions {
      flex-wrap: wrap;
      width: 100%;
    }

    .btn-back {
      flex: 1;
      text-align: center;
    }

    .plan-indicator {
      flex-direction: column;
      align-items: flex-start;
    }

    .plan-limits {
      flex-direction: column;
      gap: 8px;
    }

    .btn-change-plan {
      width: 100%;
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

    .plans-grid {
      grid-template-columns: 1fr;
    }

    .modal-content {
      padding: 24px;
    }
  }
`