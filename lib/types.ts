export type ThemeKey = 'audio' | 'residential' | 'lighting'

export type LanguageKey =
  | 'en'
  | 'es'
  | 'de'
  | 'fr'
  | 'it'
  | 'pt'
  | 'nl'
  | 'zh-CN'

export type ThemeConfig = {
  label: string
  backgroundImage: string
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

export type InviteTranslationSet = {
  headline: string
  subheadline: string
  freeAccess: string
  visitUs: string
  visitUsPlural?: string
  codeLabel: string
}

export type UiTranslationSet = {
  languageName: string
  homeTitle: string
  homeDescription: string
  homeOpenTools: string
  homeOpenGenerator: string
  homeJwtTitle: string
  homeJwtDescription: string
  homeMockEboTitle: string
  homeMockEboDescription: string
  homeExportsTitle: string
  homeExportsDescription: string

  toolsTitle: string
  toolsDescription: string
  toolsExhibitorId: string
  toolsGenerating: string
  toolsGenerateLink: string
  toolsErrorTitle: string
  toolsGeneratedTitle: string
  toolsTokenLength: string
  toolsGeneratorUrl: string
  toolsOpenGenerator: string
  toolsCopyLink: string
  toolsQuickIds: string
  toolsMissingId: string
  toolsFailed: string

  generatorTitle: string
  generatorVerifiedPrefix: string
  generatorStand: string
  generatorReset: string
  generatorPngLinkedIn: string
  generatorPngSquare: string
  generatorPngEmail: string
  generatorPngPrint: string
  generatorPdf: string
  generatorZipPack: string
  generatorInputsTitle: string
  generatorInputsDescription: string
  generatorCompanyName: string
  generatorStandNumber: string
  generatorInvitationCode: string
  generatorRegistrationUrl: string
  generatorLogoUpload: string
  generatorTheme: string
  generatorLanguage: string
  generatorSelectedFile: string
  generatorVerifiedSourceData: string
  generatorPreviewTitle: string
  generatorPreviewDescription: string

  commonLoadingSession: string
  commonSessionError: string
  commonMissingTokenInUrl: string
  commonNoExhibitorLoaded: string
}

export type TranslationBundle = {
  invite: InviteTranslationSet
  ui: UiTranslationSet
}