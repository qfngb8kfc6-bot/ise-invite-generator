export type ThemeName = 'audio' | 'residential' | 'lighting'
export type LanguageCode = 'en' | 'es' | 'de'

export type Exhibitor = {
  id: string
  companyName: string
  standNumber: string
  invitationCode: string
  registrationUrl: string
  logoUrl: string | null
  theme: ThemeName
  language: LanguageCode
}

const exhibitors: Record<string, Exhibitor> = {
  '1001': {
    id: '1001',
    companyName: 'Acme Audio Ltd',
    standNumber: 'A12',
    invitationCode: 'ACME-A12-2026',
    registrationUrl: 'https://example.com/register/ACME-A12-2026',
    logoUrl: null,
    theme: 'audio',
    language: 'en',
  },
  '1002': {
    id: '1002',
    companyName: 'Luma Living',
    standNumber: 'R08',
    invitationCode: 'LUMA-R08-2026',
    registrationUrl: 'https://example.com/register/LUMA-R08-2026',
    logoUrl: null,
    theme: 'residential',
    language: 'de',
  },
  '1003': {
    id: '1003',
    companyName: 'Northlight Systems',
    standNumber: 'L21',
    invitationCode: 'NORTH-L21-2026',
    registrationUrl: 'https://example.com/register/NORTH-L21-2026',
    logoUrl: null,
    theme: 'lighting',
    language: 'es',
  },
}

export function getExhibitorById(id: string): Exhibitor | null {
  return exhibitors[id] ?? null
}

export function getAllExhibitors(): Exhibitor[] {
  return Object.values(exhibitors)
}