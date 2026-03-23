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
    label: 'Lighting',
    backgroundImage: '/themes/lighting.jpg',
  },
}