import { themes } from '@/lib/themes'
import { translations } from '@/lib/translations'
import RequestInvitationPageClient from './RequestInvitationPageClient'

function getUiString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export const dynamic = 'force-dynamic'

export default function RequestInvitationPage() {
  const themeOptions = Object.entries(themes).map(([key, theme]) => ({
    key,
    label: theme.label,
  }))

  const languageOptions = Object.entries(translations)
    .filter(([key]) => key !== 'ca')
    .map(([key, bundle]) => ({
      key,
      label: getUiString(bundle.ui.languageName, key),
    }))

  return (
    <RequestInvitationPageClient
      themes={themeOptions}
      languages={languageOptions}
    />
  )
}
