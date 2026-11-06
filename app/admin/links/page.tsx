import { requireAdminPage } from '@/lib/admin-guard'
import AdminLinksClient from './AdminLinksClient'

export const dynamic = 'force-dynamic'

export default async function AdminLinksPage() {
  await requireAdminPage('/admin/links')

  return <AdminLinksClient />
}
