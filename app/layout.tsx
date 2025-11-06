// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'Psicocompany - Saúde Mental Acessível e Inteligente',
    template: '%s | Psicocompany'
  },
  description: 'Conectamos pessoas, psicólogos e ciência em um ecossistema completo de saúde mental. Terapia online baseada em TCC e neurociência.',
  keywords: [
    'psicologia',
    'terapia online',
    'saúde mental',
    'TCC',
    'neurociência',
    'ansiedade',
    'depressão',
    'psicólogo online',
    'terapia cognitivo comportamental',
    'bem-estar emocional'
  ],
  authors: [{ name: 'Psicocompany', url: 'https://psi.psicocompany.com.br' }],
  creator: 'Psicocompany',
  publisher: 'Psicocompany',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://psi.psicocompany.com.br'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Psicocompany - Saúde Mental Acessível e Inteligente',
    description: 'Conectamos pessoas, psicólogos e ciência em um ecossistema completo de saúde mental.',
    url: 'https://psi.psicocompany.com.br',
    siteName: 'Psicocompany',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Psicocompany - Saúde Mental'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Psicocompany - Saúde Mental Acessível',
    description: 'Conectamos pessoas, psicólogos e ciência em um ecossistema completo de saúde mental.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c65b5' },
    { media: '(prefers-color-scheme: dark)', color: '#a996dd' }
  ],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-to-content">
          Pular para o conteúdo principal
        </a>
        
        <div className="min-h-screen flex flex-col">
          <Navbar /> 
          
          <main 
            id="main-content" 
            className="flex-1" 
            style={{ paddingTop: '72px' }} 
          >
            {children}
          </main>
          
          <Footer />
        </div>

        {/* Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Psicocompany',
              url: 'https://psi.psicocompany.com.br',
              logo: 'https://psi.psicocompany.com.br/logo.png',
              description: 'Plataforma de saúde mental conectando pessoas e psicólogos através de tecnologia e ciência',
              sameAs: [
                'https://www.instagram.com/psicocompany.startup/',
                'https://www.youtube.com/@psicocompany.startup'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contato@psicocompany.com.br',
                contactType: 'Customer Service',
                availableLanguage: 'Portuguese'
              }
            })
          }}
        />
      </body>
    </html>
  )
}