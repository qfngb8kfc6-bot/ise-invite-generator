import type { ThemeConfig, ThemeKey } from '@/lib/types'

const OFFICIAL_BACKGROUND_BASE =
  '/branding/ise-2027-digital-invitation/backgrounds'

export const themes: Record<ThemeKey, ThemeConfig> = {
  iseBrandingTwo: {
    label: 'Save the Date',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Save the date.jpg`,
  },
  iseBrandingOne: {
    label: 'ISE themed',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Generic.jpg`,
  },
  audio: {
    label: 'Audio',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Audio.jpg`,
  },
  contentProduction: {
    label: 'Broadcast',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Broadcast.jpg`,
  },
  digitalSignage: {
    label: 'Digital Signage',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Digital Signage.jpg`,
  },
  educationTechnology: {
    label: 'Education',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Education.jpg`,
  },
  lighting: {
    label: 'Lighting & Staging',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Lighting & Staging.jpg`,
  },
  unifiedCommunications: {
    label: 'Multi Technology',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Multitechnology.jpg`,
  },
  residential: {
    label: 'Residential',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Residential.jpg`,
  },
  smartBuilding: {
    label: 'Smart Building',
    backgroundImage: `${OFFICIAL_BACKGROUND_BASE}/ISE27 - Digital Invitation - Smart building.jpg`,
  },
}
