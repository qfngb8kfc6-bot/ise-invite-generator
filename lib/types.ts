export type ThemeKey = 'audio' | 'residential' | 'lighting'

export type LanguageKey = 'en' | 'es' | 'de'

export type ThemeConfig = {
  label: string
  backgroundImage: string
}

export type TranslationSet = {
  headline: string
  subheadline: string
  freeAccess: string
  visitUs: string
  codeLabel: string
}

export type EditableInviteData = {
  companyName: string
  standNumber: string
  invitationCode: string
  logoUrl: string
  registrationUrl: string
  theme: ThemeKey
  language: LanguageKey
}