'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import Image from 'next/image'

export default function CompletarPerfilParte3() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentStep, setCurrentStep] = useState(7)
  const [userId, setUserId] = useState<string | null>(null)

  // Dados já salvos da Parte 1 e 2 (para validação)
  const [specialtiesCount, setSpecialtiesCount] = useState(0)
  const [approachesCount, setApproachesCount] = useState(0)
  const [ageGroups, setAgeGroups] = useState<string[]>([])
  const [modality, setModality] = useState<string[]>([])

  // Step 7 - Foto de Perfil
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Step 8 - Documento CRP
  const [crpFile, setCrpFile] = useState<File | null>(null)
  const [crpPreview, setCrpPreview] = useState<string | null>(null)
  const [crpUrl, setCrpUrl] = useState<string | null>(null)
  const [uploadingCrp, setUploadingCrp] = useState(false)
  const crpInputRef = useRef<HTMLInputElement>(null)

  // Step 9 - Escolha de Plano
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('premium')

  const ageGroupsList = ['Crianças (0-12 anos)', 'Adolescentes (13-17 anos)', 'Casais', 'Famílias']

  useEffect(() => {
    loadUserData()
  }, [])

  // ✅ Cleanup para mensagens automáticas
  useEffect(() => {
    if (message) {
      const timeoutId = setTimeout(() => setMessage(null), 3000)
      return () => clearTimeout(timeoutId)
    }
  }, [message])

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
        // Carregar dados para validação
        setSpecialtiesCount(psychData.specialties?.length || 0)
        setApproachesCount(psychData.approaches?.length || 0)
        if (psychData.age_groups) setAgeGroups(psychData.age_groups)
        if (psychData.modality) setModality(psychData.modality)
        
        // Carregar URLs dos arquivos já enviados
        if (psychData.avatar_url) {
          setAvatarUrl(psychData.avatar_url)
          setAvatarPreview(psychData.avatar_url)
        }
        if (psychData.crp_document_url) {
          setCrpUrl(psychData.crp_document_url)
          setCrpPreview(psychData.crp_document_url)
        }
        if (psychData.plan_type) {
          setSelectedPlan(psychData.plan_type)
        }
      } else {
        setMessage({ type: 'error', text: 'Complete as partes anteriores primeiro!' })
        // ✅ Redireciona imediatamente sem setTimeout
        router.push('/completar-perfil/parte-1')
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  // Validar arquivo
  const validateFile = (file: File, maxSize: number, allowedTypes: string[]) => {
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / 1048576
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`)
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo não permitido. Use: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`)
    }
    return true
  }

  // Upload de Avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Validar
      validateFile(file, 2097152, ['image/jpeg', 'image/png', 'image/webp'])
      
      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      setAvatarFile(file)
      setMessage(null)
      
      // Upload automático
      await uploadAvatar(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      setMessage({ type: 'error', text: errorMessage })
      setAvatarFile(null)
      setAvatarPreview(null)
    }
  }

  const uploadAvatar = async (file: File) => {
    try {
      setUploadingAvatar(true)
      setMessage(null)

      // Nome único do arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Deletar avatar antigo se existir
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)

      // ✅ USAR Promise.all PARA GARANTIR ATOMICIDADE
      const [psychResult, profileResult] = await Promise.all([
        supabase
          .from('psychologists')
          .update({ avatar_url: publicUrl })
          .eq('user_id', userId),
        supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('user_id', userId)
      ])

      // ✅ Verificar ambos os resultados
      if (psychResult.error || profileResult.error) {
        console.error('Erro ao salvar avatar:', { 
          psychError: psychResult.error, 
          profileError: profileResult.error 
        })
        throw new Error('Erro ao salvar avatar no banco de dados')
      }

      setMessage({ type: 'success', text: '✓ Foto enviada com sucesso!' })
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar foto'
      setMessage({ type: 'error', text: errorMessage })
      setAvatarFile(null)
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Upload de CRP
  const handleCrpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Validar
      validateFile(file, 5242880, ['image/jpeg', 'image/png', 'application/pdf'])
      
      // Preview (só para imagens)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCrpPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setCrpPreview('PDF')
      }
      
      setCrpFile(file)
      setMessage(null)
      
      // Upload automático
      await uploadCrp(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
      setMessage({ type: 'error', text: errorMessage })
      setCrpFile(null)
      setCrpPreview(null)
    }
  }

  const uploadCrp = async (file: File) => {
    try {
      setUploadingCrp(true)
      setMessage(null)

      const fileExt = file.name.split('.').pop()
      const fileName = `crp-${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Deletar documento antigo se existir
      if (crpUrl) {
        const oldPath = crpUrl.split('crp-documents/')[1]
        if (oldPath) {
          await supabase.storage.from('crp-documents').remove([oldPath])
        }
      }

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('crp-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Obter URL (privada, mas salvar o path)
      const { data: { publicUrl } } = supabase.storage
        .from('crp-documents')
        .getPublicUrl(filePath)

      setCrpUrl(publicUrl)

      // Salvar URL no banco
      const { error: updateError } = await supabase
        .from('psychologists')
        .update({ crp_document_url: publicUrl })
        .eq('user_id', userId)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: '✓ Documento enviado com sucesso!' })
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar documento'
      setMessage({ type: 'error', text: errorMessage })
      setCrpFile(null)
      setCrpPreview(null)
    } finally {
      setUploadingCrp(false)
    }
  }

  // Função para verificar recursos premium em uso
  const getPremiumFeaturesUsed = () => {
    const features: string[] = []

    if (specialtiesCount > 5) {
      features.push(`${specialtiesCount} áreas de especialização (máx 5 no Essencial)`)
    }
    if (approachesCount > 2) {
      features.push(`${approachesCount} abordagens terapêuticas (máx 2 no Essencial)`)
    }

    const premiumAges = ageGroups.filter(age => ageGroupsList.includes(age))
    if (premiumAges.length > 0) {
      features.push(`Atendimento a ${premiumAges.join(', ')}`)
    }

    if (modality.includes('presencial') || modality.includes('hibrido')) {
      const modes = []
      if (modality.includes('presencial')) modes.push('presencial')
      if (modality.includes('hibrido')) modes.push('híbrido')
      features.push(`Atendimento ${modes.join(' e ')}`)
    }

    return features
  }

  const validateStep7 = () => {
    if (!avatarUrl) {
      setMessage({ type: 'error', text: 'Envie uma foto de perfil' })
      return false
    }
    return true
  }

  const validateStep8 = () => {
    if (!crpUrl) {
      setMessage({ type: 'error', text: 'Envie o comprovante do CRP' })
      return false
    }
    return true
  }

  const validateStep9 = () => {
    if (!selectedPlan) {
      setMessage({ type: 'error', text: 'Selecione um plano' })
      return false
    }

    // Se escolheu essencial, verificar recursos premium
    if (selectedPlan === 'basic') {
      const premiumFeatures = getPremiumFeaturesUsed()
      if (premiumFeatures.length > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setMessage({ 
          type: 'error', 
          text: 'Você está usando recursos Premium. Escolha o Plano Premium ou volte e ajuste suas seleções.' 
        })
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    setMessage(null)
    
    if (currentStep === 7 && !validateStep7()) return
    if (currentStep === 8 && !validateStep8()) return
    
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 7) {
      setCurrentStep(currentStep - 1)
      setMessage(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      router.push('/completar-perfil/parte-2')
    }
  }

  const handleSubmit = async () => {
    if (!validateStep9()) return

    try {
      setLoading(true)
      setMessage(null)

      const updateData = {
        plan_type: selectedPlan,
        monthly_fee: selectedPlan === 'premium' ? 300 : null,
        commission_rate: selectedPlan === 'basic' ? 0.20 : 0.00,
        approval_status: 'pending',
        is_active: false
      }

      const { error } = await supabase
        .from('psychologists')
        .update(updateData)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao finalizar:', error)
        throw error
      }

      setMessage({ 
        type: 'success', 
        text: '✓ Cadastro enviado! Aguarde aprovação da equipe.' 
      })

      // ✅ Redireciona imediatamente sem setTimeout
      router.push('/dashboard')

    } catch (error) {
      console.error('🔴 ERRO:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro ao finalizar cadastro'
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
      setLoading(false) // ✅ Re-habilita em caso de erro
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

  const premiumFeaturesUsed = getPremiumFeaturesUsed()

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
              <h3>Parte 3 de 3</h3>
              <p>Documentos e Finalização</p>
            </div>

            <div className="progress-steps">
              {[
                { num: 7, title: 'Foto', desc: 'Foto de perfil' },
                { num: 8, title: 'Documentos', desc: 'Comprovante CRP' },
                { num: 9, title: 'Plano', desc: 'Escolha seu plano' }
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

            <div className="back-to-part2">
              <Link href="/completar-perfil/parte-2" className="link-back">
                ← Voltar para Parte 2
              </Link>
            </div>
          </div>

          {/* Formulário */}
          <div className="form-container">
            <div className="form-card">
              
              {/* STEP 7 - Foto de Perfil */}
              {currentStep === 7 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Foto de Perfil</h2>
                    <p>Adicione uma foto profissional para seu perfil</p>
                  </div>

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

                  <div className="tips-box">
                    <h4>📸 Dicas para uma boa foto:</h4>
                    <ul>
                      <li>Use uma foto recente e profissional</li>
                      <li>Fundo neutro e boa iluminação</li>
                      <li>Olhe para a câmera e sorria naturalmente</li>
                      <li>Evite fotos de corpo inteiro - foco no rosto</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* STEP 8 - Documento CRP */}
              {currentStep === 8 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Comprovante do CRP</h2>
                    <p>Envie uma foto ou PDF do seu registro no CRP</p>
                  </div>

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

                  <div className="tips-box">
                    <h4>📄 Sobre o documento:</h4>
                    <ul>
                      <li>Envie uma foto legível ou digitalização do CRP</li>
                      <li>Certifique-se que o número do CRP está visível</li>
                      <li>O documento será verificado pela equipe</li>
                      <li>Formato aceito: JPG, PNG ou PDF</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* STEP 9 - Escolha de Plano */}
              {currentStep === 9 && (
                <div className="form-step">
                  <div className="step-header">
                    <h2>Escolha seu Plano</h2>
                    <p>Selecione o plano ideal para sua prática profissional</p>
                  </div>

                  <div className="plans-grid">
                    {/* Plano Essencial */}
                    <div 
                      className={`plan-card ${selectedPlan === 'basic' ? 'selected' : ''}`}
                      onClick={() => setSelectedPlan('basic')}
                    >
                      <div className="plan-header">
                        <h3>Plano Essencial</h3>
                        <div className="plan-price">
                          <span className="price-value">20%</span>
                          <span className="price-label">de comissão por sessão</span>
                        </div>
                      </div>

                      <ul className="plan-features">
                        <li>✓ Perfil visível na plataforma</li>
                        <li>✓ Até 5 áreas de especialização</li>
                        <li>✓ Até 2 abordagens terapêuticas</li>
                        <li>✓ Atendimento online</li>
                        <li>✓ Atendimento a adultos e idosos</li>
                        <li>✓ Sistema de agendamento</li>
                        <li>✓ Recebimento por PIX</li>
                      </ul>

                      <button 
                        type="button"
                        className={`btn-select ${selectedPlan === 'basic' ? 'selected' : ''}`}
                      >
                        {selectedPlan === 'basic' ? '✓ Selecionado' : 'Selecionar Essencial'}
                      </button>
                    </div>

                    {/* Plano Premium */}
                    <div 
                      className={`plan-card premium ${selectedPlan === 'premium' ? 'selected' : ''}`}
                      onClick={() => setSelectedPlan('premium')}
                    >
                      <div className="premium-ribbon">RECOMENDADO</div>
                      <div className="plan-header">
                        <h3>Plano Premium 💎</h3>
                        <div className="plan-price">
                          <span className="price-value">R$ 300</span>
                          <span className="price-label">por mês</span>
                        </div>
                      </div>

                      <ul className="plan-features">
                        <li>✓ <strong>Sem comissão por sessão</strong></li>
                        <li>✓ <strong>Destaque nas buscas</strong></li>
                        <li>✓ Badge &quot;Premium&quot; no perfil</li>
                        <li>✓ Até 10 áreas de especialização</li>
                        <li>✓ Até 5 abordagens terapêuticas</li>
                        <li>✓ Atendimento online, presencial ou híbrido</li>
                        <li>✓ Todas faixas etárias (crianças, adolescentes, casais, família)</li>
                        <li>✓ Prioridade no suporte</li>
                      </ul>

                      <button 
                        type="button"
                        className={`btn-select premium ${selectedPlan === 'premium' ? 'selected' : ''}`}
                      >
                        {selectedPlan === 'premium' ? '✓ Selecionado' : 'Selecionar Premium'}
                      </button>
                    </div>
                  </div>

                  {/* Alerta de recursos premium */}
                  {selectedPlan === 'basic' && premiumFeaturesUsed.length > 0 && (
                    <div className="alert-premium-features">
                      <div className="alert-icon">⚠️</div>
                      <div>
                        <h4>Atenção! Recursos Premium detectados</h4>
                        <p>Você selecionou recursos <strong>exclusivos do Plano Premium</strong>:</p>
                        <ul>
                          {premiumFeaturesUsed.map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                        <div className="alert-actions">
                          <strong>Para continuar:</strong><br/>
                          ✓ Escolha o <strong>Plano Premium</strong>, OU<br/>
                          ✓ Volte e ajuste suas seleções
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Resumo de sucesso */}
                  {selectedPlan && (selectedPlan === 'premium' || premiumFeaturesUsed.length === 0) && (
                    <div className="success-summary">
                      <div className="success-icon">✓</div>
                      <div>
                        <h4>Tudo pronto! Seu cadastro está completo</h4>
                        <p>Plano <strong>{selectedPlan === 'premium' ? 'Premium' : 'Essencial'}</strong> selecionado. Clique em &quot;Enviar para Aprovação&quot; para finalizar.</p>
                      </div>
                    </div>
                  )}
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

                {currentStep < 9 ? (
                  <button type="button" className="btn-next" onClick={handleNext}>
                    Próximo →
                  </button>
                ) : (
                  <button type="button" className="btn-submit" onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Enviando...
                      </>
                    ) : (
                      '✓ Enviar para Aprovação'
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

        .back-to-part2 {
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

        .upload-area {
          margin-bottom: 32px;
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

        .tips-box {
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          padding: 20px;
        }

        .tips-box h4 {
          font-size: 16px;
          font-weight: 700;
          color: #2d1f3e;
          margin-bottom: 12px;
        }

        .tips-box ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .tips-box li {
          padding: 6px 0;
          color: #6b5d7a;
          font-size: 14px;
          line-height: 1.6;
        }

        .tips-box li::before {
          content: '•';
          color: #3b82f6;
          font-weight: bold;
          display: inline-block;
          width: 1em;
          margin-left: -1em;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .plan-card {
          position: relative;
          background: white;
          border: 3px solid rgba(124, 101, 181, 0.2);
          border-radius: 16px;
          padding: 32px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .plan-card:hover {
          border-color: #7c65b5;
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.2);
        }

        .plan-card.selected {
          border-color: #7c65b5;
          background: linear-gradient(135deg, rgba(124, 101, 181, 0.05) 0%, rgba(169, 150, 221, 0.05) 100%);
          box-shadow: 0 8px 32px rgba(124, 101, 181, 0.25);
        }

        .plan-card.premium {
          border-color: rgba(251, 191, 36, 0.3);
        }

        .plan-card.premium:hover {
          border-color: #f59e0b;
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);
        }

        .plan-card.premium.selected {
          border-color: #f59e0b;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.35);
        }

        .premium-ribbon {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
        }

        .plan-header {
          margin-bottom: 24px;
        }

        .plan-header h3 {
          font-size: 24px;
          font-weight: 800;
          color: #2d1f3e;
          margin-bottom: 12px;
        }

        .plan-price {
          display: flex;
          flex-direction: column;
        }

        .price-value {
          font-size: 36px;
          font-weight: 900;
          color: #7c65b5;
        }

        .plan-card.premium .price-value {
          color: #f59e0b;
        }

        .price-label {
          font-size: 14px;
          color: #6b5d7a;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
        }

        .plan-features li {
          padding: 8px 0;
          color: #2d1f3e;
          font-size: 15px;
        }

        .btn-select {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 2px solid #7c65b5;
          background: white;
          color: #7c65b5;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-select:hover {
          background: #7c65b5;
          color: white;
        }

        .btn-select.selected {
          background: #7c65b5;
          color: white;
        }

        .btn-select.premium {
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .btn-select.premium:hover {
          background: #f59e0b;
          color: white;
        }

        .btn-select.premium.selected {
          background: #f59e0b;
          color: white;
        }

        .alert-premium-features {
          display: flex;
          gap: 16px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.1) 100%);
          border: 2px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          margin-top: 24px;
        }

        .alert-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .alert-premium-features h4 {
          font-size: 18px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 8px;
        }

        .alert-premium-features p {
          font-size: 14px;
          color: #6b5d7a;
          margin-bottom: 8px;
        }

        .alert-premium-features ul {
          list-style: none;
          padding: 0;
          margin: 12px 0;
        }

        .alert-premium-features li {
          color: #dc2626;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .alert-actions {
          margin-top: 12px;
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.6;
        }

        .success-summary {
          display: flex;
          gap: 16px;
          padding: 24px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%);
          border: 2px solid rgba(34, 197, 94, 0.3);
          border-radius: 12px;
          margin-top: 24px;
        }

        .success-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #22c55e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .success-summary h4 {
          font-size: 18px;
          font-weight: 700;
          color: #16a34a;
          margin-bottom: 8px;
        }

        .success-summary p {
          font-size: 14px;
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

          .plans-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
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