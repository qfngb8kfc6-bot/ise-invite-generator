export type LanguageKey = 'en' | 'es' | 'de' | 'fr' | 'it' | 'ca' | 'zh-CN'

export type ThemeKey =
  | 'iseBrandingOne'
  | 'iseBrandingTwo'
  | 'audio'
  | 'residential'
  | 'lighting'
  | 'unifiedCommunications'
  | 'educationTechnology'
  | 'digitalSignage'
  | 'smartBuilding'
  | 'contentProduction'

export type ThemeLabelMap = Partial<Record<ThemeKey, string>>

export type ThemeConfig = {
  label: string
  backgroundImage: string
}

export type InviteFormat = 'square' | 'linkedin' | 'email' | 'print'

export type EditableInviteData = {
  companyName: string
  standNumber: string
  invitationCode: string
  registrationUrl: string
  logoUrl: string
  theme: ThemeKey
  language: LanguageKey
}

export type TranslationBundle = {
  invite: {
    headline: string
    subheadline: string
    freeAccess: string
    visitUs: string
    visitUsPlural: string
    codeLabel: string
  }
  ui: {
    themeLabels?: ThemeLabelMap
    [key: string]: any
  }
}
