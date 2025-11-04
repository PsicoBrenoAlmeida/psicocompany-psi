'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabaseClient'
import { User } from '@supabase/supabase-js'

export default function ConfiguracoesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  
  // Estados das configurações
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [sessionReminders, setSessionReminders] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('pt-BR')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      // Aqui você pode carregar as configurações salvas do usuário
      // Por enquanto, estou usando valores padrão
      
    } catch (error) {
      console.error('Erro:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    
    try {
      // Aqui você salvaria as configurações no banco de dados
      // Exemplo:
      // await supabase.from('user_settings').upsert({
      //   user_id: user?.id,
      //   email_notifications: emailNotifications,
      //   push_notifications: pushNotifications,
      //   ...
      // })
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simula salvamento
      alert('Configurações salvas com sucesso!')
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'EXCLUIR') {
      alert('Digite "EXCLUIR" para confirmar')
      return
    }

    try {
      // Aqui você implementaria a exclusão da conta
      // await supabase.rpc('delete_user_account', { user_id: user?.id })
      
      await supabase.auth.signOut()
      router.push('/')
      
    } catch (error) {
      console.error('Erro ao excluir conta:', error)
      alert('Erro ao excluir conta')
    }
  }

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Carregando configurações...</p>
        </div>

        <style jsx>{`
          .config-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #f4f2fa 0%, #ffffff 100%);
            padding: 100px 20px 40px;
          }

          .loading {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            padding: 60px 20px;
          }

          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid rgba(124, 101, 181, 0.1);
            border-top-color: #7c65b5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <>
      <div className="config-container">
        <div className="config-wrapper">
          
          {/* Header */}
          <div className="config-header">
            <h1>Configurações</h1>
            <p>Gerencie suas preferências e privacidade</p>
          </div>

          {/* Notificações */}
          <div className="config-section">
            <div className="section-header">
              <h2>🔔 Notificações</h2>
              <p>Escolha como deseja receber atualizações</p>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>Notificações por e-mail</h3>
                <p>Receba atualizações importantes no seu e-mail</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>Notificações push</h3>
                <p>Receba notificações no navegador ou app</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>Lembretes de sessões</h3>
                <p>Receba lembretes antes das suas consultas</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={sessionReminders}
                  onChange={(e) => setSessionReminders(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>E-mails promocionais</h3>
                <p>Receba novidades e ofertas da Psicocompany</p>
              </div>
              <label className="toggle">
                <input 
                  type="checkbox" 
                  checked={marketingEmails}
                  onChange={(e) => setMarketingEmails(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {/* Privacidade */}
          <div className="config-section">
            <div className="section-header">
              <h2>🔒 Privacidade</h2>
              <p>Controle quem pode ver suas informações</p>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>Visibilidade do perfil</h3>
                <p>Defina quem pode visualizar seu perfil</p>
              </div>
              <select 
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value)}
                className="select-input"
              >
                <option value="public">Público</option>
                <option value="private">Privado</option>
                <option value="connections">Apenas conexões</option>
              </select>
            </div>
          </div>

          {/* Aparência */}
          <div className="config-section">
            <div className="section-header">
              <h2>🎨 Aparência</h2>
              <p>Personalize a interface do sistema</p>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>Tema</h3>
                <p>Escolha entre tema claro ou escuro</p>
              </div>
              <select 
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="select-input"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div className="config-item">
              <div className="item-info">
                <h3>Idioma</h3>
                <p>Selecione o idioma da interface</p>
              </div>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="select-input"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          {/* Botão Salvar */}
          <button 
            className="btn-save"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>

          {/* Zona de Perigo */}
          <div className="danger-zone">
            <div className="section-header">
              <h2>⚠️ Zona de perigo</h2>
              <p>Ações irreversíveis</p>
            </div>

            <div className="danger-item">
              <div className="item-info">
                <h3>Excluir conta</h3>
                <p>Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.</p>
              </div>
              <button 
                className="btn-danger"
                onClick={() => setShowDeleteModal(true)}
              >
                Excluir conta
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>⚠️ Excluir conta</h2>
            <p>Tem certeza que deseja excluir sua conta? Esta ação é <strong>irreversível</strong>.</p>
            <p>Digite <strong>EXCLUIR</strong> para confirmar:</p>
            
            <input 
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="confirm-input"
            />

            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'EXCLUIR'}
              >
                Excluir permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .config-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f4f2fa 0%, #ffffff 100%);
          padding: 100px 20px 40px;
        }

        .config-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .config-header {
          margin-bottom: 40px;
        }

        .config-header h1 {
          font-size: 36px;
          font-weight: 900;
          color: #2d1f3e;
          margin-bottom: 8px;
        }

        .config-header p {
          font-size: 16px;
          color: #6b5d7a;
        }

        .config-section {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(124, 101, 181, 0.08);
        }

        .section-header {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(124, 101, 181, 0.1);
        }

        .section-header h2 {
          font-size: 20px;
          font-weight: 700;
          color: #2d1f3e;
          margin-bottom: 4px;
        }

        .section-header p {
          font-size: 14px;
          color: #6b5d7a;
        }

        .config-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          border-bottom: 1px solid rgba(124, 101, 181, 0.06);
        }

        .config-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .item-info {
          flex: 1;
          margin-right: 20px;
        }

        .item-info h3 {
          font-size: 16px;
          font-weight: 600;
          color: #2d1f3e;
          margin-bottom: 4px;
        }

        .item-info p {
          font-size: 14px;
          color: #6b5d7a;
        }

        /* Toggle Switch */
        .toggle {
          position: relative;
          display: inline-block;
          width: 56px;
          height: 30px;
          flex-shrink: 0;
        }

        .toggle input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ddd8f0;
          transition: 0.3s;
          border-radius: 30px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        /* Select Input */
        .select-input {
          padding: 10px 16px;
          border: 2px solid rgba(124, 101, 181, 0.2);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #2d1f3e;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
        }

        .select-input:hover {
          border-color: #7c65b5;
        }

        .select-input:focus {
          outline: none;
          border-color: #7c65b5;
          box-shadow: 0 0 0 3px rgba(124, 101, 181, 0.1);
        }

        /* Botão Salvar */
        .btn-save {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          font-size: 16px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(124, 101, 181, 0.25);
          margin-bottom: 24px;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(124, 101, 181, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Zona de Perigo */
        .danger-zone {
          background: #fff5f5;
          border: 2px solid #fee;
          border-radius: 16px;
          padding: 32px;
        }

        .danger-zone .section-header {
          border-bottom-color: rgba(239, 68, 68, 0.2);
        }

        .danger-zone .section-header h2 {
          color: #dc2626;
        }

        .danger-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .btn-danger {
          padding: 12px 24px;
          background: #dc2626;
          color: white;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-danger:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 480px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal h2 {
          font-size: 24px;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 16px;
        }

        .modal p {
          font-size: 15px;
          color: #4b5563;
          margin-bottom: 12px;
          line-height: 1.6;
        }

        .confirm-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 15px;
          margin: 16px 0 24px;
          transition: all 0.3s ease;
        }

        .confirm-input:focus {
          outline: none;
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .btn-cancel,
        .btn-confirm-delete {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        .btn-confirm-delete {
          background: #dc2626;
          color: white;
        }

        .btn-confirm-delete:hover:not(:disabled) {
          background: #b91c1c;
          transform: translateY(-2px);
        }

        .btn-confirm-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .config-container {
            padding: 80px 16px 40px;
          }

          .config-header h1 {
            font-size: 28px;
          }

          .config-section {
            padding: 24px 20px;
          }

          .config-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .item-info {
            margin-right: 0;
          }

          .select-input {
            width: 100%;
          }

          .danger-item {
            flex-direction: column;
            align-items: stretch;
          }

          .btn-danger {
            width: 100%;
          }

          .modal {
            padding: 24px;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  )
}