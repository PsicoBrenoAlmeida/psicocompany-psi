// components/layout/Navbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabaseClient'
import { User } from '@supabase/supabase-js'

interface ProfileData {
  full_name?: string
  avatar_url?: string
  user_type?: 'patient' | 'psychologist'
}

interface PsychologistData {
  specialties: string[]
  approaches: string[]
  education_list: any[]
  short_bio: string
  full_bio: string
  price_per_session: number
  age_groups: string[]
  modality: string[]
  languages: string[]
  pix_key: string
  avatar_url?: string
  crp_document_url?: string
  plan_type: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isPsychologist, setIsPsychologist] = useState(false)
  const [profileComplete, setProfileComplete] = useState(true) // Assume completo por padrão
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, user_type')
            .eq('user_id', user.id)
            .single()
          
          setProfileData(profile)
          
          // Se for psicólogo, verificar se o perfil está completo
          if (profile?.user_type === 'psychologist') {
            setIsPsychologist(true)
            await checkProfileCompletion(user.id)
          }
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, user_type')
          .eq('user_id', session.user.id)
          .single()
        
        setProfileData(profile)
        
        if (profile?.user_type === 'psychologist') {
          setIsPsychologist(true)
          await checkProfileCompletion(session.user.id)
        }
      } else {
        setProfileData(null)
        setIsPsychologist(false)
        setProfileComplete(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: psychData } = await supabase
        .from('psychologists')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!psychData) {
        setProfileComplete(false)
        return
      }

      // PARTE 1 - Perfil Profissional
      const parte1Complete = 
        psychData.specialties && psychData.specialties.length > 0 &&
        psychData.approaches && psychData.approaches.length > 0 &&
        psychData.education_list && psychData.education_list.length > 0 &&
        psychData.short_bio && psychData.short_bio.trim() !== '' &&
        psychData.full_bio && psychData.full_bio.trim() !== '' &&
        psychData.price_per_session > 0

      // PARTE 2 - Logística e Pagamentos
      const parte2Complete = 
        psychData.age_groups && psychData.age_groups.length > 0 &&
        psychData.modality && psychData.modality.length > 0 &&
        psychData.languages && psychData.languages.length > 0 &&
        psychData.pix_key && psychData.pix_key.trim() !== ''

      // PARTE 3 - Documentos e Plano
      const parte3Complete = 
        psychData.avatar_url && psychData.avatar_url.trim() !== '' &&
        psychData.crp_document_url && psychData.crp_document_url.trim() !== '' &&
        psychData.plan_type && psychData.plan_type.trim() !== ''

      const isComplete = parte1Complete && parte2Complete && parte3Complete
      setProfileComplete(isComplete)
    } catch (error) {
      console.error('Erro ao verificar perfil:', error)
      setProfileComplete(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfileData(null)
    setIsPsychologist(false)
    setProfileComplete(true)
    setDropdownOpen(false)
    router.push('/')
  }

  const getInitials = (name: string | undefined, email: string | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email ? email[0].toUpperCase() : 'U'
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="navbar-logo">
            <span className="logo-text">Psicocompany</span>
          </Link>

          {/* Loading skeleton */}
          {loading ? (
            <div className="navbar-skeleton">
              <div className="skeleton-btn"></div>
              <div className="skeleton-btn primary"></div>
            </div>
          ) : (
            <>
              {/* PRÉ-LOGIN */}
              {!user && (
                <div className="navbar-auth">
                  <Link href="/login" className="btn-login">
                    Entrar
                  </Link>
                  <Link href="/cadastro-rapido" className="btn-signup">
                    Criar conta
                  </Link>
                </div>
              )}

              {/* PÓS-LOGIN */}
              {user && (
                <>
                  <div className="navbar-center">
                    <Link 
                      href="/perfil" 
                      className={`nav-link ${isActive('/perfil') ? 'active' : ''}`}
                      title="Ver meu perfil"
                    >
                      Meu perfil
                    </Link>
                    
                    <Link 
                      href="/financeiro" 
                      className={`nav-link ${isActive('/financeiro') ? 'active' : ''}`}
                      title="Financeiro"
                    >
                      Financeiro
                    </Link>
                  </div>

                  <div className="navbar-profile" ref={dropdownRef}>
                    <button
                      className="profile-button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-label="Menu do perfil"
                    >
                      {profileData?.avatar_url ? (
                        <img 
                          src={profileData.avatar_url} 
                          alt="Avatar" 
                          className="avatar"
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {getInitials(profileData?.full_name, user.email)}
                        </div>
                      )}
                      <svg 
                        className={`chevron ${dropdownOpen ? 'open' : ''}`}
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="3"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>

                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-header">
                          <div className="dropdown-avatar">
                            {profileData?.avatar_url ? (
                              <img 
                                src={profileData.avatar_url} 
                                alt="Avatar" 
                              />
                            ) : (
                              <div className="dropdown-avatar-placeholder">
                                {getInitials(profileData?.full_name, user.email)}
                              </div>
                            )}
                          </div>
                          <div className="dropdown-info">
                            <div className="dropdown-name">
                              {profileData?.full_name || 'Usuário'}
                            </div>
                            <div className="dropdown-email">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="dropdown-section">
                          <Link 
                            href="/dashboard" 
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7"></rect>
                              <rect x="14" y="3" width="7" height="7"></rect>
                              <rect x="14" y="14" width="7" height="7"></rect>
                              <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                            <span>Dashboard</span>
                          </Link>

                          {/* SÓ MOSTRAR PARA PSICÓLOGOS */}
                          {isPsychologist && (
                            <>
                              {profileComplete ? (
                                // Perfil completo → Alterar cadastro
                                <Link 
                                  href="/alterar-cadastro/parte-1" 
                                  className="dropdown-item"
                                  onClick={() => setDropdownOpen(false)}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                  </svg>
                                  <span>Alterar cadastro</span>
                                </Link>
                              ) : (
                                // Perfil incompleto → Completar cadastro
                                <Link 
                                  href="/completar-perfil/parte-1" 
                                  className="dropdown-item incomplete"
                                  onClick={() => setDropdownOpen(false)}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                  </svg>
                                  <span>Completar cadastro</span>
                                  <div className="incomplete-badge">!</div>
                                </Link>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="dropdown-divider"></div>
                        
                        <div className="dropdown-section">
                          <Link 
                            href="/configuracoes" 
                            className="dropdown-item"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="3"></circle>
                              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"></path>
                            </svg>
                            <span>Configurações</span>
                          </Link>
                        </div>
                        
                        <div className="dropdown-divider"></div>
                        
                        <div className="dropdown-section">
                          <button 
                            className="dropdown-item logout"
                            onClick={handleLogout}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span>Sair</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 72px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(124, 101, 181, 0.08);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .navbar.scrolled {
          box-shadow: 0 4px 30px rgba(124, 101, 181, 0.12);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-logo {
          text-decoration: none;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .navbar-logo:hover {
          transform: scale(1.05);
        }

        .logo-text {
          font-size: 26px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
          white-space: nowrap;
        }

        /* Skeleton Loading */
        .navbar-skeleton {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .skeleton-btn {
          height: 36px;
          width: 80px;
          border-radius: 10px;
          background: linear-gradient(90deg, #e8e4f7 0%, #ddd8f0 50%, #e8e4f7 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-btn.primary {
          width: 120px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* PRÉ-LOGIN */
        .navbar-auth {
          display: flex;
          align-items: center;
          gap: 40px;
        }

        .btn-login {
          text-decoration: none;
          color: #3c2e50;
          font-weight: 600;
          font-size: 15px;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-login:hover {
          background: rgba(169, 150, 221, 0.1);
          color: #7c65b5;
        }

        .btn-signup {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: #ffffff;
          padding: 10px 24px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 4px 15px rgba(124, 101, 181, 0.25);
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-signup::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #6952a0 0%, #8b72c4 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-signup:hover::before {
          opacity: 1;
        }

        .btn-signup:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(124, 101, 181, 0.4);
        }

        /* PÓS-LOGIN - CENTRO */
        .navbar-center {
          display: flex;
          align-items: center;
          gap: 200px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-link {
          text-decoration: none;
          color: #3c2e50;
          font-weight: 600;
          font-size: 15px;
          padding: 10px 20px;
          border-radius: 10px;
          transition: all 0.3s ease;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(169, 150, 221, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .nav-link:hover::before {
          left: 100%;
        }

        .nav-link:hover {
          background: rgba(169, 150, 221, 0.1);
          color: #7c65b5;
        }

        .nav-link.active {
          background: rgba(124, 101, 181, 0.15);
          color: #7c65b5;
          font-weight: 700;
        }

        /* PERFIL */
        .navbar-profile {
          position: relative;
          flex-shrink: 0;
        }

        .profile-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          border-radius: 50px;
        }

        .profile-button:hover {
          transform: scale(1.02);
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid transparent;
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-image: linear-gradient(white, white), linear-gradient(135deg, #7c65b5, #a996dd);
          transition: all 0.3s ease;
        }

        .avatar-placeholder {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          border: 2.5px solid transparent;
          transition: all 0.3s ease;
        }

        .profile-button:hover .avatar,
        .profile-button:hover .avatar-placeholder {
          box-shadow: 0 4px 16px rgba(124, 101, 181, 0.35);
          transform: scale(1.05);
        }

        .chevron {
          color: #6b5d7a;
          transition: transform 0.3s ease;
        }

        .chevron.open {
          transform: rotate(180deg);
          color: #7c65b5;
        }

        /* DROPDOWN */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 16px);
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
          min-width: 280px;
          overflow: hidden;
          animation: dropdownFade 0.3s ease;
          border: 1px solid rgba(124, 101, 181, 0.08);
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-header {
          padding: 20px;
          background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 100%);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dropdown-avatar {
          flex-shrink: 0;
        }

        .dropdown-avatar img,
        .dropdown-avatar-placeholder {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(124, 101, 181, 0.2);
        }

        .dropdown-avatar-placeholder {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }

        .dropdown-info {
          flex: 1;
          min-width: 0;
        }

        .dropdown-name {
          font-weight: 800;
          color: #2d1f3e;
          font-size: 16px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-email {
          font-size: 13px;
          color: #6b5d7a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-section {
          padding: 8px;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(124, 101, 181, 0.1);
          margin: 4px 12px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          color: #2d1f3e;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          border-radius: 10px;
          position: relative;
        }

        .dropdown-item svg {
          flex-shrink: 0;
          color: #7c65b5;
          transition: all 0.2s ease;
        }

        .dropdown-item span {
          flex: 1;
        }

        .dropdown-item:hover {
          background: rgba(124, 101, 181, 0.08);
          color: #7c65b5;
          transform: translateX(4px);
        }

        .dropdown-item:hover svg {
          color: #7c65b5;
          transform: scale(1.1);
        }

        .dropdown-item.incomplete {
          border: 2px solid rgba(245, 158, 11, 0.2);
          background: rgba(255, 251, 235, 0.5);
        }

        .dropdown-item.incomplete:hover {
          border-color: #f59e0b;
          background: rgba(255, 251, 235, 0.8);
        }

        .dropdown-item.incomplete svg {
          color: #f59e0b;
        }

        .incomplete-badge {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
          color: white;
          font-size: 12px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
          }
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-item.logout svg {
          color: #ef4444;
        }

        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #dc2626;
        }

        .dropdown-item.logout:hover svg {
          color: #dc2626;
        }

        @media (max-width: 900px) {
          .navbar-container {
            padding: 0 24px;
          }

          .navbar-center {
            position: static;
            transform: none;
            gap: 12px;
          }

          .nav-link {
            padding: 8px 14px;
            font-size: 14px;
          }
        }

        @media (max-width: 640px) {
          .navbar {
            height: 64px;
          }

          .navbar-container {
            padding: 0 16px;
          }

          .logo-text {
            font-size: 22px;
          }

          .btn-login,
          .btn-signup {
            padding: 8px 16px;
            font-size: 14px;
          }

          .navbar-center {
            display: none;
          }

          .avatar,
          .avatar-placeholder {
            width: 38px;
            height: 38px;
            font-size: 14px;
          }

          .chevron {
            width: 14px;
            height: 14px;
          }

          .dropdown-menu {
            right: -8px;
            min-width: 90vw;
            max-width: 300px;
          }

          .dropdown-header {
            padding: 16px;
          }

          .dropdown-avatar img,
          .dropdown-avatar-placeholder {
            width: 48px;
            height: 48px;
          }
        }

        @media (max-width: 400px) {
          .btn-login {
            display: none;
          }

          .logo-text {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  )
}