'use client'

import { useEffect, useState } from 'react'
import { translations } from '@/lib/translations'
import type { LanguageKey } from '@/lib/types'

const STORAGE_KEY = 'ise-site-language'
const LANGUAGE_EVENT = 'site-language-changed'

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

  window.dispatchEvent(
    new CustomEvent<LanguageKey>(LANGUAGE_EVENT, {
      detail: language,
    })
  )
}

export function useSiteLanguage(): [LanguageKey, (language: LanguageKey) => void] {
  const [language, setLanguageState] = useState<LanguageKey>('en')

  useEffect(() => {
    setLanguageState(getStoredLanguage())

    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<LanguageKey>
      const nextLanguage = customEvent.detail

      if (nextLanguage && nextLanguage in translations) {
        setLanguageState(nextLanguage)
      }
    }

    window.addEventListener(LANGUAGE_EVENT, handleLanguageChange)

    return () => {
      window.removeEventListener(LANGUAGE_EVENT, handleLanguageChange)
    }
  }, [])

  function setLanguage(language: LanguageKey) {
    setLanguageState(language)
    setStoredLanguage(language)
  }

  return [language, setLanguage]
}

type LanguageSwitcherProps = {
  value?: LanguageKey
  onChange?: (language: LanguageKey) => void
  dark?: boolean
}

export default function LanguageSwitcher({
  value,
  onChange,
  dark = false,
}: LanguageSwitcherProps) {
  const [siteLanguage, setSiteLanguage] = useSiteLanguage()
  const language = value ?? siteLanguage

  function handleChange(nextLanguage: LanguageKey) {
    setSiteLanguage(nextLanguage)
    onChange?.(nextLanguage)
  }

  return (
    <select
      value={language}
      onChange={(event) => handleChange(event.target.value as LanguageKey)}
      className={
        dark
          ? 'rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-white/25'
          : 'rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400'
      }
    >
      {Object.entries(translations).map(([key, bundle]) => (
        <option key={key} value={key} className="text-black">
          {bundle.ui.languageName}
        </option>
      ))}
    </select>
  )
}