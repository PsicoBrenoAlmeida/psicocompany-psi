// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ToastClientProvider from '@/components/providers/ToastClientProvider'
import AuthErrorHandler from '@/components/auth/AuthErrorHandler'
import EmergencyReset from '@/components/auth/EmergencyReset'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300','400','500','600','700','800','900'],
})

export const metadata: Metadata = {
  title: {
    default: 'Psicocompany - Saúde Mental Acessível e Inteligente',
    template: '%s | Psicocompany'
  },
  description: 'Conectamos pessoas, psicólogos e ciência em um ecossistema completo de saúde mental. Terapia online baseada em TCC e neurociência.',
  metadataBase: new URL('https://psi.psicocompany.com.br'),
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Psicocompany - Saúde Mental Acessível e Inteligente',
    description: 'Conectamos pessoas, psicólogos e ciência em um ecossistema completo de saúde mental.',
    url: 'https://psi.psicocompany.com.br',
    siteName: 'Psicocompany',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: 'Psicocompany - Plataforma para Psicólogos'
      }
    ],
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    shortcut: '/icons/icon-192x192.png',
    apple: '/icons/icon-512x512.png'
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {/* Handler de erros de autenticação */}
        <AuthErrorHandler />
        
        {/* Botão de emergência (só aparece se travar) */}
        <EmergencyReset />
        
        {/* Toast Provider como Client Component */}
        <ToastClientProvider>
          <a href="#main-content" className="skip-to-content">Pular para o conteúdo principal</a>

          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main id="main-content" className="flex-1" style={{ paddingTop: '72px' }}>
              {children}
            </main>
            <Footer />
          </div>
        </ToastClientProvider>
      </body>
    </html>
  )
}