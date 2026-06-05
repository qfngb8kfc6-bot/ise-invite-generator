import type { ThemeConfig, ThemeKey } from '@/lib/types'

export const themes: Record<ThemeKey, ThemeConfig> = {
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
    label: 'Content Production',
    backgroundImage: '/themes/content-production.jpg',
  },
}
