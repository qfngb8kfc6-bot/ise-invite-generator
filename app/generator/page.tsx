import GeneratorPageClient from '@/components/GeneratorPageClient'

export const dynamic = 'force-dynamic'

type GeneratorPageProps = {
  searchParams: Promise<{
    token?: string
  }>
}

function normaliseToken(value: string | undefined): string {
  if (!value) {
    return ''
  }

  return value
    .trim()
    .replace(/^["']+/, '')
    .replace(/["']+$/, '')
    .replace(/\s+/g, '')
}

export default async function GeneratorPage({
  searchParams,
}: GeneratorPageProps) {
  const params = await searchParams
  const token = normaliseToken(params.token)

  return <GeneratorPageClient initialToken={token} />
}