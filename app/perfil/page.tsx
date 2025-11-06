'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'

interface Psychologist {
  id: string
  user_id: string
  short_bio: string
  full_bio: string
  specialties: string[]
  approaches: string[]
  languages: string[]
  price_per_session: number
  session_duration: number
  rating: number
  total_reviews: number
  crp: string
  age_groups: string[]
  modality: string[]
  city?: string
  state_location?: string
  education_list: { title: string; year: string }[]
  gender?: string
  race?: string
  sexual_orientation?: string
  pronouns?: string
  profile: {
    full_name: string
    avatar_url?: string
  }
}

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  patient: {
    full_name: string
  }
}

export default function MeuPerfilPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [psychologist, setPsychologist] = useState<Psychologist | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about')

  useEffect(() => {
    checkUserAndLoad()
  }, [])

  const checkUserAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Verificar se é psicólogo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!profileData || profileData.user_type !== 'psychologist') {
        router.push('/dashboard')
        return
      }

      await loadMyProfile(user.id)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  const loadMyProfile = async (userId: string) => {
    try {
      setLoading(true)

      // Buscar dados do psicólogo
      const { data: psychData, error: psychError } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (psychError) {
        console.error('Erro ao buscar psicólogo:', psychError)
        return
      }

      if (!psychData) {
        console.log('Perfil de psicólogo não encontrado')
        return
      }

      // Buscar perfil do psicólogo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError)
      }

      setPsychologist({
        ...psychData,
        profile: {
          full_name: profileData?.full_name || 'Psicólogo',
          avatar_url: profileData?.avatar_url
        }
      })

      // Buscar avaliações (se houver)
      await loadReviews(psychData.id)

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async (psychId: string) => {
    try {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          patient_id
        `)
        .eq('psychologist_id', psychId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (reviewsData && reviewsData.length > 0) {
        const enrichedReviews = await Promise.all(
          reviewsData.map(async (review) => {
            const { data: patientData } = await supabase
              .from('patients')
              .select('user_id')
              .eq('id', review.patient_id)
              .maybeSingle()

            if (patientData) {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('user_id', patientData.user_id)
                .maybeSingle()

              return {
                ...review,
                patient: {
                  full_name: profileData?.full_name || 'Paciente Anônimo'
                }
              }
            }

            return {
              ...review,
              patient: {
                full_name: 'Paciente Anônimo'
              }
            }
          })
        )

        setReviews(enrichedReviews)
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Verificar se tem pelo menos um campo de afinidade preenchido
  const hasAffinityInfo = () => {
    return (
      (psychologist?.gender && psychologist.gender !== 'Prefiro não informar') ||
      (psychologist?.race && psychologist.race !== 'Prefiro não informar') ||
      (psychologist?.sexual_orientation && psychologist.sexual_orientation !== 'Prefiro não informar') ||
      (psychologist?.pronouns && psychologist.pronouns !== 'Prefiro não informar')
    )
  }

  if (loading) {
    return (
      <>
        <main className="profile-page">
          <div className="profile-container">
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando seu perfil...</p>
            </div>
          </div>
        </main>
        <style jsx>{styles}</style>
      </>
    )
  }

  if (!psychologist) {
    return (
      <>
        <main className="profile-page">
          <div className="profile-container">
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h2>Perfil não encontrado</h2>
              <p>Complete seu cadastro para visualizar seu perfil público.</p>
              <Link href="/completar-perfil/parte-1" className="btn-back">
                Completar cadastro
              </Link>
            </div>
          </div>
        </main>
        <style jsx>{styles}</style>
      </>
    )
  }

  return (
    <>
      <main className="profile-page">
        <div className="profile-container">
          
          {/* Banner de visualização própria */}
          <div className="preview-banner">
            <div className="banner-content">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <span>Você está visualizando seu perfil público</span>
            </div>
            <Link href="/alterar-cadastro/parte-1" className="btn-edit-profile">
              ✏️ Editar Perfil
            </Link>
          </div>

          {/* Header com Avatar e Info Principal */}
          <div className="profile-header">
            <div className="header-content">
              <div className="avatar-section">
                {psychologist.profile.avatar_url ? (
                  <Image
                    src={psychologist.profile.avatar_url} 
                    alt={psychologist.profile.full_name}
                    width={140}
                    height={140}
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(psychologist.profile.full_name)}
                  </div>
                )}
                <div className="verification-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  CRP Verificado
                </div>
              </div>

              <div className="info-section">
                <h1>{psychologist.profile.full_name}</h1>
                <p className="crp">CRP: {psychologist.crp}</p>
                
                <div className="rating-section">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill={i < Math.floor(psychologist.rating || 0) ? '#F59E0B' : '#E5E7EB'}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                    <span className="rating-text">
                      {(psychologist.rating || 0).toFixed(1)} ({psychologist.total_reviews || 0} avaliações)
                    </span>
                  </div>
                </div>

                <div className="quick-info">
                  <div className="info-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 6v6l4 2"></path>
                    </svg>
                    <span>Sessões de {psychologist.session_duration || 50} minutos</span>
                  </div>
                  
                  {psychologist.modality && psychologist.modality.length > 0 && (
                    <div className="info-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>{psychologist.modality.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</span>
                    </div>
                  )}

                  {(psychologist.city && psychologist.state_location) && (
                    <div className="info-item">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      <span>{psychologist.city}, {psychologist.state_location}</span>
                    </div>
                  )}
                  
                  <div className="info-item price">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span className="price-value">{formatPrice(psychologist.price_per_session)}/sessão</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Afinidade */}
          {hasAffinityInfo() && (
            <div className="affinity-section">
              <h3>🤝 Informações de Afinidade</h3>
              <p className="affinity-subtitle">
                Essas informações ajudam pacientes a encontrar profissionais com quem se identifiquem
              </p>
              <div className="affinity-grid">
                {psychologist.gender && psychologist.gender !== 'Prefiro não informar' && (
                  <div className="affinity-item">
                    <span className="affinity-label">Gênero:</span>
                    <span className="affinity-value">{psychologist.gender}</span>
                  </div>
                )}
                {psychologist.race && psychologist.race !== 'Prefiro não informar' && (
                  <div className="affinity-item">
                    <span className="affinity-label">Cor/Raça:</span>
                    <span className="affinity-value">{psychologist.race}</span>
                  </div>
                )}
                {psychologist.sexual_orientation && psychologist.sexual_orientation !== 'Prefiro não informar' && (
                  <div className="affinity-item">
                    <span className="affinity-label">Orientação Sexual:</span>
                    <span className="affinity-value">{psychologist.sexual_orientation}</span>
                  </div>
                )}
                {psychologist.pronouns && psychologist.pronouns !== 'Prefiro não informar' && (
                  <div className="affinity-item">
                    <span className="affinity-label">Pronomes:</span>
                    <span className="affinity-value">{psychologist.pronouns}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Especialidades */}
          {psychologist.specialties && psychologist.specialties.length > 0 && (
            <div className="specialties-section">
              <h3>Áreas de Especialização</h3>
              <div className="specialties-grid">
                {psychologist.specialties.map((specialty, idx) => (
                  <span key={idx} className="specialty-badge">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Abordagens */}
          {psychologist.approaches && psychologist.approaches.length > 0 && (
            <div className="approaches-section">
              <h3>Abordagens Terapêuticas</h3>
              <div className="approaches-grid">
                {psychologist.approaches.map((approach, idx) => (
                  <span key={idx} className="approach-badge">
                    {approach}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Faixas Etárias */}
          {psychologist.age_groups && psychologist.age_groups.length > 0 && (
            <div className="age-groups-section">
              <h3>Atende</h3>
              <div className="age-groups-list">
                {psychologist.age_groups.map((group, idx) => (
                  <span key={idx} className="age-group-badge">
                    👥 {group}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Idiomas */}
          {psychologist.languages && psychologist.languages.length > 0 && (
            <div className="languages-section">
              <h3>Idiomas</h3>
              <div className="languages-list">
                {psychologist.languages.map((language, idx) => (
                  <span key={idx} className="language-badge">
                    🌐 {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="tabs-section">
            <div className="tabs-header">
              <button 
                className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                Sobre
              </button>
              <button 
                className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Avaliações ({psychologist.total_reviews || 0})
              </button>
            </div>

            <div className="tabs-content">
              {activeTab === 'about' && (
                <div className="about-content">
                  {psychologist.short_bio && (
                    <div className="section-card">
                      <h3>Resumo</h3>
                      <p>{psychologist.short_bio}</p>
                    </div>
                  )}

                  {psychologist.full_bio && (
                    <div className="section-card">
                      <h3>Sobre mim</h3>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{psychologist.full_bio}</p>
                    </div>
                  )}

                  {psychologist.education_list && psychologist.education_list.length > 0 && (
                    <div className="section-card">
                      <h3>Formação e Cursos</h3>
                      <div className="education-list">
                        {psychologist.education_list.map((edu, idx) => (
                          <div key={idx} className="education-item">
                            <div className="edu-icon">🎓</div>
                            <div>
                              <strong>{edu.title}</strong>
                              <span className="edu-year"> - {edu.year}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-content">
                  {reviews.length === 0 ? (
                    <div className="empty-reviews">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      <p>Ainda não há avaliações no seu perfil.</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map(review => (
                        <div key={review.id} className="review-card">
                          <div className="review-header">
                            <div className="review-author">
                              <div className="author-avatar">
                                {getInitials(review.patient.full_name)}
                              </div>
                              <div>
                                <h4>{review.patient.full_name}</h4>
                                <p className="review-date">{formatDate(review.created_at)}</p>
                              </div>
                            </div>
                            <div className="review-stars">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill={i < review.rating ? '#F59E0B' : '#E5E7EB'}
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="review-comment">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{styles}</style>
    </>
  )
}

const styles = `
  .profile-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 100%);
    padding: 100px 24px 40px;
  }

  .profile-container {
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Preview Banner */
  .preview-banner {
    background: linear-gradient(135deg, rgba(124, 101, 181, 0.1) 0%, rgba(169, 150, 221, 0.1) 100%);
    border: 2px solid rgba(124, 101, 181, 0.2);
    border-radius: 12px;
    padding: 16px 24px;
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #7c65b5;
    font-weight: 600;
    font-size: 15px;
  }

  .banner-content svg {
    color: #7c65b5;
  }

  .btn-edit-profile {
    padding: 10px 20px;
    border-radius: 10px;
    background: white;
    color: #7c65b5;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    border: 2px solid rgba(124, 101, 181, 0.2);
    transition: all 0.3s ease;
  }

  .btn-edit-profile:hover {
    border-color: #7c65b5;
    background: rgba(124, 101, 181, 0.05);
  }

  /* Header */
  .profile-header {
    background: white;
    border-radius: 20px;
    padding: 40px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.1);
  }

  .header-content {
    display: flex;
    gap: 32px;
  }

  .avatar-section {
    position: relative;
    flex-shrink: 0;
  }

  .avatar,
  .avatar-placeholder {
    width: 140px;
    height: 140px;
    border-radius: 20px;
    object-fit: cover;
    border: 4px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #7c65b5, #a996dd) border-box;
  }

  .avatar-placeholder {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 48px;
  }

  .verification-badge {
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    white-space: nowrap;
  }

  .info-section {
    flex: 1;
  }

  .info-section h1 {
    font-size: 32px;
    font-weight: 800;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .crp {
    color: #6b5d7a;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .rating-section {
    margin-bottom: 20px;
  }

  .stars {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .rating-text {
    margin-left: 8px;
    color: #6b5d7a;
    font-size: 14px;
    font-weight: 600;
  }

  .quick-info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #6b5d7a;
    font-size: 15px;
  }

  .info-item svg {
    color: #7c65b5;
    flex-shrink: 0;
  }

  .info-item.price {
    margin-top: 8px;
  }

  .price-value {
    font-size: 24px;
    font-weight: 700;
    color: #7c65b5;
  }

  /* Affinity Section */
  .affinity-section {
    background: white;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.08);
    border: 2px solid rgba(124, 101, 181, 0.1);
  }

  .affinity-section h3 {
    font-size: 18px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 8px;
  }

  .affinity-subtitle {
    color: #6b5d7a;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .affinity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .affinity-item {
    padding: 16px;
    background: rgba(124, 101, 181, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(124, 101, 181, 0.1);
  }

  .affinity-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #9b8fab;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .affinity-value {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #2d1f3e;
  }

  /* Sections */
  .specialties-section,
  .approaches-section,
  .age-groups-section,
  .languages-section {
    background: white;
    border-radius: 16px;
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.08);
  }

  .specialties-section h3,
  .approaches-section h3,
  .age-groups-section h3,
  .languages-section h3 {
    font-size: 18px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 16px;
  }

  .specialties-grid,
  .approaches-grid,
  .age-groups-list,
  .languages-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .specialty-badge {
    padding: 10px 18px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(124, 101, 181, 0.1), rgba(169, 150, 221, 0.1));
    color: #7c65b5;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(124, 101, 181, 0.2);
  }

  .approach-badge {
    padding: 10px 18px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
    color: #f59e0b;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(251, 191, 36, 0.2);
  }

  .age-group-badge,
  .language-badge {
    padding: 10px 18px;
    border-radius: 10px;
    background: rgba(124, 101, 181, 0.05);
    color: #2d1f3e;
    font-size: 14px;
    font-weight: 600;
    border: 1px solid rgba(124, 101, 181, 0.1);
  }

  /* Tabs */
  .tabs-section {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.08);
  }

  .tabs-header {
    display: flex;
    border-bottom: 2px solid rgba(124, 101, 181, 0.1);
  }

  .tab {
    flex: 1;
    padding: 20px;
    border: none;
    background: none;
    color: #6b5d7a;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .tab:hover {
    background: rgba(124, 101, 181, 0.05);
  }

  .tab.active {
    color: #7c65b5;
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
  }

  .tabs-content {
    padding: 32px;
  }

  /* About Content */
  .about-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .section-card {
    padding: 24px;
    border-radius: 12px;
    background: rgba(124, 101, 181, 0.03);
    border: 1px solid rgba(124, 101, 181, 0.1);
  }

  .section-card h3 {
    font-size: 18px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 12px;
  }

  .section-card p {
    color: #6b5d7a;
    line-height: 1.7;
    font-size: 15px;
  }

  .education-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .education-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: white;
    border-radius: 10px;
    border: 1px solid rgba(124, 101, 181, 0.1);
  }

  .edu-icon {
    font-size: 24px;
  }

  .education-item strong {
    color: #2d1f3e;
    font-weight: 700;
  }

  .edu-year {
    color: #6b5d7a;
    font-weight: 500;
  }

  /* Reviews */
  .reviews-content {
    min-height: 300px;
  }

  .empty-reviews {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-reviews svg {
    color: #9b8fab;
    margin-bottom: 16px;
  }

  .empty-reviews p {
    color: #6b5d7a;
    font-size: 15px;
  }

  .reviews-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .review-card {
    padding: 24px;
    border-radius: 12px;
    background: rgba(124, 101, 181, 0.03);
    border: 1px solid rgba(124, 101, 181, 0.1);
  }

  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .review-author {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .author-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
  }

  .review-author h4 {
    font-size: 15px;
    font-weight: 600;
    color: #2d1f3e;
  }

  .review-date {
    font-size: 13px;
    color: #9b8fab;
  }

  .review-stars {
    display: flex;
    gap: 2px;
  }

  .review-comment {
    color: #6b5d7a;
    line-height: 1.6;
    font-size: 14px;
  }

  /* Loading & Empty State */
  .loading,
  .empty-state {
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

  .loading p,
  .empty-state p {
    color: #6b5d7a;
    font-size: 16px;
  }

  .empty-state svg {
    color: #9b8fab;
    margin-bottom: 20px;
  }

  .empty-state h2 {
    font-size: 24px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 12px;
  }

  .btn-back {
    display: inline-block;
    margin-top: 24px;
    padding: 12px 28px;
    border-radius: 10px;
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    color: white;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .btn-back:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(124, 101, 181, 0.3);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .profile-page {
      padding: 90px 16px 40px;
    }

    .preview-banner {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .banner-content {
      justify-content: center;
    }

    .profile-header {
      padding: 24px;
    }

    .header-content {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 24px;
    }

    .avatar,
    .avatar-placeholder {
      width: 120px;
      height: 120px;
    }

    .info-section h1 {
      font-size: 24px;
    }

    .price-value {
      font-size: 20px;
    }

    .affinity-grid {
      grid-template-columns: 1fr;
    }

    .specialties-section,
    .approaches-section,
    .age-groups-section,
    .languages-section,
    .affinity-section,
    .tabs-content {
      padding: 20px;
    }
  }
`