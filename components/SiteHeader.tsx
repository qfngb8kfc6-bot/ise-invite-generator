'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import LanguageSwitcher, {
  useSiteLanguage,
} from '@/components/LanguageSwitcher'
import type { LanguageKey } from '@/lib/types'

const DISPLAY_MODE_STORAGE_KEY = 'ise-generator-display-mode'
const THEME_EVENT = 'ise-theme-mode-changed'

type DisplayMode = 'dark' | 'light'

const headerText: Record<
  LanguageKey,
  {
    generatorTitle: string
    toolsTitle: string
    reportsTitle: string
    homeTitle: string
    toolsSubtitle: string
    reportsSubtitle: string
    generatorSubtitle: string
    homeSubtitle: string
    toolsNav: string
    reportsNav: string
    generatorNav: string
    homeNav: string
    lightMode: string
    darkMode: string
  }
> = {
  en: {
    generatorTitle: 'ISE 2027 Invitation Generator',
    toolsTitle: 'ISE 2027 Exhibitor Tools',
    reportsTitle: 'ISE 2027 Exhibitor Reports',
    homeTitle: 'ISE 2027 Exhibitor Platform',
    toolsSubtitle: 'Internal launch-link and testing tools',
    reportsSubtitle: 'Analytics Dashboard',
    generatorSubtitle: 'Official exhibitor invitation asset creator',
    homeSubtitle: 'Invitation assets, launch links, exports and analytics',
    toolsNav: 'Tools',
    reportsNav: 'Reports',
    generatorNav: 'Generator',
    homeNav: 'Home',
    lightMode: 'Light',
    darkMode: 'Dark',
  },
  es: {
    generatorTitle: 'Generador de Invitaciones ISE 2027',
    toolsTitle: 'Herramientas para Expositores ISE 2027',
    reportsTitle: 'Informes de Expositores ISE 2027',
    homeTitle: 'Plataforma de Expositores ISE 2027',
    toolsSubtitle: 'Herramientas internas de enlaces y pruebas',
    reportsSubtitle: 'Panel Analítico',
    generatorSubtitle: 'Creador oficial de invitaciones para expositores',
    homeSubtitle: 'Invitaciones, enlaces, exportaciones y analítica',
    toolsNav: 'Herramientas',
    reportsNav: 'Informes',
    generatorNav: 'Generador',
    homeNav: 'Inicio',
    lightMode: 'Claro',
    darkMode: 'Oscuro',
  },
  de: {
    generatorTitle: 'ISE 2027 Einladungsgenerator',
    toolsTitle: 'ISE 2027 Aussteller-Tools',
    reportsTitle: 'ISE 2027 Ausstellerberichte',
    homeTitle: 'ISE 2027 Ausstellerplattform',
    toolsSubtitle: 'Interne Launch-Link- und Test-Tools',
    reportsSubtitle: 'Analyse-Dashboard',
    generatorSubtitle: 'Offizieller Aussteller-Einladungsgenerator',
    homeSubtitle: 'Einladungen, Links, Exporte und Analysen',
    toolsNav: 'Tools',
    reportsNav: 'Berichte',
    generatorNav: 'Generator',
    homeNav: 'Start',
    lightMode: 'Hell',
    darkMode: 'Dunkel',
  },
  fr: {
    generatorTitle: 'Générateur d’invitations ISE 2027',
    toolsTitle: 'Outils Exposants ISE 2027',
    reportsTitle: 'Rapports Exposants ISE 2027',
    homeTitle: 'Plateforme Exposants ISE 2027',
    toolsSubtitle: 'Outils internes de liens et de tests',
    reportsSubtitle: 'Tableau analytique',
    generatorSubtitle: 'Créateur officiel d’invitations exposants',
    homeSubtitle: 'Invitations, liens, exports et analytique',
    toolsNav: 'Outils',
    reportsNav: 'Rapports',
    generatorNav: 'Générateur',
    homeNav: 'Accueil',
    lightMode: 'Clair',
    darkMode: 'Sombre',
  },
  it: {
    generatorTitle: 'Generatore Inviti ISE 2027',
    toolsTitle: 'Strumenti Espositori ISE 2027',
    reportsTitle: 'Report Espositori ISE 2027',
    homeTitle: 'Piattaforma Espositori ISE 2027',
    toolsSubtitle: 'Strumenti interni per link e test',
    reportsSubtitle: 'Dashboard Analitica',
    generatorSubtitle: 'Creatore ufficiale di inviti per espositori',
    homeSubtitle: 'Inviti, link, esportazioni e analytics',
    toolsNav: 'Strumenti',
    reportsNav: 'Report',
    generatorNav: 'Generatore',
    homeNav: 'Home',
    lightMode: 'Chiaro',
    darkMode: 'Scuro',
  },
  pt: {
    generatorTitle: 'Gerador de Convites ISE 2027',
    toolsTitle: 'Ferramentas para Expositores ISE 2027',
    reportsTitle: 'Relatórios de Expositores ISE 2027',
    homeTitle: 'Plataforma de Expositores ISE 2027',
    toolsSubtitle: 'Ferramentas internas de links e testes',
    reportsSubtitle: 'Painel Analítico',
    generatorSubtitle: 'Criador oficial de convites para expositores',
    homeSubtitle: 'Convites, links, exportações e analytics',
    toolsNav: 'Ferramentas',
    reportsNav: 'Relatórios',
    generatorNav: 'Gerador',
    homeNav: 'Início',
    lightMode: 'Claro',
    darkMode: 'Escuro',
  },
  nl: {
    generatorTitle: 'ISE 2027 Uitnodigingsgenerator',
    toolsTitle: 'ISE 2027 Exposantentools',
    reportsTitle: 'ISE 2027 Exposantenrapporten',
    homeTitle: 'ISE 2027 Exposantenplatform',
    toolsSubtitle: 'Interne launch-link en testtools',
    reportsSubtitle: 'Analyse Dashboard',
    generatorSubtitle: 'Officiële uitnodigingsmaker voor exposanten',
    homeSubtitle: 'Uitnodigingen, links, exports en analytics',
    toolsNav: 'Tools',
    reportsNav: 'Rapporten',
    generatorNav: 'Generator',
    homeNav: 'Home',
    lightMode: 'Licht',
    darkMode: 'Donker',
  },
  'zh-CN': {
    generatorTitle: 'ISE 2027 邀请函生成器',
    toolsTitle: 'ISE 2027 参展商工具',
    reportsTitle: 'ISE 2027 参展商报告',
    homeTitle: 'ISE 2027 参展商平台',
    toolsSubtitle: '内部链接与测试工具',
    reportsSubtitle: '分析仪表板',
    generatorSubtitle: '官方参展商邀请函生成工具',
    homeSubtitle: '邀请函、链接、导出和分析',
    toolsNav: '工具',
    reportsNav: '报告',
    generatorNav: '生成器',
    homeNav: '首页',
    lightMode: '浅色',
    darkMode: '深色',
  },
}

