import SecondaryGeneratorPageClient from '@/components/SecondaryGeneratorPageClient'
import {
  getSecondaryInvitationRequestById,
  isSecondaryInvitationApproved,
} from '@/lib/google-sheets'

export const dynamic = 'force-dynamic'

type SecondaryGeneratorPageProps = {
  params: Promise<{
    requestId: string
  }>
}

function MissingState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-[36px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-3xl">
          i
        </div>

        <h1 className="text-3xl font-semibold">{title}</h1>

        <p className="mt-4 text-sm leading-7 text-white/50">
          {description}
        </p>

        <a
          href="/request-invitation"
          className="mt-8 inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium hover:bg-white/10"
        >
          Back to request form
        </a>
      </div>
    </main>
  )
}

export default async function SecondaryGeneratorPage({
  params,
}: SecondaryGeneratorPageProps) {
  const { requestId } = await params
  const request = await getSecondaryInvitationRequestById(requestId)

  if (!request) {
    return (
      <MissingState
        title="Invitation request not found"
        description="We could not find this invitation request. Please check the link or contact the ISE team."
      />
    )
  }

  if (!isSecondaryInvitationApproved(request.status)) {
    return (
      <MissingState
        title="Invitation cards not ready yet"
        description="This request has been received, but it has not yet been approved or assigned an invitation code by the ISE team."
      />
    )
  }

  if (!request.assignedInvitationCode) {
    return (
      <MissingState
        title="Invitation code missing"
        description="This request has been approved, but no invitation code has been added yet. Please ask the ISE team to complete the assigned invitation code field."
      />
    )
  }

  return (
    <SecondaryGeneratorPageClient
      data={{
        requestId: request.requestId,
        assignedCodeId: request.assignedCodeId,
        status: request.status,
        companyName: request.companyName,
        standNumber: request.assignedCodeId,
        invitationCode: request.assignedInvitationCode,
        registrationUrl:
          request.generatorUrl ||
          `https://www.iseurope.org/welcome/registration?code=${encodeURIComponent(
            request.assignedInvitationCode
          )}`,
        logoUrl: request.logoUrl,
        theme: request.theme,
        language: request.language,
      }}
    />
  )
}
