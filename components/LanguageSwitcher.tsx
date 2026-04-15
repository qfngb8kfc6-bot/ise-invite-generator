'use client'

import { useEffect, useState } from 'react'
import { translations } from '@/lib/translations'
import type { LanguageKey } from '@/lib/types'

const STORAGE_KEY = 'ise-site-language'

export function getStoredLanguage(): LanguageKey {
  if (typeof window === 'undefined') {
    return 'en'
  }

  const value = window.localStorage.getItem(STORAGE_KEY)
  if (value && value in translations) {
    return value as LanguageKey
  }

  return 'en'
}

export function setStoredLanguage(language: LanguageKey) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, language)
  window.dispatchEvent(new CustomEvent('site-language-changed', { detail: language }))
}

type LanguageSwitcherProps = {
  value?: LanguageKey
  onChange?: (language: LanguageKey) => void
}

export default function LanguageSwitcher({
  value,
  onChange,
}: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<LanguageKey>(value ?? 'en')

  useEffect(() => {
    if (value) {
      setLanguage(value)
      return
    }

    setLanguage(getStoredLanguage())
  }, [value])

  function handleChange(nextLanguage: LanguageKey) {
    setLanguage(nextLanguage)
    setStoredLanguage(nextLanguage)
    onChange?.(nextLanguage)
  }

  return (
    <select
      value={language}
      onChange={(event) => handleChange(event.target.value as LanguageKey)}
      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400"
    >
      {Object.entries(translations).map(([key, bundle]) => (
        <option key={key} value={key}>
          {bundle.ui.languageName}
        </option>
      ))}
    </select>
  )
}