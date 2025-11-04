'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import { User } from '@supabase/supabase-js'

interface Profile {
  user_type: 'patient' | 'psychologist'
  full_name: string
  avatar_url?: string
}

interface PsychologistData {
  id: string
  crp: string
  specialties: string[]
  approach: string
  approaches: string[]
  price_per_session: number
  short_bio: string
  full_bio: string
  education_list: any[]
  race: string
  sexual_orientation: string
  pronouns: string
  age_groups: string[]
  modality: string[]
  languages: string[]
  pix_key: string
  avatar_url?: string
  crp_document_url?: string
  plan_type: string
  approval_status: string
  is_active: boolean
  rating: number
  total_reviews: number
}

interface Appointment {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  patient?: {
    full_name: string
    avatar_url?: string
  }
}

interface ProfileCompletion {
  isComplete: boolean
  percentage: number
  missing: string[]
  parte1Complete: boolean
  parte2Complete: boolean
  parte3Complete: boolean
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [psychologistData, setPsychologistData] = useState<PsychologistData | null>(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    isComplete: false,
    percentage: 0,
    missing: [],
    parte1Complete: false,
    parte2Complete: false,
    parte3Complete: false
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type, full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileData) {
        setProfile(profileData)
        
        if (profileData.user_type === 'psychologist') {
          await loadPsychologistData(user.id)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPsychologistData = async (userId: string) => {
    try {
      const { data: psychData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!psychData) return

      setPsychologistData(psychData)
      checkProfileCompletion(psychData)

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          patient_id
        `)
        .eq('psychologist_id', psychData.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (appointmentsData) {
        const enrichedAppointments = await Promise.all(
          appointmentsData.map(async (apt) => {
            const { data: patientData } = await supabase
              .from('patients')
              .select('user_id')
              .eq('id', apt.patient_id)
              .maybeSingle()

            if (patientData) {
              const { data: patientProfile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('user_id', patientData.user_id)
                .maybeSingle()

              return {
                ...apt,
                patient: {
                  full_name: patientProfile?.full_name || 'Paciente',
                  avatar_url: patientProfile?.avatar_url
                }
              }
            }
            return apt
          })
        )

        setAppointments(enrichedAppointments)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do psicólogo:', error)
    }
  }

  const checkProfileCompletion = (data: PsychologistData) => {
    // PARTE 1 - Verificações
    const parte1Checks = [
      { complete: data.specialties && data.specialties.length > 0, label: 'Áreas de especialização' },
      { complete: data.approaches && data.approaches.length > 0, label: 'Abordagens terapêuticas' },
      { complete: data.education_list && data.education_list.length > 0, label: 'Formações e cursos' },
      { complete: !!data.short_bio && data.short_bio.trim() !== '', label: 'Biografia resumida' },
      { complete: !!data.full_bio && data.full_bio.trim() !== '', label: 'Biografia completa' },
      { complete: data.price_per_session > 0, label: 'Valor da sessão' },
      { complete: !!data.race && data.race.trim() !== '', label: 'Cor/Raça' },
      { complete: !!data.sexual_orientation && data.sexual_orientation.trim() !== '', label: 'Orientação sexual' },
      { complete: !!data.pronouns && data.pronouns.trim() !== '', label: 'Pronomes' }
    ]

    // PARTE 2 - Verificações
    const parte2Checks = [
      { complete: data.age_groups && data.age_groups.length > 0, label: 'Faixas etárias atendidas' },
      { complete: data.modality && data.modality.length > 0, label: 'Modalidade de atendimento' },
      { complete: data.languages && data.languages.length > 0, label: 'Idiomas de atendimento' },
      { complete: !!data.pix_key && data.pix_key.trim() !== '', label: 'Chave PIX' }
    ]

    // PARTE 3 - Verificações
    const parte3Checks = [
      { complete: !!data.avatar_url && data.avatar_url.trim() !== '', label: 'Foto de perfil' },
      { complete: !!data.crp_document_url && data.crp_document_url.trim() !== '', label: 'Comprovante do CRP' },
      { complete: !!data.plan_type && data.plan_type.trim() !== '', label: 'Plano escolhido' }
    ]

    const allChecks = [...parte1Checks, ...parte2Checks, ...parte3Checks]
    
    const parte1Completed = parte1Checks.filter(c => c.complete).length
    const parte1Total = parte1Checks.length
    const parte1Complete = parte1Completed === parte1Total

    const parte2Completed = parte2Checks.filter(c => c.complete).length
    const parte2Total = parte2Checks.length
    const parte2Complete = parte2Completed === parte2Total

    const parte3Completed = parte3Checks.filter(c => c.complete).length
    const parte3Total = parte3Checks.length
    const parte3Complete = parte3Completed === parte3Total

    const totalCompleted = allChecks.filter(c => c.complete).length
    const totalChecks = allChecks.length
    const percentage = Math.round((totalCompleted / totalChecks) * 100)
    
    const missing = allChecks.filter(c => !c.complete).map(c => c.label)

    setProfileCompletion({
      isComplete: percentage === 100,
      percentage,
      missing,
      parte1Complete,
      parte2Complete,
      parte3Complete
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      scheduled: { text: 'Agendada', class: 'status-scheduled' },
      confirmed: { text: 'Confirmada', class: 'status-confirmed' },
      completed: { text: 'Concluída', class: 'status-completed' },
      cancelled: { text: 'Cancelada', class: 'status-cancelled' }
    }
    return badges[status as keyof typeof badges] || { text: status, class: '' }
  }

  const getApprovalStatusBadge = (status: string) => {
    const badges = {
      pending: { text: 'Aguardando aprovação', class: 'approval-pending', icon: '⏳' },
      approved: { text: 'Aprovado', class: 'approval-approved', icon: '✅' },
      rejected: { text: 'Rejeitado', class: 'approval-rejected', icon: '❌' }
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    })
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(
      apt => apt.appointment_date >= today && apt.status !== 'cancelled'
    )
  }

  const getPastAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(
      apt => apt.appointment_date < today || apt.status === 'completed'
    )
  }

  // Função para determinar próximo passo
  const getNextStepUrl = () => {
    if (!profileCompletion.parte1Complete) return '/completar-perfil/parte-1'
    if (!profileCompletion.parte2Complete) return '/completar-perfil/parte-2'
    if (!profileCompletion.parte3Complete) return '/completar-perfil/parte-3'
    return '/dashboard'
  }

  const getNextStepLabel = () => {
    if (!profileCompletion.parte1Complete) return 'Começar Parte 1'
    if (!profileCompletion.parte2Complete) return 'Continuar para Parte 2'
    if (!profileCompletion.parte3Complete) return 'Continuar para Parte 3'
    return 'Perfil Completo'
  }

  if (loading) {
    return (
      <>
        <main className="dashboard-page">
          <div className="dashboard-container">
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando dashboard...</p>
            </div>
          </div>
        </main>
        <style jsx>{styles}</style>
      </>
    )
  }

  const upcomingAppointments = getUpcomingAppointments()
  const pastAppointments = getPastAppointments()
  const approvalBadge = psychologistData ? getApprovalStatusBadge(psychologistData.approval_status) : null

  return (
    <>
      <main className="dashboard-page">
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>

        <div className="dashboard-container">
          
          {/* Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="greeting">
                <h1>Olá, {profile?.full_name?.split(' ')[0] || 'Psicólogo'}! 👋</h1>
                <p>Bem-vindo ao seu painel de controle</p>
              </div>
            </div>
            <Link href="/perfil" className="btn-profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Editar Perfil
            </Link>
          </div>

          {/* Alerta de Perfil Incompleto */}
          {!profileCompletion.isComplete && (
            <div className="alert-card incomplete">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h3>Complete seu perfil para ficar visível</h3>
                <p>Você precisa completar algumas informações para que pacientes possam te encontrar</p>
                
                <div className="progress-bar-container">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${profileCompletion.percentage}%` }}></div>
                  </div>
                  <span className="progress-text">{profileCompletion.percentage}% completo</span>
                </div>

                {/* Indicador de partes */}
                <div className="parts-status">
                  <div className={`part-badge ${profileCompletion.parte1Complete ? 'complete' : 'incomplete'}`}>
                    {profileCompletion.parte1Complete ? '✓' : '○'} Parte 1 - Perfil Profissional
                  </div>
                  <div className={`part-badge ${profileCompletion.parte2Complete ? 'complete' : 'incomplete'}`}>
                    {profileCompletion.parte2Complete ? '✓' : '○'} Parte 2 - Logística e Pagamento
                  </div>
                  <div className={`part-badge ${profileCompletion.parte3Complete ? 'complete' : 'incomplete'}`}>
                    {profileCompletion.parte3Complete ? '✓' : '○'} Parte 3 - Documentos e Plano
                  </div>
                </div>

                <div className="missing-items">
                  <strong>Faltam:</strong>
                  <ul>
                    {profileCompletion.missing.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Botão inteligente - vai para a próxima parte incompleta */}
              <Link 
                href={getNextStepUrl()} 
                className="btn-complete"
              >
                {getNextStepLabel()}
                <span>→</span>
              </Link>
            </div>
          )}

