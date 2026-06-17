import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'
import ToolsClient from './ToolsClient'

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const cookieStore = await cookies()
  const isAdmin = await verifyAdminSessionCookieValue(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  )

  if (!isAdmin) {
    redirect('/admin/login?redirect=/tools')
  }

  return <ToolsClient />
}
