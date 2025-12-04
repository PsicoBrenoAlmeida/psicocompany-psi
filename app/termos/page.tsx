import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Termos e condições de uso da plataforma Psicocompany.',
}

export default function TermosPage() {
  return (
    <main className="prose prose-violet mx-auto max-w-3xl px-6 py-10">
      <h1>Termos de Uso</h1>
      <p>
        Bem-vindo à <strong>Psicocompany</strong>. Ao usar nossos serviços, você concorda com estes Termos de Uso.
        Recomendamos a leitura atenta antes de continuar.
      </p>

      <h2>1. Definições</h2>
      <p>
        “Plataforma” refere-se ao site e aplicativos da Psicocompany. “Usuário” é toda pessoa que acessa a Plataforma.
        “Profissional” é o psicólogo(a) devidamente inscrito no Conselho Regional de Psicologia (CRP) que utiliza a Plataforma.
      </p>

      <h2>2. Serviços da Plataforma</h2>
      <ul>
        <li>Agendamento e gestão de consultas (online e/ou presenciais);</li>
        <li>Gestão de pacientes, finanças e documentos;</li>
        <li>Funcionalidades de comunicação e prontuário eletrônico, quando aplicável.</li>
      </ul>

      <h2>3. Responsabilidades do Profissional</h2>
      <ul>
        <li>Manter cadastro atualizado e dados verídicos;</li>
        <li>Respeitar o Código de Ética Profissional do Psicólogo e normas do CFP/CRP;</li>
        <li>Garantir confidencialidade de informações de pacientes, nos termos da legislação aplicável;</li>
        <li>Utilizar a Plataforma de acordo com sua finalidade e leis vigentes.</li>
      </ul>

      <h2>4. Privacidade e Proteção de Dados</h2>
      <p>
        Tratamos dados pessoais conforme nossa <a href="/privacidade">Política de Privacidade</a> e a LGPD (Lei 13.709/2018).
        O Profissional deve observar boas práticas de segurança e confidencialidade.
      </p>

      <h2>5. Pagamentos e Planos</h2>
      <p>
        Quando existentes, as condições de planos, repasses e taxas serão apresentadas no momento da contratação.
        A inadimplência pode resultar na suspensão do acesso aos serviços premium.
      </p>

      <h2>6. Limitação de Responsabilidade</h2>
      <p>
        A Psicocompany envida esforços para manter a Plataforma disponível e segura, porém não garante operação ininterrupta
        ou livre de erros. Em nenhuma hipótese a Plataforma será responsável por decisões clínicas do Profissional.
      </p>

      <h2>7. Propriedade Intelectual</h2>
      <p>
        Marcas, logos, conteúdos e software da Plataforma pertencem à Psicocompany e são protegidos por lei. É vedado
        copiar, modificar ou distribuir sem autorização.
      </p>

      <h2>8. Alterações dos Termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer tempo. A versão vigente estará disponível nesta página com data de atualização.
      </p>

      <h2>9. Contato</h2>
      <p>
        Dúvidas? Fale com <a href="mailto:contato@psicocompany.com.br">contato@psicocompany.com.br</a>.
      </p>

      <p className="text-sm text-gray-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
    </main>
  )
}