          {/* Status de Aprovação */}
          {profileCompletion.isComplete && psychologistData && (
            <div className={`alert-card ${psychologistData.approval_status === 'approved' ? 'approved' : 'pending'}`}>
              <div className="alert-icon">{approvalBadge?.icon}</div>
              <div className="alert-content">
                {psychologistData.approval_status === 'pending' && (
                  <>
                    <h3>Aguardando aprovação</h3>
                    <p>Seu perfil está completo e em análise. Em breve você estará visível para os pacientes!</p>
                    <div className="plan-info">
                      <strong>Plano escolhido:</strong> {psychologistData.plan_type === 'premium' ? 'Premium 💎' : 'Essencial'}
                    </div>
                  </>
                )}
                {psychologistData.approval_status === 'approved' && psychologistData.is_active && (
                  <>
                    <h3>Perfil ativo! 🎉</h3>
                    <p>Seu perfil está aprovado e visível para pacientes. Aguarde os agendamentos chegarem!</p>
                    <div className="plan-info">
                      <strong>Plano ativo:</strong> {psychologistData.plan_type === 'premium' ? 'Premium 💎' : 'Essencial'}
                    </div>
                  </>
                )}
                {psychologistData.approval_status === 'approved' && !psychologistData.is_active && (
                  <>
                    <h3>Perfil aprovado mas inativo</h3>
                    <p>Entre em contato com o suporte para ativar seu perfil</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {psychologistData && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon sessions">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{appointments.filter(apt => apt.status === 'completed').length}</h3>
                  <p>Sessões realizadas</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon upcoming">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{upcomingAppointments.length}</h3>
                  <p>Sessões agendadas</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rating">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>{psychologistData.rating.toFixed(1)}</h3>
                  <p>{psychologistData.total_reviews} avaliações</p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>Próximas Sessões</h2>
                <p>Seus atendimentos agendados</p>
              </div>
              {upcomingAppointments.length > 0 && (
                <span className="count-badge">{upcomingAppointments.length}</span>
              )}
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>Nenhuma sessão agendada</h3>
                <p>
                  {profileCompletion.isComplete 
                    ? 'Aguardando novos agendamentos de pacientes' 
                    : 'Complete seu perfil para começar a receber agendamentos'}
                </p>
              </div>
            ) : (
              <div className="appointments-list">
                {upcomingAppointments.map(apt => (
                  <div key={apt.id} className="appointment-card">
                    <div className="appointment-avatar">
                      {apt.patient?.avatar_url ? (
                        <img src={apt.patient.avatar_url} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {getInitials(apt.patient?.full_name || 'P')}
                        </div>
                      )}
                    </div>

                    <div className="appointment-info">
                      <h3>{apt.patient?.full_name}</h3>
                      <div className="appointment-datetime">
                        <span>📅 {formatDate(apt.appointment_date)}</span>
                        <span>🕐 {formatTime(apt.appointment_time)}</span>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      <span className={`status-badge ${getStatusBadge(apt.status).class}`}>
                        {getStatusBadge(apt.status).text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <div>
                  <h2>Histórico de Sessões</h2>
                  <p>Atendimentos anteriores</p>
                </div>
                <span className="count-badge">{pastAppointments.length}</span>
              </div>

              <div className="appointments-list past">
                {pastAppointments.slice(0, 5).map(apt => (
                  <div key={apt.id} className="appointment-card past">
                    <div className="appointment-avatar">
                      {apt.patient?.avatar_url ? (
                        <img src={apt.patient.avatar_url} alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {getInitials(apt.patient?.full_name || 'P')}
                        </div>
                      )}
                    </div>

                    <div className="appointment-info">
                      <h3>{apt.patient?.full_name}</h3>
                      <div className="appointment-datetime">
                        <span>📅 {formatDate(apt.appointment_date)}</span>
                        <span>🕐 {formatTime(apt.appointment_time)}</span>
                      </div>
                    </div>

                    <div className="appointment-actions">
                      <span className={`status-badge ${getStatusBadge(apt.status).class}`}>
                        {getStatusBadge(apt.status).text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {pastAppointments.length > 5 && (
                <button className="btn-see-more">
                  Ver todas as {pastAppointments.length} sessões anteriores
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{styles}</style>
    </>
  )
}

const styles = `
  .dashboard-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 50%, #ddd8f0 100%);
    padding: 120px 24px 60px;
    position: relative;
    overflow: hidden;
  }

  .bg-decoration {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(124, 101, 181, 0.08) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
  }

  .bg-decoration-1 {
    width: 600px;
    height: 600px;
    top: -200px;
    right: -100px;
  }

  .bg-decoration-2 {
    width: 400px;
    height: 400px;
    bottom: -150px;
    left: -50px;
    animation-delay: -7s;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  }

  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 20px;
  }

  .header-content {
    animation: slideInLeft 0.6s ease;
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .greeting h1 {
    font-size: 36px;
    font-weight: 900;
    color: #2d1f3e;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }

  .greeting p {
    color: #6b5d7a;
    font-size: 16px;
  }

  .btn-profile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 12px;
    border: 2px solid rgba(124, 101, 181, 0.2);
    background: white;
    color: #7c65b5;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
    animation: slideInRight 0.6s ease;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .btn-profile:hover {
    border-color: #7c65b5;
    background: rgba(124, 101, 181, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.15);
  }

  /* Alert Card */
  .alert-card {
    background: white;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 32px;
    display: flex;
    align-items: flex-start;
    gap: 24px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    border: 2px solid;
    animation: slideDown 0.6s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .alert-card.incomplete {
    border-color: #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  }

  .alert-card.pending {
    border-color: #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  }

  .alert-card.approved {
    border-color: #22c55e;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  }

  .alert-icon {
    font-size: 48px;
    flex-shrink: 0;
  }

  .alert-content {
    flex: 1;
  }

  .alert-content h3 {
    font-size: 20px;
    font-weight: 800;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .alert-content p {
    color: #6b5d7a;
    font-size: 15px;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .progress-bar-container {
    margin-bottom: 16px;
  }

  .progress-bar-bg {
    height: 12px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-bar-fill {
    height: 100%;
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    border-radius: 20px;
    transition: width 0.5s ease;
  }

  .progress-text {
    font-size: 14px;
    font-weight: 700;
    color: #7c65b5;
  }

  .parts-status {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .part-badge {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .part-badge.complete {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .part-badge.incomplete {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .missing-items {
    background: rgba(255, 255, 255, 0.7);
    padding: 16px;
    border-radius: 10px;
    font-size: 14px;
  }

  .missing-items strong {
    color: #2d1f3e;
    display: block;
    margin-bottom: 8px;
  }

  .missing-items ul {
    list-style: none;
    padding: 0;
    margin: 0;
    color: #6b5d7a;
  }

  .missing-items li {
    margin-bottom: 4px;
  }

  .plan-info {
    background: rgba(255, 255, 255, 0.7);
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-top: 12px;
  }

  .plan-info strong {
    color: #2d1f3e;
  }

  .btn-complete {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 24px;
    border-radius: 12px;
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.3);
  }

  .btn-complete:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(124, 101, 181, 0.4);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.08);
    border: 1px solid rgba(124, 101, 181, 0.08);
    transition: all 0.3s ease;
    opacity: 0;
    animation: fadeInUp 0.6s ease forwards;
  }

  .stat-card:nth-child(1) { animation-delay: 0.1s; }
  .stat-card:nth-child(2) { animation-delay: 0.2s; }
  .stat-card:nth-child(3) { animation-delay: 0.3s; }

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

  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 28px rgba(124, 101, 181, 0.15);
  }

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .stat-icon.sessions {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
  }

  .stat-icon.upcoming {
    background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  }

  .stat-icon.rating {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  }

  .stat-content h3 {
    font-size: 32px;
    font-weight: 900;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .stat-content p {
    font-size: 14px;
    color: #6b5d7a;
    font-weight: 500;
  }

  /* Section Card */
  .section-card {
    background: white;
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.08);
    border: 1px solid rgba(124, 101, 181, 0.08);
    animation: fadeInUp 0.6s ease;
    animation-delay: 0.4s;
    animation-fill-mode: both;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .section-header h2 {
    font-size: 24px;
    font-weight: 800;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .section-header p {
    font-size: 14px;
    color: #6b5d7a;
  }

  .count-badge {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 6px 16px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(124, 101, 181, 0.25);
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.7;
  }

  .empty-state h3 {
    font-size: 20px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .empty-state p {
    color: #6b5d7a;
    font-size: 15px;
  }

  /* Appointments List */
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .appointment-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(244, 242, 250, 0.5) 0%, rgba(232, 228, 247, 0.5) 100%);
    border: 2px solid rgba(124, 101, 181, 0.1);
    transition: all 0.3s ease;
  }

  .appointment-card:hover {
    border-color: #7c65b5;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.15);
    transform: translateX(4px);
  }

  .appointment-card.past {
    opacity: 0.7;
  }

  .appointment-avatar {
    flex-shrink: 0;
  }

  .appointment-avatar img,
  .appointment-avatar .avatar-placeholder {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    object-fit: cover;
  }

  .avatar-placeholder {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
  }

  .appointment-info {
    flex: 1;
  }

  .appointment-info h3 {
    font-size: 18px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .appointment-datetime {
    display: flex;
    gap: 20px;
    font-size: 14px;
    color: #6b5d7a;
    font-weight: 500;
  }

  .appointment-actions {
    flex-shrink: 0;
  }

  .status-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-badge.status-scheduled {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  .status-badge.status-confirmed {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }

  .status-badge.status-completed {
    background: rgba(124, 101, 181, 0.1);
    color: #7c65b5;
  }

  .status-badge.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .btn-see-more {
    width: 100%;
    padding: 14px;
    margin-top: 16px;
    border-radius: 12px;
    border: 2px solid rgba(124, 101, 181, 0.2);
    background: white;
    color: #7c65b5;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-see-more:hover {
    border-color: #7c65b5;
    background: rgba(124, 101, 181, 0.05);
  }

  /* Loading */
  .loading {
    text-align: center;
    padding: 80px 20px;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(124, 101, 181, 0.1);
    border-top-color: #7c65b5;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading p {
    color: #6b5d7a;
    font-size: 16px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .dashboard-page {
      padding: 100px 16px 40px;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .greeting h1 {
      font-size: 28px;
    }

    .alert-card {
      flex-direction: column;
      padding: 24px;
    }

    .btn-complete {
      width: 100%;
      justify-content: center;
    }

    .parts-status {
      flex-direction: column;
    }

    .part-badge {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .section-card {
      padding: 24px 20px;
    }

    .appointment-card {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .appointment-actions {
      width: 100%;
    }

    .appointment-datetime {
      flex-direction: column;
      gap: 8px;
    }
  }
`