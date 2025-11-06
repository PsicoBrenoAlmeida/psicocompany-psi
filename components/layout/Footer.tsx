// components/layout/Footer.tsx
'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            
            {/* Logo e descrição */}
            <div className="footer-brand">
              <Link href="/" className="footer-logo">
                Psicocompany
              </Link>
              <p className="footer-description">
                Conectando você ao psicólogo ideal 💜
              </p>
            </div>

            {/* Redes Sociais */}
            <div className="footer-social">
              {/* Instagram */}
              <a 
                href="https://www.instagram.com/psicocompany.startup/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram" 
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a 
                href="https://www.youtube.com/@psicocompany.startup" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube" 
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.581 6.177a2.275 2.275 0 00-1.597-1.658c-1.262-.33-6.33-.33-6.33-.33s-5.068 0-6.33.33A2.275 2.275 0 002.42 6.177C2.09 7.439 2.09 12 2.09 12s0 4.561.33 5.823a2.275 2.275 0 001.597 1.658c1.262.33 6.33.33 6.33.33s5.068 0 6.33-.33a2.275 2.275 0 001.597-1.658c.33-1.262.33-5.823.33-5.823s0-4.561-.33-5.823zM10.373 15.11v-6.22l5.44 3.11-5.44 3.11z"/>
                </svg>
              </a>
              
              {/* WhatsApp */}
              <a 
                href="https://wa.me/5511955921135" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp" 
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>

            {/* Copyright */}
            <div className="footer-info">
              <p className="copyright">
                © {currentYear} Psicocompany - Todos os direitos reservados
              </p>
              <p className="cnpj">CNPJ: 49.201.374/0001-64</p>
            </div>

          </div>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          background: linear-gradient(180deg, #ffffff 0%, #faf9fc 100%);
          border-top: 1px solid rgba(124, 101, 181, 0.1);
          margin-top: 0;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 48px 24px;
        }

        .footer-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 32px;
          text-align: center;
        }

        /* Brand */
        .footer-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .footer-logo {
          font-size: 28px;
          font-weight: 900;
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .footer-logo:hover {
          transform: translateY(-2px);
        }

        .footer-description {
          color: #6b5d7a;
          font-size: 15px;
          margin: 0;
          font-weight: 500;
        }

        /* Social */
        .footer-social {
          display: flex;
          gap: 16px;
          justify-content: center;
          align-items: center;
        }

        .social-link {
          width: 44px;
          height: 44px;
          background: white;
          border: 2px solid rgba(124, 101, 181, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c65b5;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: linear-gradient(135deg, #7c65b5 0%, #a996dd 100%);
          color: white;
          border-color: transparent;
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(124, 101, 181, 0.3);
        }

        .social-link svg {
          width: 20px;
          height: 20px;
        }

        /* Info */
        .footer-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .copyright {
          color: #6b5d7a;
          font-size: 14px;
          margin: 0;
          font-weight: 500;
        }

        .cnpj {
          color: #9b8fab;
          font-size: 13px;
          margin: 0;
          font-weight: 400;
        }

        /* Responsivo */
        @media (max-width: 768px) {
          .footer-container {
            padding: 40px 20px;
          }

          .footer-content {
            gap: 28px;
          }

          .footer-logo {
            font-size: 24px;
          }

          .footer-description {
            font-size: 14px;
          }

          .social-link {
            width: 40px;
            height: 40px;
          }

          .social-link svg {
            width: 18px;
            height: 18px;
          }
        }

        @media (max-width: 480px) {
          .footer-container {
            padding: 32px 16px;
          }

          .footer-logo {
            font-size: 22px;
          }

          .footer-description {
            font-size: 13px;
          }

          .social-link {
            width: 38px;
            height: 38px;
          }

          .social-link svg {
            width: 17px;
            height: 17px;
          }

          .copyright {
            font-size: 13px;
          }

          .cnpj {
            font-size: 12px;
          }
        }
      `}</style>
    </>
  )
}