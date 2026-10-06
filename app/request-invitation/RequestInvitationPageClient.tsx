'use client'

import { useSiteLanguage } from '@/components/LanguageSwitcher'
import type { LanguageKey } from '@/lib/types'
import RequestInvitationForm from './RequestInvitationForm'

type Option = {
  key: string
  label: string
}

type Props = {
  themes: Option[]
  languages: Option[]
}

const copy: Record<
  LanguageKey,
  {
    badge: string
    title: string
    description: string
    formLabel: string
    formTitle: string
    formDescription: string
  }
> = {
  en: {
    badge: 'ISE 2027 Invitation Cards',
    title: 'Request your invitation cards',
    description:
      'Submit your company details, preferred sector image and preferred language.',
    formLabel: 'Request form',
    formTitle: 'Submit company details',
    formDescription:
      'Use your unique invitation code to invite as many colleagues and guests as you like to register for ISE 2027 for free, at no cost to you. Build your personalised invites below.',
  },

  es: {
    badge: 'Tarjetas de invitación ISE 2027',
    title: 'Solicita tus tarjetas de invitación',
    description:
      'Envía los datos de tu empresa, la imagen de sector preferida y el idioma preferido.',
    formLabel: 'Formulario de solicitud',
    formTitle: 'Enviar datos de la empresa',
    formDescription:
      'Utiliza los datos de la empresa exactamente como deseas que aparezcan. El tema y el idioma se pueden cambiar en el siguiente paso.',
  },

  de: {
    badge: 'ISE 2027 Einladungskarten',
    title: 'Fordern Sie Ihre Einladungskarten an',
    description:
      'Übermitteln Sie Ihre Firmendaten, das gewünschte Branchenbild und die gewünschte Sprache.',
    formLabel: 'Anfrageformular',
    formTitle: 'Firmendaten übermitteln',
    formDescription:
      'Bitte geben Sie die Firmendaten genau so ein, wie sie erscheinen sollen. Thema und Sprache können im nächsten Schritt geändert werden.',
  },

  fr: {
    badge: 'Cartes d’invitation ISE 2027',
    title: 'Demandez vos cartes d’invitation',
    description:
      'Envoyez les informations de votre entreprise, l’image de secteur souhaitée et la langue souhaitée.',
    formLabel: 'Formulaire de demande',
    formTitle: 'Envoyer les informations de l’entreprise',
    formDescription:
      'Utilisez les informations de l’entreprise exactement comme vous souhaitez les voir apparaître. Le thème et la langue pourront être modifiés à l’étape suivante.',
  },

  it: {
    badge: 'Carte d’invito ISE 2027',
    title: 'Richiedi le tue carte d’invito',
    description:
      'Invia i dati della tua azienda, l’immagine di settore preferita e la lingua preferita.',
    formLabel: 'Modulo di richiesta',
    formTitle: 'Invia i dati dell’azienda',
    formDescription:
      'Inserisci i dati dell’azienda esattamente come desideri che appaiano. Il tema e la lingua possono essere modificati nel passaggio successivo.',
  },

  ca: {
    badge: 'Targetes d’invitació ISE 2027',
    title: 'Sol·licita les teves targetes d’invitació',
    description:
      'Envia les dades de la teva empresa, la imatge de sector preferida i l’idioma preferit.',
    formLabel: 'Formulari de sol·licitud',
    formTitle: 'Envia les dades de l’empresa',
    formDescription:
      'Utilitza les dades de l’empresa exactament com vols que apareguin. El tema i l’idioma es poden canviar al pas següent.',
  },

  'zh-CN': {
    badge: 'ISE 2027 邀请卡',
    title: '申请您的邀请卡',
    description:
      '提交您的公司信息、首选行业图片和首选语言。',
    formLabel: '申请表',
    formTitle: '提交公司信息',
    formDescription:
      '请按照您希望显示的方式填写公司信息。主题和语言可以在下一步中更改。',
  },
}

export default function RequestInvitationPageClient({
  themes,
  languages,
}: Props) {
  const [language] = useSiteLanguage()
  const text = copy[language] ?? copy.en

  return (
    <main className="min-h-screen overflow-hidden bg-transparent text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-160px] top-[-160px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl items-start px-4 pt-2 pb-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-4">

          <section className="rounded-[30px] border border-white/10 bg-white/[0.06] p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
            <div className="mb-4 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[30px]">
                {text.title}
              </h1>

              <p className="mt-2 max-w-4xl text-sm leading-5 text-white">
                {text.formDescription}
              </p>
            </div>

            <RequestInvitationForm
              themes={themes}
              languages={languages}
            />
          </section>

        </div>
      </div>
    </main>
  )
}
