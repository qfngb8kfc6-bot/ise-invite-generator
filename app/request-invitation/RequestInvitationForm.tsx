'use client'

import { useState } from 'react'

type Option = {
  key: string
  label: string
}

type RequestInvitationFormProps = {
  themes: Option[]
  languages: Option[]
}

const MAX_LOGO_BYTES = 3 * 1024 * 1024

export default function RequestInvitationForm({
  themes,
  languages,
}: RequestInvitationFormProps) {
  const [logoMessage, setLogoMessage] = useState('')

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setLogoMessage('')
      return
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoMessage('Logo is too large. Maximum size is 3MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setLogoMessage('Logo must be an image file.')
      return
    }

    setLogoMessage('Logo selected. It will be checked when submitted.')
  }

  return (
    <form action="/api/request-invitation" method="post" encType="multipart/form-data" className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">Company name</label>
        <input name="companyName" required minLength={2} maxLength={120} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" placeholder="Your company name" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">Contact name</label>
        <input name="contactName" required minLength={2} maxLength={120} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" placeholder="Your name" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">Contact email</label>
        <input name="contactEmail" type="email" required maxLength={160} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400" placeholder="you@example.com" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">Company logo</label>
        <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" required onChange={handleLogoChange} className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white" />
        <p className="mt-2 text-xs text-white/35">Max 3MB. Minimum 300 × 120px recommended.</p>
        {logoMessage ? <p className="mt-2 text-xs text-blue-200">{logoMessage}</p> : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">Sector image</label>
        <select name="theme" required defaultValue="audio" className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400">
          {themes.map((theme) => (
            <option key={theme.key} value={theme.key} className="text-black">{theme.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-white/70">Invitation language</label>
        <select name="language" required defaultValue="en" className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 outline-none focus:border-blue-400">
          {languages.map((language) => (
            <option key={language.key} value={language.key} className="text-black">{language.label}</option>
          ))}
        </select>
      </div>

      <button className="w-full rounded-2xl bg-blue-600 px-5 py-4 font-semibold transition hover:bg-blue-500">
        Submit request
      </button>
    </form>
  )
}
