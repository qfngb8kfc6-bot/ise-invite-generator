import type { LanguageKey, TranslationSet } from '@/lib/types'

export const translations: Record<LanguageKey, TranslationSet> = {
  en: {
    headline: "You're invited to ISE 2026",
    subheadline: 'Join us in Barcelona',
    freeAccess: 'Free access with invitation code',
    visitUs: 'Visit us at stand',
    codeLabel: 'Code:',
  },
  es: {
    headline: 'Estás invitado a ISE 2026',
    subheadline: 'Únase a nosotros en Barcelona',
    freeAccess: 'Acceso gratuito con código de invitación',
    visitUs: 'Visítanos en el stand',
    codeLabel: 'Código:',
  },
  de: {
    headline: 'Sie sind zur ISE 2026 eingeladen',
    subheadline: 'Treffen Sie us in Barcelona',
    freeAccess: 'Kostenfreier Zutritt mit Einladungscode',
    visitUs: 'Besuchen Sie uns am Stand',
    codeLabel: 'Code:',
  },
}