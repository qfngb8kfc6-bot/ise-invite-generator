import type { ThemeConfig, ThemeKey } from '@/lib/types'

export const themes: Record<ThemeKey, ThemeConfig> = {
  iseBrandingOne: {
    label: 'ISE 2027 Branding 1',
    backgroundImage: '/branding/ise-background.jpeg',
  },
  iseBrandingTwo: {
    label: 'ISE 2027 Branding 2',
    backgroundImage: '/branding/toolkit/ise-invitation-bg.png',
  },
  audio: {
    label: 'Audio',
    backgroundImage: '/themes/audio.jpg',
  },
  residential: {
    label: 'Residential',
    backgroundImage: '/themes/residential.jpg',
  },
  lighting: {
    label: 'Lighting & Staging',
    backgroundImage: '/themes/lighting.jpg',
  },
  unifiedCommunications: {
    label: 'Unified Communications',
    backgroundImage: '/themes/unified-communications.jpg',
  },
  educationTechnology: {
    label: 'Education Technology',
    backgroundImage: '/themes/education-technology.jpg',
  },
  digitalSignage: {
    label: 'Digital Signage',
    backgroundImage: '/themes/digital-signage.jpg',
  },
  smartBuilding: {
    label: 'Smart Building',
    backgroundImage: '/themes/smart-building.jpg',
  },
  contentProduction: {
    label: 'Broadcast Production',
    backgroundImage: '/themes/content-production.jpg',
  },
}