function NavButton({
  href,
  active,
  children,
  mode,
}: {
  href: string
  active: boolean
  children: React.ReactNode
  mode: DisplayMode
}) {
  const isLight = mode === 'light'

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        active
          ? isLight
            ? 'bg-[#2d3f8f] text-white shadow-[0_8px_30px_rgba(45,63,143,0.18)]'
            : 'bg-white text-black shadow-[0_8px_30px_rgba(255,255,255,0.15)]'
          : isLight
            ? 'border border-slate-300 bg-white/70 text-slate-700 hover:bg-white hover:text-[#2d3f8f]'
            : 'border border-white/10 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.08] hover:text-white'
      }`}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [language] = useSiteLanguage()
  const displayMode: DisplayMode = 'dark'
  const text = headerText[language] ?? headerText.en
  const isLight = false

  const isHome = pathname === '/'
  const isTools = pathname.startsWith('/tools')
  const isReports = pathname.startsWith('/reports')
  const isAdminLogin = pathname.startsWith('/admin/login')
  const isGenerator = pathname.startsWith('/generator')
  const isAdminArea = isTools || isReports || isAdminLogin
  const showAdminNav = isTools || isReports

  useEffect(() => {
    document.documentElement.dataset.iseMode = 'dark'
    window.localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, 'dark')
    window.dispatchEvent(
      new CustomEvent<DisplayMode>(THEME_EVENT, {
        detail: 'dark',
      })
    )
  }, [])

  let title = text.homeTitle
  let subtitle = text.homeSubtitle

  if (isGenerator) {
    title = text.generatorTitle
    subtitle = text.generatorSubtitle
  }

  if (isTools) {
    title = text.toolsTitle
    subtitle = text.toolsSubtitle
  }

  if (isReports) {
    title = text.reportsTitle
    subtitle = text.reportsSubtitle
  }

  if (isAdminLogin) {
    title = text.homeTitle
    subtitle = text.homeSubtitle
  }

  async function handleAdminLogout() {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      })
    } finally {
      router.replace('/admin/login')
      router.refresh()
    }
  }

  const logoSrc = isLight
    ? '/branding/ise-logo-blue.png'
    : '/branding/ise-logo-white.png'

  return (
    <header
      className={
        isLight
          ? 'sticky top-0 z-50 border-b border-white/15 bg-white/18 text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-2xl'
          : 'sticky top-0 z-50 border-b border-white/10 bg-black/22 text-white shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl'
      }
    >
      <div
        className={
          isLight
            ? 'pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.70),rgba(255,255,255,0.42),rgba(255,255,255,0.14))]'
            : 'pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.82),rgba(2,6,23,0.50),rgba(2,6,23,0.16))]'
        }
      />
      <div
        className={
          isLight
            ? 'pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#2d3f8f]/35 to-transparent'
            : 'pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent'
        }
      />

      <div className="relative flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="group flex min-w-0 items-center gap-7">
          <div
            className={
              isLight
                ? 'relative flex h-24 w-56 shrink-0 items-center justify-center overflow-hidden px-2 transition-transform duration-300 group-hover:scale-105 sm:w-64'
                : 'relative flex h-24 w-56 shrink-0 items-center justify-center overflow-hidden px-2 transition-transform duration-300 group-hover:scale-105 sm:w-64'
            }
          >
            <Image
              src={logoSrc}
              alt="Integrated Systems Europe"
              fill
              className="object-contain p-0.5"
              priority
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={
                  isLight
                    ? 'truncate text-sm font-bold tracking-wide text-[#1f2f78] sm:text-base'
                    : 'truncate bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-sm font-semibold tracking-wide text-transparent sm:text-base'
                }
              >
                {title}
              </div>

              {isGenerator ? (
                <span
                  className={
                    isLight
                      ? 'hidden rounded-full border border-[#2d3f8f]/20 bg-[#2d3f8f]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2d3f8f] sm:inline-flex'
                      : 'hidden rounded-full border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-200 sm:inline-flex'
                  }
                >
                  Official exhibitor tool
                </span>
              ) : null}
            </div>

            <div
              className={
                isLight
                  ? 'mt-1 truncate text-xs tracking-wide text-slate-500'
                  : 'mt-1 truncate text-xs tracking-wide text-neutral-500'
              }
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showAdminNav ? (
            <nav className="hidden items-center gap-2 md:flex">
              <NavButton href="/" active={isHome} mode={displayMode}>
                {text.homeNav}
              </NavButton>

              <NavButton href="/generator" active={isGenerator} mode={displayMode}>
                {text.generatorNav}
              </NavButton>

              <NavButton href="/tools" active={isTools} mode={displayMode}>
                {text.toolsNav}
              </NavButton>

              <NavButton href="/reports" active={isReports} mode={displayMode}>
                {text.reportsNav}
              </NavButton>
            </nav>
          ) : null}

          <LanguageSwitcher dark />

          {isAdminArea ? (
            <button
              type="button"
              onClick={handleAdminLogout}
              className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-white/[0.08] hover:text-white md:inline-flex"
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>

      {showAdminNav ? (
        <div
          className={
            isLight
              ? 'border-t border-slate-200 px-4 py-3 md:hidden'
              : 'border-t border-white/5 px-4 py-3 md:hidden'
          }
        >
          <div className="flex items-center gap-2 overflow-x-auto">
            <NavButton href="/" active={isHome} mode={displayMode}>
              {text.homeNav}
            </NavButton>

            <NavButton href="/generator" active={isGenerator} mode={displayMode}>
              {text.generatorNav}
            </NavButton>

            <NavButton href="/tools" active={isTools} mode={displayMode}>
              {text.toolsNav}
            </NavButton>

            <NavButton href="/reports" active={isReports} mode={displayMode}>
              {text.reportsNav}
            </NavButton>
          </div>
        </div>
      ) : null}
    </header>
  )
}
