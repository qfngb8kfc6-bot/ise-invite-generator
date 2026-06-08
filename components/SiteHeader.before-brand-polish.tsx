'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher, {
  useSiteLanguage,
} from '@/components/LanguageSwitcher'
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
    reportsSubtitle: 'Panel Analítico',
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
    reportsSubtitle: 'Tableau analytique',
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
    reportsSubtitle: 'Painel Analítico',
    toolsNav: 'Ferramentas',
    reportsNav: 'Relatórios',
  },
  nl: {
    generatorTitle: 'ISE 2027 Uitnodigingsgenerator',
    toolsTitle: 'ISE 2027 Exposantentools',
    reportsTitle: 'ISE 2027 Exposantenrapporten',
    toolsSubtitle: 'Uitnodigingsgenerator',
    reportsSubtitle: 'Analyse Dashboard',
    toolsNav: 'Tools',
    reportsNav: 'Rapporten',
  },
  'zh-CN': {
    generatorTitle: 'ISE 2027 邀请函生成器',
    toolsTitle: 'ISE 2027 参展商工具',
    reportsTitle: 'ISE 2027 参展商报告',
    toolsSubtitle: '邀请函生成器',
    reportsSubtitle: '分析仪表板',
    toolsNav: '工具',
    reportsNav: '报告',
  },
}

function NavButton({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
        active
          ? 'bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.15)]'
          : 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      <span className="relative z-10">{children}</span>

      {!active ? (
        <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-violet-500/10" />
        </div>
      ) : null}
    </Link>
  )
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-4"
        >
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white shadow-[0_10px_35px_rgba(255,255,255,0.12)] transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/ise-logo.png"
              alt="ISE Logo"
              fill
              className="object-contain p-2"
              priority
            />
          </div>

          <div className="min-w-0">
            <div className="truncate bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-sm font-semibold tracking-wide text-transparent sm:text-base">
              {title}
            </div>

            {subtitle ? (
              <div className="mt-1 truncate text-xs tracking-wide text-neutral-500">
                {subtitle}
              </div>
            ) : null}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {(isTools || isReports) && (
            <nav className="hidden items-center gap-2 sm:flex">
              <NavButton href="/tools" active={isTools}>
                {text.toolsNav}
              </NavButton>

              <NavButton href="/reports" active={isReports}>
                {text.reportsNav}
              </NavButton>
            </nav>
          )}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2 backdrop-blur-xl">
            <LanguageSwitcher dark />
          </div>
        </div>
      </div>

      {(isTools || isReports) && (
        <div className="border-t border-white/5 px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <NavButton href="/tools" active={isTools}>
              {text.toolsNav}
            </NavButton>

            <NavButton href="/reports" active={isReports}>
              {text.reportsNav}
            </NavButton>
          </div>
        </div>
      )}
    </header>
  )
}