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

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-white outline-none transition placeholder:text-white/28 focus:border-blue-400 focus:bg-black/45'

const labelClass = 'mb-2 block text-sm font-semibold text-white/75'

const helperClass = 'mt-2 text-xs leading-5 text-white/38'

export default function RequestInvitationForm({
  themes,
  languages,
}: RequestInvitationFormProps) {
  const [logoMessage, setLogoMessage] = useState('')
  const [logoMessageType, setLogoMessageType] = useState<'info' | 'error'>('info')

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setLogoMessage('')
      setLogoMessageType('info')
      return
    }

    if (file.size > MAX_LOGO_BYTES) {
      setLogoMessage('Logo is too large. Please upload a file under 3MB.')
      setLogoMessageType('error')
      event.target.value = ''
      return
    }

    if (!file.type.startsWith('image/')) {
      setLogoMessage('Logo must be an image file: PNG, JPG, WEBP or SVG.')
      setLogoMessageType('error')
      event.target.value = ''
      return
    }

    setLogoMessage(`${file.name} selected. This logo will be reviewed after submission.`)
    setLogoMessageType('info')
  }

  return (
    <form
      action="/api/request-invitation"
      method="post"
      encType="multipart/form-data"
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Company name</label>
          <input
            name="companyName"
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            placeholder="Company name as it should appear"
            autoComplete="organization"
          />
          <p className={helperClass}>
            This will be used on your invitation card and download assets.
          </p>
        </div>

        <div>
          <label className={labelClass}>Contact name</label>
          <input
            name="contactName"
            required
            minLength={2}
            maxLength={120}
            className={inputClass}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>

        <div>
          <label className={labelClass}>Contact email</label>
          <input
            name="contactEmail"
            type="email"
            required
            maxLength={160}
            className={inputClass}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
        <label className={labelClass}>Preferred company logo</label>
        <input
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          onChange={handleLogoChange}
          className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-white/70 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-500"
        />
        <p className={helperClass}>
          Optional at this stage. Accepted formats: PNG, JPG, WEBP or SVG.
          Maximum file size: 3MB. Recommended minimum size: 300 × 120px.
          Exhibitors can upload or replace their logo later inside the generator.
        </p>

        {logoMessage ? (
          <p
            className={
              logoMessageType === 'error'
                ? 'mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-100'
                : 'mt-3 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-xs font-medium text-blue-100'
            }
          >
            {logoMessage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Sector image</label>
          <select
            name="theme"
            required
            defaultValue="audio"
            className={inputClass}
          >
            {themes.map((theme) => (
              <option key={theme.key} value={theme.key} className="text-black">
                {theme.label}
              </option>
            ))}
          </select>
          <p className={helperClass}>
            This sets the starting background style. Exhibitors can change it later inside the generator.
          </p>
        </div>

        <div>
          <label className={labelClass}>Invitation language</label>
          <select
            name="language"
            required
            defaultValue="en"
            className={inputClass}
          >
            {languages.map((language) => (
              <option key={language.key} value={language.key} className="text-black">
                {language.label}
              </option>
            ))}
          </select>
          <p className={helperClass}>
            This sets the starting language. Exhibitors can change it later and download assets in multiple languages.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-sm font-semibold text-white">Before submitting</p>
        <p className="mt-2 text-sm leading-6 text-white/48">
          Please check that the company name, contact email and preferences are correct.
          Logo, language and sector image can still be changed later inside the approved generator.
          After submission, the ISE team will review the request and assign the invitation details.
        </p>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-blue-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        Submit invitation request
      </button>

      <p className="text-center text-xs leading-5 text-white/35">
        By submitting this form, your details will be added to the ISE invitation
        request workflow for review.
      </p>
    </form>
  )
}