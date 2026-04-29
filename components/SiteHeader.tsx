'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher, { useSiteLanguage } from '@/components/LanguageSwitcher'
import type { LanguageKey } from '@/lib/types'

const headerText: Record<
  LanguageKey,
  {
    generatorTitle: string
    toolsTitle: string
    reportsTitle: string
    toolsSubtitle: string
    reportsSubtitle: string
    toolsNav: string
    reportsNav: string
  }
> = {
  en: {
    generatorTitle: 'ISE 2027 Invitation Generator',
    toolsTitle: 'ISE 2027 Exhibitor Tools',
    reportsTitle: 'ISE 2027 Exhibitor Reports',
    toolsSubtitle: 'Invitation Generator',
    reportsSubtitle: 'Analytics Dashboard',
    toolsNav: 'Tools',
    reportsNav: 'Reports',
  },
  es: {
    generatorTitle: 'Generador de Invitaciones ISE 2027',
    toolsTitle: 'Herramientas para Expositores ISE 2027',
    reportsTitle: 'Informes de Expositores ISE 2027',
    toolsSubtitle: 'Generador de Invitaciones',
    reportsSubtitle: 'Panel de Analítica',
    toolsNav: 'Herramientas',
    reportsNav: 'Informes',
  },
  de: {
    generatorTitle: 'ISE 2027 Einladungsgenerator',
    toolsTitle: 'ISE 2027 Aussteller-Tools',
    reportsTitle: 'ISE 2027 Ausstellerberichte',
    toolsSubtitle: 'Einladungsgenerator',
    reportsSubtitle: 'Analyse-Dashboard',
    toolsNav: 'Tools',
    reportsNav: 'Berichte',
  },
  fr: {
    generatorTitle: 'Générateur d’invitations ISE 2027',
    toolsTitle: 'Outils Exposants ISE 2027',
    reportsTitle: 'Rapports Exposants ISE 2027',
    toolsSubtitle: 'Générateur d’invitations',
    reportsSubtitle: 'Tableau de bord analytique',
    toolsNav: 'Outils',
    reportsNav: 'Rapports',
  },
  it: {
    generatorTitle: 'Generatore Inviti ISE 2027',
    toolsTitle: 'Strumenti Espositori ISE 2027',
    reportsTitle: 'Report Espositori ISE 2027',
    toolsSubtitle: 'Generatore Inviti',
    reportsSubtitle: 'Dashboard Analitica',
    toolsNav: 'Strumenti',
    reportsNav: 'Report',
  },
  pt: {
    generatorTitle: 'Gerador de Convites ISE 2027',
    toolsTitle: 'Ferramentas para Expositores ISE 2027',
    reportsTitle: 'Relatórios de Expositores ISE 2027',
    toolsSubtitle: 'Gerador de Convites',
    reportsSubtitle: 'Painel de Análise',
    toolsNav: 'Ferramentas',
    reportsNav: 'Relatórios',
  },
  nl: {
    generatorTitle: 'ISE 2027 Uitnodigingsgenerator',
    toolsTitle: 'ISE 2027 Exposantentools',
    reportsTitle: 'ISE 2027 Exposantenrapporten',
    toolsSubtitle: 'Uitnodigingsgenerator',
    reportsSubtitle: 'Analysedashboard',
    toolsNav: 'Tools',
    reportsNav: 'Rapporten',
  },
  'zh-CN': {
    generatorTitle: 'ISE 2027 邀请函生成器',
    toolsTitle: 'ISE 2027 参展商工具',
    reportsTitle: 'ISE 2027 参展商报告',
    toolsSubtitle: '邀请函生成器',
    reportsSubtitle: '数据分析面板',
    toolsNav: '工具',
    reportsNav: '报告',
  },
}

export default function SiteHeader() {
  const pathname = usePathname()
  const [language] = useSiteLanguage()
  const text = headerText[language] ?? headerText.en

  const isTools = pathname.startsWith('/tools')
  const isReports = pathname.startsWith('/reports')
  const isGenerator = pathname.startsWith('/generator')

  let title = 'ISE 2027'
  let subtitle = ''

  if (isGenerator) {
    title = text.generatorTitle
  }

  if (isTools) {
    title = text.toolsTitle
    subtitle = text.toolsSubtitle
  }

  if (isReports) {
    title = text.reportsTitle
    subtitle = text.reportsSubtitle
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
            <Image
              src="/ise-logo.png"
              alt="ISE Logo"
              fill
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-none text-white">
              {title}
            </div>

            {subtitle ? (
              <div className="mt-1 truncate text-xs text-neutral-500">
                {subtitle}
              </div>
            ) : null}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          {isTools || isReports ? (
            <nav className="hidden items-center gap-2 text-sm sm:flex">
              <Link
                href="/tools"
                className={`rounded-xl border px-3 py-2 transition ${
                  isTools
                    ? 'border-white bg-white text-black'
                    : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {text.toolsNav}
              </Link>

              <Link
                href="/reports"
                className={`rounded-xl border px-3 py-2 transition ${
                  isReports
                    ? 'border-white bg-white text-black'
                    : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {text.reportsNav}
              </Link>
            </nav>
          ) : null}

          <div className="hidden sm:block">
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 pb-3 sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          {isTools || isReports ? (
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/tools"
                className={`rounded-xl border px-3 py-2 transition ${
                  isTools
                    ? 'border-white bg-white text-black'
                    : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {text.toolsNav}
              </Link>

              <Link
                href="/reports"
                className={`rounded-xl border px-3 py-2 transition ${
                  isReports
                    ? 'border-white bg-white text-black'
                    : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {text.reportsNav}
              </Link>
            </nav>
          ) : (
            <div />
          )}

          <LanguageSwitcher dark />
        </div>
      </div>
    </header>
  )
}