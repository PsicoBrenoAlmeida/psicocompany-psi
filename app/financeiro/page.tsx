'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabaseClient'
import { User } from '@supabase/supabase-js'

interface Payment {
  id: string
  appointment_id: string | null
  amount: number
  commission: number
  net_amount: number
  payment_type: 'session' | 'subscription'
  status: string
  payment_method?: string
  description?: string
  paid_at: string | null
  created_at: string
  appointment?: {
    appointment_date: string
    appointment_time: string
    patient?: {
      full_name: string
    }
  }
}

interface FinancialSummary {
  totalEarnings: number
  availableBalance: number
  paidSessions: number
  totalCommission: number
  monthlyFee: number
  pendingPayments: number
}

interface MonthlyData {
  month: string
  earnings: number
  commission: number
  sessions: number
}

export default function FinanceiroPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<FinancialSummary>({
    totalEarnings: 0,
    availableBalance: 0,
    paidSessions: 0,
    totalCommission: 0,
    monthlyFee: 0,
    pendingPayments: 0
  })
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [planType, setPlanType] = useState<'basic' | 'premium'>('basic')
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [psychologistId, setPsychologistId] = useState<string | null>(null)

  useEffect(() => {
    checkUserAndLoad()
  }, [])

  useEffect(() => {
    if (psychologistId) {
      loadFinancialData()
    }
  }, [psychologistId, filterPeriod])

  const checkUserAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Buscar dados do psicólogo
      const { data: psychData } = await supabase
        .from('psychologists')
        .select('id, plan_type')
        .eq('user_id', user.id)
        .maybeSingle()

      if (psychData) {
        setPsychologistId(psychData.id)
        setPlanType(psychData.plan_type || 'basic')
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      router.push('/login')
    }
  }

  const loadFinancialData = async () => {
    try {
      setLoading(true)

      // Calcular período baseado no filtro
      const now = new Date()
      const startDate = new Date()
      
      if (filterPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1)
      } else if (filterPeriod === 'quarter') {
        startDate.setMonth(now.getMonth() - 3)
      } else {
        startDate.setFullYear(now.getFullYear() - 1)
      }

      // Buscar pagamentos
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          id,
          appointment_id,
          amount,
          commission,
          net_amount,
          payment_type,
          status,
          payment_method,
          description,
          paid_at,
          created_at
        `)
        .eq('psychologist_id', psychologistId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.error('Erro ao buscar pagamentos:', paymentsError)
        return
      }

      // Enriquecer pagamentos com dados de appointments
      if (paymentsData) {
        const enrichedPayments = await Promise.all(
          paymentsData.map(async (payment) => {
            if (payment.appointment_id) {
              const { data: appointmentData } = await supabase
                .from('appointments')
                .select(`
                  appointment_date,
                  appointment_time,
                  patient_id
                `)
                .eq('id', payment.appointment_id)
                .maybeSingle()

              if (appointmentData) {
                const { data: patientData } = await supabase
                  .from('patients')
                  .select('user_id')
                  .eq('id', appointmentData.patient_id)
                  .maybeSingle()

                if (patientData) {
                  const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('user_id', patientData.user_id)
                    .maybeSingle()

                  return {
                    ...payment,
                    appointment: {
                      appointment_date: appointmentData.appointment_date,
                      appointment_time: appointmentData.appointment_time,
                      patient: {
                        full_name: profileData?.full_name || 'Paciente'
                      }
                    }
                  }
                }
              }
            }
            return payment
          })
        )

        setPayments(enrichedPayments)
        calculateSummary(enrichedPayments)
        calculateMonthlyData(enrichedPayments)
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSummary = (paymentsData: Payment[]) => {
    const paidPayments = paymentsData.filter(p => p.status === 'paid')
    const pendingPayments = paymentsData.filter(p => p.status === 'pending' || p.status === 'processing')

    const totalEarnings = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0)
    const availableBalance = paidPayments.reduce((sum, p) => sum + Number(p.net_amount), 0)
    const totalCommission = paidPayments.reduce((sum, p) => sum + Number(p.commission), 0)
    const paidSessions = paidPayments.filter(p => p.payment_type === 'session').length
    
    // Calcular mensalidade do plano premium (se aplicável)
    const monthlyFee = planType === 'premium' ? 300 : 0

    setSummary({
      totalEarnings,
      availableBalance,
      paidSessions,
      totalCommission,
      monthlyFee,
      pendingPayments: pendingPayments.length
    })
  }

  const calculateMonthlyData = (paymentsData: Payment[]) => {
    const monthsMap = new Map<string, MonthlyData>()

    paymentsData
      .filter(p => p.status === 'paid' && p.paid_at)
      .forEach(payment => {
        const date = new Date(payment.paid_at!)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthsMap.has(monthKey)) {
          monthsMap.set(monthKey, {
            month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            earnings: 0,
            commission: 0,
            sessions: 0
          })
        }

        const monthData = monthsMap.get(monthKey)!
        monthData.earnings += Number(payment.net_amount)
        monthData.commission += Number(payment.commission)
        if (payment.payment_type === 'session') {
          monthData.sessions += 1
        }
      })

    const sortedData = Array.from(monthsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, data]) => data)

    setMonthlyData(sortedData)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: { text: 'Pago', class: 'status-paid' },
      pending: { text: 'Pendente', class: 'status-pending' },
      processing: { text: 'Processando', class: 'status-processing' },
      failed: { text: 'Falhou', class: 'status-failed' },
      refunded: { text: 'Reembolsado', class: 'status-refunded' },
      cancelled: { text: 'Cancelado', class: 'status-cancelled' }
    }
    return badges[status as keyof typeof badges] || { text: status, class: '' }
  }

  const getPaymentTypeLabel = (type: string) => {
    return type === 'session' ? 'Sessão' : 'Mensalidade'
  }

  if (loading) {
    return (
      <>
        <main className="financeiro-page">
          <div className="financeiro-container">
            <div className="loading">
              <div className="spinner"></div>
              <p>Carregando dados financeiros...</p>
            </div>
          </div>
        </main>
        <style jsx>{styles}</style>
      </>
    )
  }

  return (
    <>
      <main className="financeiro-page">
        <div className="bg-decoration bg-decoration-1"></div>
        <div className="bg-decoration bg-decoration-2"></div>

        <div className="financeiro-container">
          
          {/* Header */}
          <div className="page-header">
            <div>
              <h1>💰 Financeiro</h1>
              <p>Acompanhe seus ganhos e pagamentos</p>
            </div>
            <div className="header-actions">
              <select 
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as 'month' | 'quarter' | 'year')}
                className="period-select"
              >
                <option value="month">Último mês</option>
                <option value="quarter">Últimos 3 meses</option>
                <option value="year">Último ano</option>
              </select>
            </div>
          </div>

          {/* Info do Plano */}
          <div className="plan-info-card">
            <div className="plan-badge">
              {planType === 'premium' ? '💎 Plano Premium' : '⭐ Plano Essencial'}
            </div>
            <div className="plan-details">
              {planType === 'premium' ? (
                <p>
                  <strong>Mensalidade:</strong> R$ 300/mês • <strong>Comissão:</strong> 0%
                </p>
              ) : (
                <p>
                  <strong>Comissão por sessão:</strong> 20% • <strong>Mensalidade:</strong> R$ 0
                </p>
              )}
            </div>
            <Link href="/alterar-cadastro" className="btn-change-plan">
              Ver planos
            </Link>
          </div>

          {/* Cards de Resumo */}
          <div className="summary-grid">
            <div className="summary-card earnings">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="card-content">
                <p className="card-label">Saldo disponível</p>
                <h2 className="card-value">{formatCurrency(summary.availableBalance)}</h2>
                <span className="card-detail">{summary.paidSessions} sessões pagas</span>
              </div>
            </div>

            <div className="summary-card sessions">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="card-content">
                <p className="card-label">Ganhos brutos</p>
                <h2 className="card-value">{formatCurrency(summary.totalEarnings)}</h2>
                <span className="card-detail">Total faturado</span>
              </div>
            </div>

            <div className="summary-card commission">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                  <path d="M12 18V6"></path>
                </svg>
              </div>
              <div className="card-content">
                <p className="card-label">{planType === 'premium' ? 'Mensalidade' : 'Comissão paga'}</p>
                <h2 className="card-value">{formatCurrency(planType === 'premium' ? summary.monthlyFee : summary.totalCommission)}</h2>
                <span className="card-detail">
                  {planType === 'premium' ? 'Plano Premium' : `${((summary.totalCommission / summary.totalEarnings) * 100 || 0).toFixed(1)}% do total`}
                </span>
              </div>
            </div>

            <div className="summary-card pending">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="card-content">
                <p className="card-label">Pagamentos pendentes</p>
                <h2 className="card-value">{summary.pendingPayments}</h2>
                <span className="card-detail">Aguardando confirmação</span>
              </div>
            </div>
          </div>

          {/* Gráfico Mensal */}
          {monthlyData.length > 0 && (
            <div className="chart-section">
              <div className="section-header">
                <h2>📊 Evolução de Ganhos</h2>
                <p>Seus ganhos ao longo do tempo</p>
              </div>

              <div className="chart-container">
                {monthlyData.map((data, idx) => (
                  <div key={idx} className="chart-bar-group">
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar"
                        style={{ 
                          height: `${Math.min((data.earnings / Math.max(...monthlyData.map(m => m.earnings))) * 200, 200)}px` 
                        }}
                        title={formatCurrency(data.earnings)}
                      >
                        <span className="bar-value">{formatCurrency(data.earnings)}</span>
                      </div>
                    </div>
                    <div className="chart-label">
                      <div className="month-label">{data.month}</div>
                      <div className="sessions-count">{data.sessions} sessões</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabela de Transações */}
          <div className="transactions-section">
            <div className="section-header">
              <div>
                <h2>💳 Histórico de Transações</h2>
                <p>Todas as suas movimentações financeiras</p>
              </div>
            </div>

            {payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💸</div>
                <h3>Nenhuma transação encontrada</h3>
                <p>Suas transações aparecerão aqui quando houver pagamentos</p>
              </div>
            ) : (
              <div className="transactions-table">
                <div className="table-header">
                  <div className="col-date">Data</div>
                  <div className="col-description">Descrição</div>
                  <div className="col-type">Tipo</div>
                  <div className="col-amount">Valor Bruto</div>
                  <div className="col-commission">Comissão</div>
                  <div className="col-net">Valor Líquido</div>
                  <div className="col-status">Status</div>
                </div>

                <div className="table-body">
                  {payments.map(payment => (
                    <div key={payment.id} className="table-row">
                      <div className="col-date">
                        <div className="date-main">
                          {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                        </div>
                        <div className="date-time">
                          {payment.paid_at ? formatDateTime(payment.paid_at).split(',')[1] : '-'}
                        </div>
                      </div>

                      <div className="col-description">
                        {payment.appointment ? (
                          <>
                            <div className="desc-main">{payment.appointment.patient?.full_name}</div>
                            <div className="desc-detail">
                              Sessão em {formatDate(payment.appointment.appointment_date)} às {payment.appointment.appointment_time.slice(0, 5)}
                            </div>
                          </>
                        ) : (
                          <div className="desc-main">{payment.description || 'Pagamento'}</div>
                        )}
                      </div>

                      <div className="col-type">
                        <span className="type-badge">
                          {getPaymentTypeLabel(payment.payment_type)}
                        </span>
                      </div>

                      <div className="col-amount">
                        {formatCurrency(Number(payment.amount))}
                      </div>

                      <div className="col-commission">
                        <span className="commission-value">
                          {Number(payment.commission) > 0 ? `-${formatCurrency(Number(payment.commission))}` : '-'}
                        </span>
                      </div>

                      <div className="col-net">
                        <strong>{formatCurrency(Number(payment.net_amount))}</strong>
                      </div>

                      <div className="col-status">
                        <span className={`status-badge ${getStatusBadge(payment.status).class}`}>
                          {getStatusBadge(payment.status).text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botão de Solicitar Saque */}
          {summary.availableBalance > 0 && (
            <div className="withdraw-section">
              <div className="withdraw-card">
                <div className="withdraw-info">
                  <h3>💰 Saldo disponível para saque</h3>
                  <p className="withdraw-amount">{formatCurrency(summary.availableBalance)}</p>
                  <p className="withdraw-detail">O saque será processado em até 2 dias úteis</p>
                </div>
                <button className="btn-withdraw">
                  Solicitar saque
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{styles}</style>
    </>
  )
}

const styles = `
  .financeiro-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #f4f2fa 0%, #e8e4f7 100%);
    padding: 100px 24px 60px;
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

  .financeiro-container {
    max-width: 1400px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* Header */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    flex-wrap: wrap;
    gap: 20px;
  }

  .page-header h1 {
    font-size: 36px;
    font-weight: 900;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .page-header p {
    color: #6b5d7a;
    font-size: 16px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .period-select {
    padding: 10px 16px;
    border-radius: 10px;
    border: 2px solid rgba(124, 101, 181, 0.2);
    background: white;
    color: #2d1f3e;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .period-select:hover {
    border-color: #7c65b5;
  }

  .period-select:focus {
    outline: none;
    border-color: #7c65b5;
    box-shadow: 0 0 0 3px rgba(124, 101, 181, 0.1);
  }

  /* Plan Info Card */
  .plan-info-card {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.3);
    color: white;
    flex-wrap: wrap;
    gap: 20px;
  }

  .plan-badge {
    font-size: 20px;
    font-weight: 800;
  }

  .plan-details {
    flex: 1;
  }

  .plan-details p {
    font-size: 15px;
    opacity: 0.95;
  }

  .btn-change-plan {
    padding: 10px 20px;
    border-radius: 10px;
    background: white;
    color: #7c65b5;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .btn-change-plan:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  }

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }

  .summary-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    align-items: flex-start;
    gap: 20px;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.08);
    border: 1px solid rgba(124, 101, 181, 0.08);
    transition: all 0.3s ease;
  }

  .summary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 28px rgba(124, 101, 181, 0.15);
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .summary-card.earnings .card-icon {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }

  .summary-card.sessions .card-icon {
    background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
  }

  .summary-card.commission .card-icon {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }

  .summary-card.pending .card-icon {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  }

  .card-content {
    flex: 1;
  }

  .card-label {
    font-size: 13px;
    color: #6b5d7a;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .card-value {
    font-size: 28px;
    font-weight: 900;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .card-detail {
    font-size: 13px;
    color: #9b8fab;
  }

  /* Chart Section */
  .chart-section {
    background: white;
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.08);
    border: 1px solid rgba(124, 101, 181, 0.08);
  }

  .section-header {
    margin-bottom: 32px;
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

  .chart-container {
    display: flex;
    align-items: flex-end;
    gap: 24px;
    min-height: 250px;
    padding: 20px 0;
    overflow-x: auto;
  }

  .chart-bar-group {
    flex: 1;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chart-bar-wrapper {
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    height: 200px;
    position: relative;
  }

  .chart-bar {
    width: 60px;
    background: linear-gradient(180deg, #7c65b5 0%, #a996dd 100%);
    border-radius: 8px 8px 0 0;
    transition: all 0.5s ease;
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 8px;
    box-shadow: 0 -4px 16px rgba(124, 101, 181, 0.2);
  }

  .chart-bar:hover {
    filter: brightness(1.1);
    transform: scaleY(1.05);
  }

  .bar-value {
    font-size: 11px;
    font-weight: 700;
    color: white;
    white-space: nowrap;
  }

  .chart-label {
    margin-top: 12px;
    text-align: center;
  }

  .month-label {
    font-size: 13px;
    font-weight: 700;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .sessions-count {
    font-size: 11px;
    color: #9b8fab;
  }

  /* Transactions Section */
  .transactions-section {
    background: white;
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(124, 101, 181, 0.08);
    border: 1px solid rgba(124, 101, 181, 0.08);
  }

  .transactions-table {
    overflow-x: auto;
  }

  .table-header,
  .table-row {
    display: grid;
    grid-template-columns: 140px 1fr 100px 120px 120px 120px 120px;
    gap: 16px;
    padding: 16px;
    align-items: center;
  }

  .table-header {
    background: rgba(124, 101, 181, 0.05);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #6b5d7a;
    margin-bottom: 8px;
  }

  .table-row {
    border-bottom: 1px solid rgba(124, 101, 181, 0.08);
    transition: all 0.2s ease;
  }

  .table-row:hover {
    background: rgba(124, 101, 181, 0.03);
    transform: translateX(4px);
  }

  .table-row:last-child {
    border-bottom: none;
  }

  .date-main {
    font-size: 14px;
    font-weight: 600;
    color: #2d1f3e;
  }

  .date-time {
    font-size: 12px;
    color: #9b8fab;
  }

  .desc-main {
    font-size: 15px;
    font-weight: 600;
    color: #2d1f3e;
    margin-bottom: 4px;
  }

  .desc-detail {
    font-size: 12px;
    color: #9b8fab;
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(124, 101, 181, 0.1);
    color: #7c65b5;
  }

  .col-amount,
  .col-net {
    font-weight: 600;
    color: #2d1f3e;
  }

  .commission-value {
    color: #ef4444;
    font-weight: 600;
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .status-badge.status-paid {
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
  }

  .status-badge.status-pending {
    background: rgba(251, 191, 36, 0.1);
    color: #f59e0b;
  }

  .status-badge.status-processing {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }

  .status-badge.status-failed,
  .status-badge.status-cancelled {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }

  .status-badge.status-refunded {
    background: rgba(124, 101, 181, 0.1);
    color: #7c65b5;
  }

  /* Withdraw Section */
  .withdraw-section {
    margin-top: 32px;
  }

  .withdraw-card {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border-radius: 16px;
    padding: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
    color: white;
    flex-wrap: wrap;
    gap: 24px;
  }

  .withdraw-info h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .withdraw-amount {
    font-size: 36px;
    font-weight: 900;
    margin-bottom: 8px;
  }

  .withdraw-detail {
    font-size: 14px;
    opacity: 0.9;
  }

  .btn-withdraw {
    padding: 14px 32px;
    border-radius: 12px;
    background: white;
    color: #16a34a;
    font-weight: 700;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn-withdraw:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
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
  @media (max-width: 1200px) {
    .table-header,
    .table-row {
      grid-template-columns: 120px 1fr 90px 100px 100px 100px 100px;
      gap: 12px;
    }
  }

  @media (max-width: 968px) {
    .financeiro-page {
      padding: 90px 16px 40px;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .chart-container {
      gap: 16px;
    }

    .transactions-table {
      overflow-x: scroll;
    }

    .table-header,
    .table-row {
      min-width: 900px;
    }

    .withdraw-card {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .btn-withdraw {
      width: 100%;
    }
  }
`