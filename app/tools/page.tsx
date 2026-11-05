import { requireAdminPage } from '@/lib/admin-guard'
import ToolsClient from './ToolsClient'

export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  await requireAdminPage('/tools')

  return <ToolsClient />
}
