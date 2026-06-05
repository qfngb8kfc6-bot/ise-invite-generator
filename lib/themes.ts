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
    backgroundImage: '/themes/audio.jpg',
  },
  educationTechnology: {
    label: 'Education Technology',
    backgroundImage: '/themes/residential.jpg',
  },
  digitalSignage: {
    label: 'Digital Signage',
    backgroundImage: '/themes/lighting.jpg',
  },
  smartBuilding: {
    label: 'Smart Building',
    backgroundImage: '/themes/residential.jpg',
  },
  contentProduction: {
    label: 'Content Production',
    backgroundImage: '/themes/audio.jpg',
  },
}
