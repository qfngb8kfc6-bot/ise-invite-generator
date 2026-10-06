'use client'

import { useSiteLanguage } from '@/components/LanguageSwitcher'
import type { LanguageKey } from '@/lib/types'

type Option = {
  key: string
  label: string
}

type RequestInvitationFormProps = {
  themes: Option[]
  languages: Option[]
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/28 focus:border-blue-400 focus:bg-black/45'

const labelClass = 'mb-2 block text-sm font-semibold text-white/75'

const helperClass = 'mt-2 text-xs leading-5 text-white/38'

const requestFormCopy: Record<
  LanguageKey,
  {
    companyName: string
    companyPlaceholder: string
    companyHelp: string
    contactName: string
    contactPlaceholder: string
    contactEmail: string
    sectorImage: string
    sectorHelp: string
    invitationLanguage: string
    languageHelp: string
    beforeSubmitting: string
    beforeSubmittingHelp: string
    submit: string
    workflow: string
  }
> = {
  en: {
    companyName: 'Company name',
    companyPlaceholder: 'Company name as it should appear',
    companyHelp: '{text.companyHelp}',
    contactName: 'Contact name',
    contactPlaceholder: 'Your full name',
    contactEmail: 'Contact email',
    sectorImage: 'Sector image',
    sectorHelp:
      '{text.sectorHelp}',
    invitationLanguage: 'Invitation language',
    languageHelp:
      '{text.languageHelp}',
    beforeSubmitting: 'Before submitting',
    beforeSubmittingHelp:
      '{text.beforeSubmittingHelp}',
    submit: '{text.submit}',
    workflow:
      'By submitting this form, your details will be added to the ISE invitation request workflow',
  },

  es: {
    companyName: 'Nombre de la empresa',
    companyPlaceholder: 'Nombre de la empresa tal como debe aparecer',
    companyHelp:
      'Se utilizará en tu tarjeta de invitación y en los archivos descargables.',
    contactName: 'Nombre de contacto',
    contactPlaceholder: 'Tu nombre completo',
    contactEmail: 'Correo electrónico de contacto',
    sectorImage: 'Imagen de sector',
    sectorHelp:
      'Esto establece el estilo de fondo, que se puede cambiar en el siguiente paso.',
    invitationLanguage: 'Idioma de la invitación',
    languageHelp:
      'Esto establece el idioma inicial, que se puede cambiar en el siguiente paso.',
    beforeSubmitting: 'Antes de enviar',
    beforeSubmittingHelp:
      'Comprueba que los datos anteriores sean correctos. Se pueden realizar cambios en el siguiente paso.',
    submit: 'Enviar solicitud de invitación',
    workflow:
      'Al enviar este formulario, tus datos se añadirán al flujo de solicitudes de invitación de ISE',
  },

  de: {
    companyName: 'Firmenname',
    companyPlaceholder: 'Firmenname, wie er erscheinen soll',
    companyHelp:
      'Dies wird auf Ihrer Einladungskarte und in den Download-Dateien verwendet.',
    contactName: 'Kontaktname',
    contactPlaceholder: 'Ihr vollständiger Name',
    contactEmail: 'Kontakt-E-Mail',
    sectorImage: 'Branchenbild',
    sectorHelp:
      'Dies legt den Hintergrundstil fest, der im nächsten Schritt geändert werden kann.',
    invitationLanguage: 'Sprache der Einladung',
    languageHelp:
      'Dies legt die Ausgangssprache fest, die im nächsten Schritt geändert werden kann.',
    beforeSubmitting: 'Vor dem Absenden',
    beforeSubmittingHelp:
      'Bitte prüfen Sie, ob die obigen Angaben korrekt sind. Änderungen können im nächsten Schritt vorgenommen werden.',
    submit: 'Einladungsanfrage senden',
    workflow:
      'Mit dem Absenden dieses Formulars werden Ihre Daten dem ISE-Einladungsanfrageprozess hinzugefügt',
  },

  fr: {
    companyName: 'Nom de l’entreprise',
    companyPlaceholder: 'Nom de l’entreprise tel qu’il doit apparaître',
    companyHelp:
      'Il sera utilisé sur votre carte d’invitation et dans les fichiers téléchargés.',
    contactName: 'Nom du contact',
    contactPlaceholder: 'Votre nom complet',
    contactEmail: 'E-mail du contact',
    sectorImage: 'Image de secteur',
    sectorHelp:
      'Cela définit le style d’arrière-plan, qui peut être modifié à l’étape suivante.',
    invitationLanguage: 'Langue de l’invitation',
    languageHelp:
      'Cela définit la langue de départ, qui peut être modifiée à l’étape suivante.',
    beforeSubmitting: 'Avant l’envoi',
    beforeSubmittingHelp:
      'Vérifiez que les informations ci-dessus sont correctes. Elles pourront être modifiées à l’étape suivante.',
    submit: 'Envoyer la demande d’invitation',
    workflow:
      'En envoyant ce formulaire, vos informations seront ajoutées au processus de demande d’invitation ISE',
  },

  it: {
    companyName: 'Nome dell’azienda',
    companyPlaceholder: 'Nome dell’azienda come deve apparire',
    companyHelp:
      'Verrà utilizzato sulla carta d’invito e nei file scaricabili.',
    contactName: 'Nome del contatto',
    contactPlaceholder: 'Il tuo nome completo',
    contactEmail: 'Email di contatto',
    sectorImage: 'Immagine di settore',
    sectorHelp:
      'Questo imposta lo stile dello sfondo, che può essere modificato nel passaggio successivo.',
    invitationLanguage: 'Lingua dell’invito',
    languageHelp:
      'Questo imposta la lingua iniziale, che può essere modificata nel passaggio successivo.',
    beforeSubmitting: 'Prima dell’invio',
    beforeSubmittingHelp:
      'Controlla che i dati sopra indicati siano corretti. Le modifiche possono essere effettuate nel passaggio successivo.',
    submit: 'Invia richiesta di invito',
    workflow:
      'Inviando questo modulo, i tuoi dati verranno aggiunti al flusso di richiesta degli inviti ISE',
  },

  ca: {
    companyName: 'Nom de l’empresa',
    companyPlaceholder: 'Nom de l’empresa tal com ha d’aparèixer',
    companyHelp:
      'S’utilitzarà a la targeta d’invitació i als fitxers de descàrrega.',
    contactName: 'Nom de contacte',
    contactPlaceholder: 'El teu nom complet',
    contactEmail: 'Correu electrònic de contacte',
    sectorImage: 'Imatge de sector',
    sectorHelp:
      'Això estableix l’estil de fons, que es pot canviar al pas següent.',
    invitationLanguage: 'Idioma de la invitació',
    languageHelp:
      'Això estableix l’idioma inicial, que es pot canviar al pas següent.',
    beforeSubmitting: 'Abans d’enviar',
    beforeSubmittingHelp:
      'Comprova que les dades anteriors siguin correctes. Es poden fer canvis al pas següent.',
    submit: 'Envia la sol·licitud d’invitació',
    workflow:
      'En enviar aquest formulari, les teves dades s’afegiran al procés de sol·licitud d’invitacions d’ISE',
  },

  'zh-CN': {
    companyName: '公司名称',
    companyPlaceholder: '公司名称的显示方式',
    companyHelp: '此名称将用于您的邀请卡和下载文件。',
    contactName: '联系人姓名',
    contactPlaceholder: '您的全名',
    contactEmail: '联系邮箱',
    sectorImage: '行业图片',
    sectorHelp: '这将设置背景样式，可在下一步中更改。',
    invitationLanguage: '邀请函语言',
    languageHelp: '这将设置初始语言，可在下一步中更改。',
    beforeSubmitting: '提交前',
    beforeSubmittingHelp:
      '请检查以上信息是否正确。您可以在下一步中进行修改。',
    submit: '提交邀请申请',
    workflow:
      '提交此表单后，您的信息将被添加到 ISE 邀请申请流程中',
  },
}

export default function RequestInvitationForm({
  themes,
  languages,
}: RequestInvitationFormProps) {
  const [language] = useSiteLanguage()
  const text = requestFormCopy[language] ?? requestFormCopy.en

  return (
    <form
      action="/api/request-invitation"
      method="post"
      encType="multipart/form-data"
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>{text.companyName}</label>
          <input
            name="companyName"
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            placeholder={text.companyPlaceholder}
            autoComplete="organization"
          />
          <p className={helperClass}>
            This will be used on your invitation card and download assets.
          </p>
        </div>

        <div>
          <label className={labelClass}>{text.contactName}</label>
          <input
            name="contactName"
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            placeholder={text.contactPlaceholder}
            autoComplete="name"
          />
        </div>

        <div>
          <label className={labelClass}>{text.contactEmail}</label>
          <input
            name="contactEmail"
            type="email"
            required
            maxLength={160}
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{text.sectorImage}</label>
          <select
            name="theme"
            required
            defaultValue="audio"
            className={inputClass}
          >
            {themes.map((theme) => (
              <option key={theme.key} value={theme.key} className="text-black">
                {theme.label}
              </option>
            ))}
          </select>
          <p className={helperClass}>
            This sets out the background style, which can be changed in the next step.
          </p>
        </div>

        <div>
          <label className={labelClass}>{text.invitationLanguage}</label>
          <select
            name="language"
            required
            defaultValue="en"
            className="w-full rounded-2xl border border-blue-300/30 bg-[#0b1f4d] px-4 py-3 text-white outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-400/20"
          >
            {languages.map((language) => (
              <option
                key={language.key}
                value={language.key}
                className="bg-white text-slate-950"
              >
                {language.label}
              </option>
            ))}
          </select>
          <p className={helperClass}>
            This sets the starting language, which can be changed in the next step.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5">
        <p className="text-sm font-semibold text-white">{text.beforeSubmitting}</p>
        <p className="mt-1 text-sm leading-5 text-white/48">
          Please check that the details above are correct. Changes can be made in the next step.
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Submit invitation request
      </button>

      <p className="text-center text-xs leading-5 text-white/35">
        {text.workflow}
      </p>
    </form>
  )
}