import { redirect } from 'next/navigation'

type SecondaryRedirectPageProps = {
  params: Promise<{
    requestId: string
  }>
}

export const dynamic = 'force-dynamic'

export default async function SecondaryRedirectPage({
  params,
}: SecondaryRedirectPageProps) {
  const { requestId } = await params

  redirect(`/visitors/${encodeURIComponent(requestId)}`)
}
