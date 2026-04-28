'use client'

import { useEffect, useRef, useState } from 'react'
import { translations } from '@/lib/translations'
import type { LanguageKey } from '@/lib/types'

const STORAGE_KEY = 'ise-site-language'

export function getStoredLanguage(): LanguageKey {
  if (typeof window === 'undefined') return 'en'

  const value = window.localStorage.getItem(STORAGE_KEY)

  if (value && value in translations) {
    return value as LanguageKey
  }

  return 'en'
}

export function setStoredLanguage(language: LanguageKey) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, language)
  window.dispatchEvent(
    new CustomEvent('site-language-changed', { detail: language })
  )
}

export function useSiteLanguage(): [LanguageKey, (language: LanguageKey) => void] {
  const [language, setLanguage] = useState<LanguageKey>('en')

  useEffect(() => {
    setLanguage(getStoredLanguage())

    function handleLanguageChange(event: Event) {
      const customEvent = event as CustomEvent<LanguageKey>
      setLanguage(customEvent.detail)
    }

    window.addEventListener('site-language-changed', handleLanguageChange)

    return () => {
      window.removeEventListener('site-language-changed', handleLanguageChange)
    }
  }, [])

  function updateLanguage(nextLanguage: LanguageKey) {
    setLanguage(nextLanguage)
    setStoredLanguage(nextLanguage)
  }

  return [language, updateLanguage]
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
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  const language = value ?? siteLanguage

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return

      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSelect(nextLanguage: LanguageKey) {
    if (value === undefined) {
      setSiteLanguage(nextLanguage)
    } else {
      setStoredLanguage(nextLanguage)
    }

    onChange?.(nextLanguage)
    setOpen(false)
  }

  const buttonClasses = dark
    ? 'border-white/10 bg-black/30 text-white hover:bg-white/10'
    : 'border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50'

  const menuClasses = dark
    ? 'border-white/10 bg-neutral-950 text-white shadow-2xl'
    : 'border-zinc-200 bg-white text-zinc-900 shadow-xl'

  const optionClasses = dark
    ? 'hover:bg-white/10'
    : 'hover:bg-zinc-100'

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex min-w-[130px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm outline-none transition ${buttonClasses}`}
      >
        <span>{translations[language]?.ui.languageName ?? 'English'}</span>
        <span className="text-xs opacity-70">⌄</span>
      </button>

      {open ? (
        <div
          className={`absolute right-0 top-[calc(100%+8px)] z-[100] max-h-[280px] min-w-[190px] overflow-auto rounded-2xl border p-1 ${menuClasses}`}
        >
          {Object.entries(translations).map(([key, bundle]) => {
            const optionLanguage = key as LanguageKey
            const active = optionLanguage === language

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(optionLanguage)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${optionClasses} ${
                  active ? 'font-semibold' : 'font-normal'
                }`}
              >
                <span>{bundle.ui.languageName}</span>
                {active ? <span>✓</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}