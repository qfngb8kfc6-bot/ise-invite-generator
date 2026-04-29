'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import MeasuredChart from '@/components/charts/MeasuredChart'
import { useSiteLanguage } from '@/components/LanguageSwitcher'
import type { LanguageKey } from '@/lib/types'

type ExhibitorSummary = {
  exhibitorId: string
  companyName: string
  totalEvents: number
  linkGeneratedCount: number
  generatorOpenedCount: number
  sessionVerifiedCount: number
  exportClickedCount: number
  exportSucceededCount: number
  exportFailedCount: number
  lastActivityAt: string | null
  formats: Record<string, number>
  generatedLinkButNeverExported: boolean
}

type DailySeriesRow = {
  date: string
  generatorOpened: number
  exportsSucceeded: number
  exportsFailed: number
}

type AvailableExhibitor = {
  exhibitorId: string
  companyName: string
}

type RecentEvent = {
  id: string
  timestamp: string
  companyName: string
  exhibitorId: string
  eventType: string
  format: string | null
  environment: string
}

type FunnelStep = {
  key:
    | 'link_generated'
    | 'generator_opened'
    | 'session_verified'
    | 'export_clicked'
    | 'export_succeeded'
    | 'export_failed'
  label: string
  count: number
  rateFromPrevious: string
  rateFromStart: string
}

type FunnelSummary = {
  steps: FunnelStep[]
  starts: number
}

type AnalyticsInsight = {
  id: string
  title: string
  value: string
  description: string
  tone: 'green' | 'blue' | 'amber' | 'red'
}

type Summary = {
  totalEvents: number
  totalExhibitors: number
  totalExportsSucceeded: number
  totalExportsFailed: number
  totalGeneratorOpens: number
  conversionRate: string
  formatUsage: Record<string, number>
  exhibitorSummaries: ExhibitorSummary[]
  recentEvents: RecentEvent[]
  dailySeries: DailySeriesRow[]
  availableExhibitors: AvailableExhibitor[]
  appliedExhibitorId: string | null
  appliedExhibitorName: string | null
  appliedSearchQuery: string | null
  appliedStartDate: string | null
  appliedEndDate: string | null
  funnel: FunnelSummary
  insights?: AnalyticsInsight[]
}

type Props = {
  summary: Summary
  currentRange: string
  currentExhibitorId: string | null
  currentSearchQuery: string
}

type SortKey =
  | 'companyName'
  | 'exhibitorId'
  | 'totalEvents'
  | 'generatorOpenedCount'
  | 'exportSucceededCount'
  | 'exportFailedCount'
  | 'conversionRate'
  | 'lastActivityAt'

type SortDirection = 'asc' | 'desc'

type FocusFilter =
  | 'all'
  | 'needsAttention'
  | 'zeroConversion'
  | 'failedExports'
  | 'topPerformers'
  | 'activeOnly'

type ExportFormatRow = {
  format: string
  label: string
  count: number
  share: string
}

type ReportsText = {
  reports: string
  range: string
  search: string
  exhibitor: string
  dates: string
  customDateRange: string
  allTime: string
  open: string
  downloadCsv: string
  downloadXlsx: string
  searchExhibitors: string
  searchExhibitorsDescription: string
  clearAllFilters: string
  companyNameOrExhibitorId: string
  searchAcrossReports: string
  startDate: string
  endDate: string
  applyFilters: string
  selectOneExhibitor: string
  selectOneExhibitorPlaceholder: string
  applyExhibitor: string
  matchingAvailableExhibitors: string
  topInsights: string
  topInsightsDescription: string
  insightsGenerated: string
  exportAnalytics: string
  exportAnalyticsDescription: string
  exportAttemptsTracked: string
  mostUsedFormat: string
  leastUsedFormat: string
  exportSuccessRate: string
  exportFailureRate: string
  noFormatUsage: string
  exportsRecordedForFormat: string
  ofSuccessfulExports: string
  successfulExportsFromAttempts: string
  failedExportsFromAttempts: string
  total: string
  format: string
  successfulExports: string
  share: string
  overview: string
  totalEvents: string
  allTrackedActivity: string
  exhibitorsSeen: string
  uniqueExhibitors: string
  generatorOpens: string
  sessionsOpened: string
  exportsSucceeded: string
  exportsFailed: string
  openToExport: string
  conversionRate: string
  needsAttention: string
  needsAttentionDescription: string
  topConversion: string
  zeroConversion: string
  zeroConversionDescription: string
  failedExports: string
  failedExportsDescription: string
  noExhibitorDataYet: string
  topExhibitorsByActivity: string
  topExhibitorsByActivityDescription: string
  noExhibitorActivityToChart: string
  exportFormatUsage: string
  exportFormatUsageDescription: string
  noExportDataToChart: string
  generatorOpensOverTime: string
  generatorOpensOverTimeDescription: string
  selectDateRangeToViewDailyCharts: string
  exportFailuresOverTime: string
  exportFailuresOverTimeDescription: string
  loadingChart: string
  totalEventLegend: string
  generatorOpenLegend: string
  exportSucceededLegend: string
  exportFailedLegend: string
  count: string
  exhibitorsWithEngagementNoExports: string
  collapseTable: string
  expandTable: string
  company: string
  exhibitorId: string
  links: string
  opens: string
  exports: string
  issue: string
  action: string
  openedGeneratorButNeverExported: string
  generatedLinksButNoSuccessfulExports: string
  viewDetails: string
  showingFiveOf: string
  noIssuesDetected: string
  exhibitorExplorer: string
  exhibitorExplorerDescription: string
  filterVisibleList: string
  filterByNameOrId: string
  rowsPerPage: string
  allExhibitors: string
  activeOnly: string
  topPerformers: string
  showing: string
  of: string
  currentFocus: string
  totalEventsColumn: string
  successfulExportsColumn: string
  failedExportsColumn: string
  lastActivity: string
  actions: string
  noExhibitorsMatch: string
  noActivity: string
  activeToday: string
  activeThisWeek: string
  inactive: string
  unknown: string
  page: string
  first: string
  previous: string
  next: string
  last: string
  funnelAnalytics: string
  funnelAnalyticsDescription: string
  step: string
  fromPrevious: string
  fromStart: string
  recentEvents: string
  recentEventsDescription: string
  timestamp: string
  event: string
  noEventsRecordedYet: string
}

const enReportsText: ReportsText = {
  reports: 'Reports',
  range: 'Range',
  search: 'Search',
  exhibitor: 'Exhibitor',
  dates: 'Dates',
  customDateRange: 'Custom date range',
  allTime: 'All time',
  open: 'Open',
  downloadCsv: 'Download CSV',
  downloadXlsx: 'Download XLSX',
  searchExhibitors: 'Search exhibitors',
  searchExhibitorsDescription:
    'Find one exhibitor quickly, filter the whole report, or jump into a detail view.',
  clearAllFilters: 'Clear all filters',
  companyNameOrExhibitorId: 'Company name or exhibitor ID',
  searchAcrossReports: 'Search across reports',
  startDate: 'Start date',
  endDate: 'End date',
  applyFilters: 'Apply filters',
  selectOneExhibitor: 'Select one exhibitor',
  selectOneExhibitorPlaceholder: 'Start typing company name or exhibitor ID',
  applyExhibitor: 'Apply exhibitor',
  matchingAvailableExhibitors: 'Matching available exhibitors',
  topInsights: 'Top insights',
  topInsightsDescription: 'Automated highlights from the selected report view.',
  insightsGenerated: 'insights generated',
  exportAnalytics: 'Export analytics',
  exportAnalyticsDescription:
    'Format usage, success rate, and failed export health for the selected report view.',
  exportAttemptsTracked: 'export attempts tracked',
  mostUsedFormat: 'Most used format',
  leastUsedFormat: 'Least used format',
  exportSuccessRate: 'Export success rate',
  exportFailureRate: 'Export failure rate',
  noFormatUsage: 'No format usage recorded yet.',
  exportsRecordedForFormat: 'exports recorded for this format.',
  ofSuccessfulExports: 'of successful exports.',
  successfulExportsFromAttempts: 'successful exports from',
  failedExportsFromAttempts: 'failed exports from',
  total: 'total',
  format: 'Format',
  successfulExports: 'Successful exports',
  share: 'Share',
  overview: 'Overview',
  totalEvents: 'Total events',
  allTrackedActivity: 'All tracked activity',
  exhibitorsSeen: 'Exhibitors seen',
  uniqueExhibitors: 'Unique exhibitors',
  generatorOpens: 'Generator opens',
  sessionsOpened: 'Sessions opened',
  exportsSucceeded: 'Exports succeeded',
  exportsFailed: 'Exports failed',
  openToExport: 'Open → Export',
  conversionRate: 'Conversion rate',
  needsAttention: 'Needs attention',
  needsAttentionDescription: 'Engaged exhibitors with no successful exports.',
  topConversion: 'Top conversion',
  zeroConversion: 'Zero conversion',
  zeroConversionDescription: 'Exhibitors currently at 0% open-to-export conversion.',
  failedExports: 'Failed exports',
  failedExportsDescription: 'Total failed export events in the selected view.',
  noExhibitorDataYet: 'No exhibitor data yet.',
  topExhibitorsByActivity: 'Top exhibitors by activity',
  topExhibitorsByActivityDescription:
    'Summary-only chart. Limited to the top exhibitors to keep the view readable.',
  noExhibitorActivityToChart: 'No exhibitor activity to chart.',
  exportFormatUsage: 'Export format usage',
  exportFormatUsageDescription: 'Which output formats are being used most.',
  noExportDataToChart: 'No export data to chart.',
  generatorOpensOverTime: 'Generator opens over time',
  generatorOpensOverTimeDescription: 'Daily generator opens and successful exports.',
  selectDateRangeToViewDailyCharts: 'Select a date range to view daily charts.',
  exportFailuresOverTime: 'Export failures over time',
  exportFailuresOverTimeDescription: 'Track failed exports by day in the selected range.',
  loadingChart: 'Loading chart…',
  totalEventLegend: 'Total events',
  generatorOpenLegend: 'Generator opens',
  exportSucceededLegend: 'Exports succeeded',
  exportFailedLegend: 'Exports failed',
  count: 'Count',
  exhibitorsWithEngagementNoExports:
    'Exhibitors with engagement but no successful exports.',
  collapseTable: 'Collapse table',
  expandTable: 'Expand table',
  company: 'Company',
  exhibitorId: 'Exhibitor ID',
  links: 'Links',
  opens: 'Opens',
  exports: 'Exports',
  issue: 'Issue',
  action: 'Action',
  openedGeneratorButNeverExported: 'Opened generator but never exported',
  generatedLinksButNoSuccessfulExports: 'Generated links but no successful exports',
  viewDetails: 'View details',
  showingFiveOf: 'Showing 5 of',
  noIssuesDetected: 'No issues detected.',
  exhibitorExplorer: 'Exhibitor explorer',
  exhibitorExplorerDescription: 'Scalable table with sorting, filtering, and pagination.',
  filterVisibleList: 'Filter visible list',
  filterByNameOrId: 'Filter by name or ID',
  rowsPerPage: 'Rows per page',
  allExhibitors: 'All exhibitors',
  activeOnly: 'Active only',
  topPerformers: 'Top performers',
  showing: 'Showing',
  of: 'of',
  currentFocus: 'Current focus',
  totalEventsColumn: 'Total events',
  successfulExportsColumn: 'Successful exports',
  failedExportsColumn: 'Failed exports',
  lastActivity: 'Last activity',
  actions: 'Actions',
  noExhibitorsMatch: 'No exhibitors match your current filters.',
  noActivity: 'No activity',
  activeToday: 'Active today',
  activeThisWeek: 'Active this week',
  inactive: 'Inactive',
  unknown: 'Unknown',
  page: 'Page',
  first: 'First',
  previous: 'Previous',
  next: 'Next',
  last: 'Last',
  funnelAnalytics: 'Funnel analytics',
  funnelAnalyticsDescription: 'Step-by-step progression through the generator journey.',
  step: 'Step',
  fromPrevious: 'From previous',
  fromStart: 'From start',
  recentEvents: 'Recent events',
  recentEventsDescription: 'Latest analytics events in the current filtered view.',
  timestamp: 'Timestamp',
  event: 'Event',
  noEventsRecordedYet: 'No events recorded yet.',
}

const reportsText: Record<LanguageKey, ReportsText> = {
  en: enReportsText,
  es: {
    ...enReportsText,
    reports: 'Informes',
    range: 'Rango',
    search: 'Buscar',
    exhibitor: 'Expositor',
    dates: 'Fechas',
    customDateRange: 'Rango de fechas personalizado',
    allTime: 'Todo el tiempo',
    downloadCsv: 'Descargar CSV',
    downloadXlsx: 'Descargar XLSX',
    searchExhibitors: 'Buscar expositores',
    clearAllFilters: 'Limpiar filtros',
    applyFilters: 'Aplicar filtros',
    overview: 'Resumen',
    totalEvents: 'Eventos totales',
    exhibitorsSeen: 'Expositores vistos',
    generatorOpens: 'Aperturas del generador',
    exportsSucceeded: 'Exportaciones correctas',
    exportsFailed: 'Exportaciones fallidas',
    conversionRate: 'Tasa de conversión',
    needsAttention: 'Requiere atención',
    failedExports: 'Exportaciones fallidas',
    company: 'Empresa',
    exhibitorId: 'ID expositor',
    links: 'Enlaces',
    opens: 'Aperturas',
    exports: 'Exportaciones',
    issue: 'Problema',
    action: 'Acción',
    viewDetails: 'Ver detalles',
    exhibitorExplorer: 'Explorador de expositores',
    allExhibitors: 'Todos los expositores',
    activeOnly: 'Solo activos',
    topPerformers: 'Mejores resultados',
    page: 'Página',
    first: 'Primera',
    previous: 'Anterior',
    next: 'Siguiente',
    last: 'Última',
    funnelAnalytics: 'Analítica del embudo',
    recentEvents: 'Eventos recientes',
  },
  de: {
    ...enReportsText,
    reports: 'Berichte',
    range: 'Zeitraum',
    search: 'Suche',
    exhibitor: 'Aussteller',
    dates: 'Daten',
    customDateRange: 'Benutzerdefinierter Zeitraum',
    allTime: 'Gesamtzeitraum',
    downloadCsv: 'CSV herunterladen',
    downloadXlsx: 'XLSX herunterladen',
    searchExhibitors: 'Aussteller suchen',
    clearAllFilters: 'Filter löschen',
    applyFilters: 'Filter anwenden',
    overview: 'Übersicht',
    totalEvents: 'Ereignisse gesamt',
    exhibitorsSeen: 'Aussteller gesehen',
    generatorOpens: 'Generator-Aufrufe',
    exportsSucceeded: 'Exporte erfolgreich',
    exportsFailed: 'Exporte fehlgeschlagen',
    conversionRate: 'Konversionsrate',
    needsAttention: 'Benötigt Aufmerksamkeit',
    failedExports: 'Fehlgeschlagene Exporte',
    company: 'Firma',
    exhibitorId: 'Aussteller-ID',
    links: 'Links',
    opens: 'Aufrufe',
    exports: 'Exporte',
    issue: 'Problem',
    action: 'Aktion',
    viewDetails: 'Details anzeigen',
    exhibitorExplorer: 'Aussteller-Explorer',
    allExhibitors: 'Alle Aussteller',
    activeOnly: 'Nur aktive',
    topPerformers: 'Top-Performer',
    page: 'Seite',
    first: 'Erste',
    previous: 'Zurück',
    next: 'Weiter',
    last: 'Letzte',
    funnelAnalytics: 'Funnel-Analyse',
    recentEvents: 'Aktuelle Ereignisse',
  },
  fr: {
    ...enReportsText,
    reports: 'Rapports',
    range: 'Période',
    search: 'Recherche',
    exhibitor: 'Exposant',
    dates: 'Dates',
    customDateRange: 'Plage de dates personnalisée',
    allTime: 'Tout',
    downloadCsv: 'Télécharger CSV',
    downloadXlsx: 'Télécharger XLSX',
    searchExhibitors: 'Rechercher des exposants',
    clearAllFilters: 'Effacer les filtres',
    applyFilters: 'Appliquer les filtres',
    overview: 'Vue d’ensemble',
    totalEvents: 'Événements totaux',
    exhibitorsSeen: 'Exposants vus',
    generatorOpens: 'Ouvertures du générateur',
    exportsSucceeded: 'Exports réussis',
    exportsFailed: 'Exports échoués',
    conversionRate: 'Taux de conversion',
    needsAttention: 'À surveiller',
    failedExports: 'Exports échoués',
    company: 'Entreprise',
    exhibitorId: 'ID exposant',
    links: 'Liens',
    opens: 'Ouvertures',
    exports: 'Exports',
    issue: 'Problème',
    action: 'Action',
    viewDetails: 'Voir détails',
    exhibitorExplorer: 'Explorateur exposants',
    allExhibitors: 'Tous les exposants',
    activeOnly: 'Actifs seulement',
    topPerformers: 'Meilleurs résultats',
    page: 'Page',
    first: 'Premier',
    previous: 'Précédent',
    next: 'Suivant',
    last: 'Dernier',
    funnelAnalytics: 'Analyse du tunnel',
    recentEvents: 'Événements récents',
  },
  it: {
    ...enReportsText,
    reports: 'Report',
    range: 'Intervallo',
    search: 'Cerca',
    exhibitor: 'Espositore',
    dates: 'Date',
    customDateRange: 'Intervallo date personalizzato',
    allTime: 'Tutto il periodo',
    downloadCsv: 'Scarica CSV',
    downloadXlsx: 'Scarica XLSX',
    searchExhibitors: 'Cerca espositori',
    clearAllFilters: 'Cancella filtri',
    applyFilters: 'Applica filtri',
    overview: 'Panoramica',
    totalEvents: 'Eventi totali',
    exhibitorsSeen: 'Espositori visti',
    generatorOpens: 'Aperture generatore',
    exportsSucceeded: 'Esportazioni riuscite',
    exportsFailed: 'Esportazioni fallite',
    conversionRate: 'Tasso di conversione',
    needsAttention: 'Richiede attenzione',
    failedExports: 'Esportazioni fallite',
    company: 'Azienda',
    exhibitorId: 'ID espositore',
    links: 'Link',
    opens: 'Aperture',
    exports: 'Esportazioni',
    issue: 'Problema',
    action: 'Azione',
    viewDetails: 'Vedi dettagli',
    exhibitorExplorer: 'Esploratore espositori',
    allExhibitors: 'Tutti gli espositori',
    activeOnly: 'Solo attivi',
    topPerformers: 'Migliori risultati',
    page: 'Pagina',
    first: 'Prima',
    previous: 'Precedente',
    next: 'Successiva',
    last: 'Ultima',
    funnelAnalytics: 'Analisi funnel',
    recentEvents: 'Eventi recenti',
  },
  pt: {
    ...enReportsText,
    reports: 'Relatórios',
    range: 'Período',
    search: 'Busca',
    exhibitor: 'Expositor',
    dates: 'Datas',
    customDateRange: 'Intervalo personalizado',
    allTime: 'Todo o período',
    downloadCsv: 'Baixar CSV',
    downloadXlsx: 'Baixar XLSX',
    searchExhibitors: 'Buscar expositores',
    clearAllFilters: 'Limpar filtros',
    applyFilters: 'Aplicar filtros',
    overview: 'Visão geral',
    totalEvents: 'Eventos totais',
    exhibitorsSeen: 'Expositores vistos',
    generatorOpens: 'Aberturas do gerador',
    exportsSucceeded: 'Exportações bem-sucedidas',
    exportsFailed: 'Exportações com falha',
    conversionRate: 'Taxa de conversão',
    needsAttention: 'Requer atenção',
    failedExports: 'Exportações com falha',
    company: 'Empresa',
    exhibitorId: 'ID do expositor',
    links: 'Links',
    opens: 'Aberturas',
    exports: 'Exportações',
    issue: 'Problema',
    action: 'Ação',
    viewDetails: 'Ver detalhes',
    exhibitorExplorer: 'Explorador de expositores',
    allExhibitors: 'Todos os expositores',
    activeOnly: 'Somente ativos',
    topPerformers: 'Melhores resultados',
    page: 'Página',
    first: 'Primeira',
    previous: 'Anterior',
    next: 'Próxima',
    last: 'Última',
    funnelAnalytics: 'Análise de funil',
    recentEvents: 'Eventos recentes',
  },
  nl: {
    ...enReportsText,
    reports: 'Rapporten',
    range: 'Bereik',
    search: 'Zoeken',
    exhibitor: 'Exposant',
    dates: 'Datums',
    customDateRange: 'Aangepast datumbereik',
    allTime: 'Altijd',
    downloadCsv: 'CSV downloaden',
    downloadXlsx: 'XLSX downloaden',
    searchExhibitors: 'Exposanten zoeken',
    clearAllFilters: 'Filters wissen',
    applyFilters: 'Filters toepassen',
    overview: 'Overzicht',
    totalEvents: 'Totaal gebeurtenissen',
    exhibitorsSeen: 'Exposanten gezien',
    generatorOpens: 'Generator geopend',
    exportsSucceeded: 'Exports geslaagd',
    exportsFailed: 'Exports mislukt',
    conversionRate: 'Conversieratio',
    needsAttention: 'Aandacht nodig',
    failedExports: 'Mislukte exports',
    company: 'Bedrijf',
    exhibitorId: 'Exposant-ID',
    links: 'Links',
    opens: 'Openingen',
    exports: 'Exports',
    issue: 'Probleem',
    action: 'Actie',
    viewDetails: 'Details bekijken',
    exhibitorExplorer: 'Exposantenverkenner',
    allExhibitors: 'Alle exposanten',
    activeOnly: 'Alleen actief',
    topPerformers: 'Toppresteerders',
    page: 'Pagina',
    first: 'Eerste',
    previous: 'Vorige',
    next: 'Volgende',
    last: 'Laatste',
    funnelAnalytics: 'Funnelanalyse',
    recentEvents: 'Recente gebeurtenissen',
  },
  'zh-CN': {
    ...enReportsText,
    reports: '报告',
    range: '范围',
    search: '搜索',
    exhibitor: '参展商',
    dates: '日期',
    customDateRange: '自定义日期范围',
    allTime: '全部时间',
    downloadCsv: '下载 CSV',
    downloadXlsx: '下载 XLSX',
    searchExhibitors: '搜索参展商',
    clearAllFilters: '清除所有筛选',
    applyFilters: '应用筛选',
    overview: '概览',
    totalEvents: '事件总数',
    exhibitorsSeen: '参展商数量',
    generatorOpens: '生成器打开次数',
    exportsSucceeded: '成功导出',
    exportsFailed: '导出失败',
    conversionRate: '转化率',
    needsAttention: '需要关注',
    failedExports: '导出失败',
    company: '公司',
    exhibitorId: '参展商 ID',
    links: '链接',
    opens: '打开',
    exports: '导出',
    issue: '问题',
    action: '操作',
    viewDetails: '查看详情',
    exhibitorExplorer: '参展商浏览器',
    allExhibitors: '所有参展商',
    activeOnly: '仅活跃',
    topPerformers: '表现最佳',
    page: '页面',
    first: '第一页',
    previous: '上一页',
    next: '下一页',
    last: '最后一页',
    funnelAnalytics: '漏斗分析',
    recentEvents: '最近事件',
  },
}

const RANGE_OPTIONS = [
  { labelKey: 'last7', value: '7d' },
  { labelKey: 'last30', value: '30d' },
  { labelKey: 'last90', value: '90d' },
  { labelKey: 'all', value: 'all' },
] as const

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250] as const

const CHART_COLORS = {
  blue: '#60a5fa',
  violet: '#a78bfa',
  green: '#34d399',
  amber: '#f59e0b',
  red: '#f87171',
  grid: '#3f3f46',
  axis: '#a1a1aa',
}

function getRangeLabel(value: string, text: ReportsText): string {
  switch (value) {
    case '7d':
      return text.reports === 'Reports' ? 'Last 7 days' : '7 days'
    case '30d':
      return text.reports === 'Reports' ? 'Last 30 days' : '30 days'
    case '90d':
      return text.reports === 'Reports' ? 'Last 90 days' : '90 days'
    case 'all':
    default:
      return text.allTime
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatDate(value: string | null): string {
  if (!value) return '—'

  try {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
      date.getUTCDate()
    )} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(
      date.getUTCSeconds()
    )} UTC`
  } catch {
    return value
  }
}

function formatShortDate(value: string): string {
  try {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return value
    }

    return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}`
  } catch {
    return value
  }
}

function formatFormatLabel(format: string): string {
  switch (format) {
    case 'png-linkedin':
      return 'PNG LinkedIn'
    case 'png-square':
      return 'PNG Square'
    case 'png-email':
      return 'PNG Email'
    case 'png-print':
      return 'PNG Print'
    case 'pdf':
      return 'PDF'
    case 'zip':
      return 'ZIP Marketing Pack'
    default:
      return format
  }
}

function percentage(numerator: number, denominator: number): string {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

function conversionRateValue(item: ExhibitorSummary): number {
  if (!item.generatorOpenedCount) return 0
  return Math.round((item.exportSucceededCount / item.generatorOpenedCount) * 100)
}

function buildReportsHref(args: {
  range?: string
  exhibitorId?: string | null
  q?: string | null
  startDate?: string | null
  endDate?: string | null
}) {
  const params = new URLSearchParams()

  const startDate = args.startDate?.trim()
  const endDate = args.endDate?.trim()

  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)

  if (!startDate && !endDate && args.range && args.range !== 'all') {
    params.set('range', args.range)
  }

  if (args.exhibitorId) params.set('exhibitorId', args.exhibitorId)

  const searchQuery = args.q?.trim()
  if (searchQuery) params.set('q', searchQuery)

  const query = params.toString()
  return query ? `/reports?${query}` : '/reports'
}

function buildExhibitorDetailHref(
  exhibitorId: string,
  args?: {
    range?: string
    startDate?: string | null
    endDate?: string | null
  }
) {
  const params = new URLSearchParams()

  const startDate = args?.startDate?.trim()
  const endDate = args?.endDate?.trim()

  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)

  if (!startDate && !endDate && args?.range && args.range !== 'all') {
    params.set('range', args.range)
  }

  const query = params.toString()
  return query
    ? `/reports/exhibitors/${encodeURIComponent(exhibitorId)}?${query}`
    : `/reports/exhibitors/${encodeURIComponent(exhibitorId)}`
}

function getCsvHref(
  range?: string,
  exhibitorId?: string | null,
  q?: string | null,
  startDate?: string | null,
  endDate?: string | null
): string {
  const params = new URLSearchParams()

  const normalizedStartDate = startDate?.trim()
  const normalizedEndDate = endDate?.trim()

  if (normalizedStartDate) params.set('startDate', normalizedStartDate)
  if (normalizedEndDate) params.set('endDate', normalizedEndDate)

  if (!normalizedStartDate && !normalizedEndDate && range && range !== 'all') {
    params.set('range', range)
  }

  if (exhibitorId) params.set('exhibitorId', exhibitorId)

  const searchQuery = q?.trim()
  if (searchQuery) params.set('q', searchQuery)

  const query = params.toString()
  return query ? `/api/reports/csv?${query}` : '/api/reports/csv'
}

function getXlsxHref(
  range?: string,
  exhibitorId?: string | null,
  q?: string | null,
  startDate?: string | null,
  endDate?: string | null
): string {
  const params = new URLSearchParams()

  const normalizedStartDate = startDate?.trim()
  const normalizedEndDate = endDate?.trim()

  if (normalizedStartDate) params.set('startDate', normalizedStartDate)
  if (normalizedEndDate) params.set('endDate', normalizedEndDate)

  if (!normalizedStartDate && !normalizedEndDate && range && range !== 'all') {
    params.set('range', range)
  }

  if (exhibitorId) params.set('exhibitorId', exhibitorId)

  const searchQuery = q?.trim()
  if (searchQuery) params.set('q', searchQuery)

  const query = params.toString()
  return query ? `/api/reports/xlsx?${query}` : '/api/reports/xlsx'
}

function compareValues(
  a: ExhibitorSummary,
  b: ExhibitorSummary,
  sortKey: SortKey,
  sortDirection: SortDirection
): number {
  let result = 0

  switch (sortKey) {
    case 'companyName':
      result = a.companyName.localeCompare(b.companyName)
      break
    case 'exhibitorId':
      result = a.exhibitorId.localeCompare(b.exhibitorId)
      break
    case 'totalEvents':
      result = a.totalEvents - b.totalEvents
      break
    case 'generatorOpenedCount':
      result = a.generatorOpenedCount - b.generatorOpenedCount
      break
    case 'exportSucceededCount':
      result = a.exportSucceededCount - b.exportSucceededCount
      break
    case 'exportFailedCount':
      result = a.exportFailedCount - b.exportFailedCount
      break
    case 'conversionRate':
      result = conversionRateValue(a) - conversionRateValue(b)
      break
    case 'lastActivityAt': {
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      result = aTime - bTime
      break
    }
  }

  return sortDirection === 'asc' ? result : -result
}

function getConversionRate(opens: number, exports: number) {
  if (!opens) return 0
  return exports / opens
}

function buildLeaderboard(rows: ExhibitorSummary[]) {
  return [...rows]
    .map((row) => ({
      ...row,
      conversion: getConversionRate(
        row.generatorOpenedCount,
        row.exportSucceededCount
      ),
    }))
    .sort((a, b) => {
      if (b.conversion !== a.conversion) return b.conversion - a.conversion
      if (b.exportSucceededCount !== a.exportSucceededCount) {
        return b.exportSucceededCount - a.exportSucceededCount
      }
      return a.companyName.localeCompare(b.companyName)
    })
}

function buildNeedsAttention(rows: ExhibitorSummary[]) {
  return rows.filter((row) => {
    const opens = row.generatorOpenedCount
    const exports = row.exportSucceededCount

    return (
      (opens > 0 && exports === 0) ||
      (row.linkGeneratedCount > 0 && exports === 0)
    )
  })
}

function buildConversionBuckets(rows: ExhibitorSummary[]) {
  const buckets = {
    zero: 0,
    low: 0,
    medium: 0,
    high: 0,
  }

  for (const row of rows) {
    const rate = getConversionRate(
      row.generatorOpenedCount,
      row.exportSucceededCount
    )

    if (rate === 0) buckets.zero++
    else if (rate <= 0.25) buckets.low++
    else if (rate <= 0.5) buckets.medium++
    else buckets.high++
  }

  return buckets
}

function getLastActiveStatus(
  value: string | null,
  text: ReportsText
): {
  label: string
  className: string
} {
  if (!value) {
    return {
      label: text.noActivity,
      className: 'bg-neutral-800 text-neutral-300',
    }
  }

  const timestamp = new Date(value).getTime()

  if (Number.isNaN(timestamp)) {
    return {
      label: text.unknown,
      className: 'bg-neutral-800 text-neutral-300',
    }
  }

  const now = Date.now()
  const diffMs = now - timestamp
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay

  if (diffMs <= oneDay) {
    return {
      label: text.activeToday,
      className: 'bg-emerald-500/15 text-emerald-300',
    }
  }

  if (diffMs <= sevenDays) {
    return {
      label: text.activeThisWeek,
      className: 'bg-blue-500/15 text-blue-300',
    }
  }

  return {
    label: text.inactive,
    className: 'bg-amber-500/15 text-amber-300',
  }
}

function Card({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={`rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.025))] shadow-[0_20px_80px_rgba(0,0,0,0.42)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  )
}

function ChartCard({
  title,
  description,
  emptyMessage,
  hasData,
  chartsReady,
  children,
  loadingMessage,
}: {
  title: string
  description: string
  emptyMessage: string
  hasData: boolean
  chartsReady: boolean
  children: ReactNode
  loadingMessage: string
}) {
  return (
    <Card className="min-w-0 p-6 sm:p-7">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm leading-6 text-neutral-400">{description}</p>
      </div>

      <div className="mt-8 h-[360px] min-w-0">
        {!hasData ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-neutral-500">
            {emptyMessage}
          </div>
        ) : !chartsReady ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-sm text-neutral-500">
            {loadingMessage}
          </div>
        ) : (
          <div className="h-full min-w-0 rounded-2xl border border-white/5 bg-black/10 p-2">
            {children}
          </div>
        )}
      </div>
    </Card>
  )
}

function KpiCard({
  label,
  value,
  sublabel,
  tone = 'default',
}: {
  label: string
  value: string | number
  sublabel: string
  tone?: 'default' | 'green' | 'blue' | 'amber' | 'red'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-500/25 bg-emerald-500/[0.08]'
      : tone === 'blue'
      ? 'border-blue-500/25 bg-blue-500/[0.08]'
      : tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/[0.08]'
      : tone === 'red'
      ? 'border-red-500/25 bg-red-500/[0.08]'
      : 'border-white/10 bg-white/[0.035]'

  return (
    <div className={`rounded-3xl border px-5 py-5 ${toneClasses}`}>
      <div className="text-sm font-medium text-neutral-300">{label}</div>
      <div className="mt-4 text-4xl font-semibold leading-none text-white">
        {value}
      </div>
      <div className="mt-3 text-xs leading-5 text-neutral-500">{sublabel}</div>
    </div>
  )
}

function CompactFocusCard({
  title,
  subtitle,
  value,
  onClick,
  tone,
}: {
  title: string
  subtitle: string
  value: string
  onClick: () => void
  tone: 'red' | 'green' | 'amber' | 'blue'
}) {
  const toneClasses =
    tone === 'red'
      ? 'border-red-500/25 bg-red-500/[0.08] hover:bg-red-500/[0.12]'
      : tone === 'green'
      ? 'border-emerald-500/25 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]'
      : tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/[0.08] hover:bg-amber-500/[0.12]'
      : 'border-blue-500/25 bg-blue-500/[0.08] hover:bg-blue-500/[0.12]'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border px-5 py-5 text-left transition ${toneClasses}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-200">{title}</div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-400">
            {subtitle}
          </p>
        </div>
        <div className="shrink-0 text-3xl font-semibold leading-none text-white">
          {value}
        </div>
      </div>
    </button>
  )
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const toneClasses =
    insight.tone === 'green'
      ? 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-300'
      : insight.tone === 'blue'
      ? 'border-blue-500/25 bg-blue-500/[0.08] text-blue-300'
      : insight.tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/[0.08] text-amber-300'
      : 'border-red-500/25 bg-red-500/[0.08] text-red-300'

  return (
    <div className={`rounded-3xl border p-5 ${toneClasses}`}>
      <div className="text-sm font-medium">{insight.title}</div>
      <div className="mt-3 truncate text-2xl font-semibold text-white">
        {insight.value}
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-400">
        {insight.description}
      </p>
    </div>
  )
}

function ExportHealthCard({
  label,
  value,
  description,
  tone,
}: {
  label: string
  value: string | number
  description: string
  tone: 'green' | 'blue' | 'amber' | 'red'
}) {
  const toneClasses =
    tone === 'green'
      ? 'border-emerald-500/25 bg-emerald-500/[0.08]'
      : tone === 'blue'
      ? 'border-blue-500/25 bg-blue-500/[0.08]'
      : tone === 'amber'
      ? 'border-amber-500/25 bg-amber-500/[0.08]'
      : 'border-red-500/25 bg-red-500/[0.08]'

  return (
    <div className={`rounded-3xl border p-5 ${toneClasses}`}>
      <div className="text-sm font-medium text-neutral-300">{label}</div>
      <div className="mt-3 truncate text-3xl font-semibold leading-none text-white">
        {value}
      </div>
      <p className="mt-3 text-sm leading-6 text-neutral-400">{description}</p>
    </div>
  )
}

function ToolbarPill({
  active,
  children,
  href,
}: {
  active: boolean
  children: ReactNode
  href: string
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  )
}

function FocusChip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-white bg-white text-black'
          : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  )
}

function ExportButton({
  href,
  children,
  tone,
}: {
  href: string
  children: ReactNode
  tone: 'green' | 'blue'
}) {
  const className =
    tone === 'green'
      ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500'
      : 'border-blue-500 bg-blue-600 text-white hover:bg-blue-500'

  return (
    <a
      href={href}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${className}`}
    >
      {children}
    </a>
  )
}

export default function ReportsClient({
  summary,
  currentRange,
  currentExhibitorId,
  currentSearchQuery,
}: Props) {
  const [language] = useSiteLanguage()
  const text = reportsText[language] ?? reportsText.en

  const [search, setSearch] = useState(currentSearchQuery)
  const [chartsReady, setChartsReady] = useState(false)
  const [exhibitorPickerValue, setExhibitorPickerValue] = useState(
    summary.appliedExhibitorId
      ? `${summary.appliedExhibitorName ?? summary.appliedExhibitorId} (${summary.appliedExhibitorId})`
      : ''
  )

  const [sortKey, setSortKey] = useState<SortKey>('totalEvents')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [pageSize, setPageSize] = useState<number>(50)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [focusFilter, setFocusFilter] = useState<FocusFilter>('all')
  const [needsAttentionExpanded, setNeedsAttentionExpanded] = useState(false)

  useEffect(() => {
    setChartsReady(true)
  }, [])

  const topExhibitorsChartData = useMemo(() => {
    return summary.exhibitorSummaries.slice(0, 12).map((item) => ({
      name:
        item.companyName.length > 16
          ? `${item.companyName.slice(0, 16)}…`
          : item.companyName,
      totalEvents: item.totalEvents,
      opens: item.generatorOpenedCount,
      exports: item.exportSucceededCount,
    }))
  }, [summary.exhibitorSummaries])

  const formatUsageChartData = useMemo(() => {
    return Object.entries(summary.formatUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([format, count]) => ({
        format: formatFormatLabel(format),
        count,
      }))
  }, [summary.formatUsage])

  const exportFormatRows = useMemo<ExportFormatRow[]>(() => {
    return Object.entries(summary.formatUsage)
      .sort((a, b) => b[1] - a[1])
      .map(([format, count]) => ({
        format,
        label: formatFormatLabel(format),
        count,
        share: percentage(count, summary.totalExportsSucceeded),
      }))
  }, [summary.formatUsage, summary.totalExportsSucceeded])

  const mostUsedFormat = exportFormatRows[0] ?? null
  const leastUsedFormat =
    exportFormatRows.length > 0 ? exportFormatRows[exportFormatRows.length - 1] : null

  const totalExportAttempts =
    summary.totalExportsSucceeded + summary.totalExportsFailed

  const exportSuccessRate = percentage(
    summary.totalExportsSucceeded,
    totalExportAttempts
  )

  const exportFailureRate = percentage(
    summary.totalExportsFailed,
    totalExportAttempts
  )

  const dailyChartData = useMemo(() => {
    return summary.dailySeries.map((item) => ({
      ...item,
      label: formatShortDate(item.date),
    }))
  }, [summary.dailySeries])

  const funnelRows = useMemo(() => {
    return summary.funnel.steps.map((step) => ({
      key: step.key,
      label: step.label,
      count: step.count,
      rateFromPrevious: step.rateFromPrevious,
      rateFromStart: step.rateFromStart,
    }))
  }, [summary.funnel.steps])

  const filteredAvailableExhibitors = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return summary.availableExhibitors

    return summary.availableExhibitors.filter((item) => {
      return (
        item.companyName.toLowerCase().includes(q) ||
        item.exhibitorId.toLowerCase().includes(q)
      )
    })
  }, [search, summary.availableExhibitors])

  const exhibitorOptions = useMemo(() => {
    return summary.availableExhibitors.map((item) => ({
      ...item,
      label: `${item.companyName} (${item.exhibitorId})`,
    }))
  }, [summary.availableExhibitors])

  const leaderboard = useMemo(() => {
    return buildLeaderboard(summary.exhibitorSummaries)
  }, [summary.exhibitorSummaries])

  const needsAttention = useMemo(() => {
    return buildNeedsAttention(summary.exhibitorSummaries)
  }, [summary.exhibitorSummaries])

  const conversionBuckets = useMemo(() => {
    return buildConversionBuckets(summary.exhibitorSummaries)
  }, [summary.exhibitorSummaries])

  const topPerformer = leaderboard[0] ?? null
  const zeroConversionCount = conversionBuckets.zero

  const focusedExhibitorRows = useMemo(() => {
    switch (focusFilter) {
      case 'needsAttention':
        return summary.exhibitorSummaries.filter((item) => {
          const opens = item.generatorOpenedCount
          const exports = item.exportSucceededCount
          return (
            (opens > 0 && exports === 0) ||
            (item.linkGeneratedCount > 0 && exports === 0)
          )
        })
      case 'zeroConversion':
        return summary.exhibitorSummaries.filter(
          (item) => conversionRateValue(item) === 0
        )
      case 'failedExports':
        return summary.exhibitorSummaries.filter(
          (item) => item.exportFailedCount > 0
        )
      case 'topPerformers':
        return leaderboard.slice(0, 50)
      case 'activeOnly':
        return summary.exhibitorSummaries.filter((item) => item.totalEvents > 0)
      case 'all':
      default:
        return summary.exhibitorSummaries
    }
  }, [focusFilter, summary.exhibitorSummaries, leaderboard])

  const sortedExhibitorRows = useMemo(() => {
    const copy = [...focusedExhibitorRows]
    copy.sort((a, b) => compareValues(a, b, sortKey, sortDirection))
    return copy
  }, [focusedExhibitorRows, sortKey, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [focusFilter, pageSize, search])

  const totalPages = Math.max(1, Math.ceil(sortedExhibitorRows.length / pageSize))

  const paginatedExhibitorRows = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const startIndex = (safePage - 1) * pageSize
    return sortedExhibitorRows.slice(startIndex, startIndex + pageSize)
  }, [sortedExhibitorRows, currentPage, totalPages, pageSize])

  const tableStartIndex =
    sortedExhibitorRows.length === 0
      ? 0
      : (Math.min(currentPage, totalPages) - 1) * pageSize + 1

  const tableEndIndex = Math.min(
    Math.min(currentPage, totalPages) * pageSize,
    sortedExhibitorRows.length
  )

  const visibleNeedsAttentionRows = needsAttentionExpanded
    ? needsAttention
    : needsAttention.slice(0, 5)

  function handleApplyExhibitorFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalized = exhibitorPickerValue.trim().toLowerCase()

    if (!normalized) {
      window.location.href = buildReportsHref({
        range: currentRange,
        q: currentSearchQuery,
        startDate: summary.appliedStartDate,
        endDate: summary.appliedEndDate,
      })
      return
    }

    const matchedExhibitor = exhibitorOptions.find((item) => {
      return (
        item.label.toLowerCase() === normalized ||
        item.exhibitorId.toLowerCase() === normalized ||
        item.companyName.toLowerCase() === normalized
      )
    })

    if (!matchedExhibitor) return

    window.location.href = buildReportsHref({
      range: currentRange,
      exhibitorId: matchedExhibitor.exhibitorId,
      q: currentSearchQuery,
      startDate: summary.appliedStartDate,
      endDate: summary.appliedEndDate,
    })
  }

  function handleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(nextKey)
      setSortDirection(
        nextKey === 'companyName' || nextKey === 'exhibitorId' ? 'asc' : 'desc'
      )
    }
    setCurrentPage(1)
  }

  function sortIndicator(column: SortKey) {
    if (sortKey !== column) return ''
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  function activateFocusFilter(nextFilter: FocusFilter) {
    setFocusFilter(nextFilter)

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const tableSection = document.getElementById('exhibitor-explorer')
        tableSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    }
  }

  function focusLabel(filter: FocusFilter) {
    switch (filter) {
      case 'activeOnly':
        return text.activeOnly
      case 'needsAttention':
        return text.needsAttention
      case 'zeroConversion':
        return text.zeroConversion
      case 'failedExports':
        return text.failedExports
      case 'topPerformers':
        return text.topPerformers
      case 'all':
      default:
        return text.allExhibitors
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#090909_42%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {text.reports}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
                <span>
                  {text.range}:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedStartDate || summary.appliedEndDate
                      ? text.customDateRange
                      : getRangeLabel(currentRange, text)}
                  </span>
                </span>
                <span>
                  {text.search}:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedSearchQuery || '—'}
                  </span>
                </span>
                <span>
                  {text.exhibitor}:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedExhibitorName
                      ? `${summary.appliedExhibitorName} (${summary.appliedExhibitorId})`
                      : '—'}
                  </span>
                </span>
                <span>
                  {text.dates}:{' '}
                  <span className="font-medium text-white">
                    {summary.appliedStartDate || summary.appliedEndDate
                      ? `${summary.appliedStartDate ?? text.open} → ${summary.appliedEndDate ?? text.open}`
                      : '—'}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.map((option) => {
                const isActive =
                  !summary.appliedStartDate &&
                  !summary.appliedEndDate &&
                  option.value === currentRange

                return (
                  <ToolbarPill
                    key={option.value}
                    active={isActive}
                    href={buildReportsHref({
                      range: option.value,
                      exhibitorId: currentExhibitorId,
                      q: currentSearchQuery,
                    })}
                  >
                    {getRangeLabel(option.value, text)}
                  </ToolbarPill>
                )
              })}

              <ExportButton
                tone="green"
                href={getCsvHref(
                  currentRange,
                  currentExhibitorId,
                  currentSearchQuery,
                  summary.appliedStartDate,
                  summary.appliedEndDate
                )}
              >
                {text.downloadCsv}
              </ExportButton>

              <ExportButton
                tone="blue"
                href={getXlsxHref(
                  currentRange,
                  currentExhibitorId,
                  currentSearchQuery,
                  summary.appliedStartDate,
                  summary.appliedEndDate
                )}
              >
                {text.downloadXlsx}
              </ExportButton>
            </div>
          </div>
        </div>

        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {text.searchExhibitors}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                {text.searchExhibitorsDescription}
              </p>
            </div>

            {(summary.appliedSearchQuery ||
              summary.appliedExhibitorId ||
              summary.appliedStartDate ||
              summary.appliedEndDate) ? (
              <Link
                href="/reports"
                className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
              >
                {text.clearAllFilters}
              </Link>
            ) : null}
          </div>

          <form
            method="get"
            action="/reports"
            className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end"
          >
            <div>
              <label htmlFor="report-search" className="mb-2 block text-sm font-medium text-neutral-300">
                {text.companyNameOrExhibitorId}
              </label>
              <input
                id="report-search"
                name="q"
                type="text"
                placeholder={text.searchAcrossReports}
                defaultValue={currentSearchQuery}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/25"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-neutral-300">
                {text.startDate}
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={summary.appliedStartDate ?? ''}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-neutral-300">
                {text.endDate}
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={summary.appliedEndDate ?? ''}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
              />
            </div>

            <div>
              <input type="hidden" name="range" value={currentRange} />
              {currentExhibitorId ? (
                <input type="hidden" name="exhibitorId" value={currentExhibitorId} />
              ) : null}
              <button
                type="submit"
                className="w-full rounded-2xl border border-white bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200 lg:w-auto"
              >
                {text.applyFilters}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleApplyExhibitorFilter}
            className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
          >
            <div>
              <label htmlFor="exhibitor-picker" className="mb-2 block text-sm font-medium text-neutral-300">
                {text.selectOneExhibitor}
              </label>
              <input
                id="exhibitor-picker"
                list="exhibitor-picker-options"
                type="text"
                value={exhibitorPickerValue}
                onChange={(event) => setExhibitorPickerValue(event.target.value)}
                placeholder={text.selectOneExhibitorPlaceholder}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/25"
              />
              <datalist id="exhibitor-picker-options">
                {exhibitorOptions.map((item) => (
                  <option key={item.exhibitorId} value={item.label} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
            >
              {text.applyExhibitor}
            </button>
          </form>

          <div className="mt-4 text-sm text-neutral-500">
            {text.matchingAvailableExhibitors}: {filteredAvailableExhibitors.length}
          </div>
        </Card>

        {summary.insights && summary.insights.length > 0 ? (
          <Card className="p-6 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {text.topInsights}
                </h2>
                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  {text.topInsightsDescription}
                </p>
              </div>
              <div className="text-sm text-neutral-500">
                {summary.insights.length} {text.insightsGenerated}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {summary.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {text.exportAnalytics}
              </h2>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                {text.exportAnalyticsDescription}
              </p>
            </div>
            <div className="text-sm text-neutral-500">
              {totalExportAttempts} {text.exportAttemptsTracked}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ExportHealthCard
              label={text.mostUsedFormat}
              value={mostUsedFormat ? mostUsedFormat.label : '—'}
              description={
                mostUsedFormat
                  ? `${mostUsedFormat.count} ${text.exportsRecordedForFormat} ${mostUsedFormat.share} ${text.ofSuccessfulExports}`
                  : text.noFormatUsage
              }
              tone="blue"
            />

            <ExportHealthCard
              label={text.leastUsedFormat}
              value={leastUsedFormat ? leastUsedFormat.label : '—'}
              description={
                leastUsedFormat
                  ? `${leastUsedFormat.count} ${text.exportsRecordedForFormat} ${leastUsedFormat.share} ${text.ofSuccessfulExports}`
                  : text.noFormatUsage
              }
              tone="amber"
            />

            <ExportHealthCard
              label={text.exportSuccessRate}
              value={exportSuccessRate}
              description={`${summary.totalExportsSucceeded} ${text.successfulExportsFromAttempts} ${totalExportAttempts} ${text.total}.`}
              tone="green"
            />

            <ExportHealthCard
              label={text.exportFailureRate}
              value={exportFailureRate}
              description={`${summary.totalExportsFailed} ${text.failedExportsFromAttempts} ${totalExportAttempts} ${text.total}.`}
              tone={summary.totalExportsFailed > 0 ? 'red' : 'green'}
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-white/[0.04]">
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-5 py-3 font-medium text-neutral-300">{text.format}</th>
                    <th className="px-5 py-3 font-medium text-neutral-300">{text.successfulExports}</th>
                    <th className="px-5 py-3 font-medium text-neutral-300">{text.share}</th>
                  </tr>
                </thead>
                <tbody>
                  {exportFormatRows.length === 0 ? (
                    <tr>
                      <td className="px-5 py-5 text-neutral-500" colSpan={3}>
                        {text.noFormatUsage}
                      </td>
                    </tr>
                  ) : (
                    exportFormatRows.map((row) => (
                      <tr key={row.format} className="border-b border-white/5 last:border-b-0">
                        <td className="px-5 py-4 font-medium text-white">{row.label}</td>
                        <td className="px-5 py-4 text-neutral-300">{row.count}</td>
                        <td className="px-5 py-4 text-neutral-300">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{
                                  width: row.share,
                                }}
                              />
                            </div>
                            <span>{row.share}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">{text.overview}</h2>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <KpiCard
              label={text.totalEvents}
              value={summary.totalEvents}
              sublabel={text.allTrackedActivity}
            />
            <KpiCard
              label={text.exhibitorsSeen}
              value={summary.totalExhibitors}
              sublabel={text.uniqueExhibitors}
            />
            <KpiCard
              label={text.generatorOpens}
              value={summary.totalGeneratorOpens}
              sublabel={text.sessionsOpened}
              tone="blue"
            />
            <KpiCard
              label={text.exportsSucceeded}
              value={summary.totalExportsSucceeded}
              sublabel={text.successfulExports}
              tone="green"
            />
            <KpiCard
              label={text.exportsFailed}
              value={summary.totalExportsFailed}
              sublabel={text.failedExports}
              tone="red"
            />
            <KpiCard
              label={text.openToExport}
              value={summary.conversionRate}
              sublabel={text.conversionRate}
              tone="amber"
            />
          </section>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CompactFocusCard
            title={text.needsAttention}
            value={String(needsAttention.length)}
            subtitle={text.needsAttentionDescription}
            onClick={() => activateFocusFilter('needsAttention')}
            tone="red"
          />

          <CompactFocusCard
            title={text.topConversion}
            value={
              topPerformer
                ? `${Math.round(
                    getConversionRate(
                      topPerformer.generatorOpenedCount,
                      topPerformer.exportSucceededCount
                    ) * 100
                  )}%`
                : '0%'
            }
            subtitle={topPerformer ? topPerformer.companyName : text.noExhibitorDataYet}
            onClick={() => activateFocusFilter('topPerformers')}
            tone="green"
          />

          <CompactFocusCard
            title={text.zeroConversion}
            value={String(zeroConversionCount)}
            subtitle={text.zeroConversionDescription}
            onClick={() => activateFocusFilter('zeroConversion')}
            tone="amber"
          />

          <CompactFocusCard
            title={text.failedExports}
            value={String(summary.totalExportsFailed)}
            subtitle={text.failedExportsDescription}
            onClick={() => activateFocusFilter('failedExports')}
            tone="blue"
          />
        </section>

        <section className="grid gap-10 xl:grid-cols-2">
          <ChartCard
            title={text.topExhibitorsByActivity}
            description={text.topExhibitorsByActivityDescription}
            emptyMessage={text.noExhibitorActivityToChart}
            hasData={topExhibitorsChartData.length > 0}
            chartsReady={chartsReady}
            loadingMessage={text.loadingChart}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={topExhibitorsChartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 72 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis
                    dataKey="name"
                    angle={-24}
                    textAnchor="end"
                    height={84}
                    interval={0}
                    stroke={CHART_COLORS.axis}
                  />
                  <YAxis stroke={CHART_COLORS.axis} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="exports" name={text.exportSucceededLegend} fill={CHART_COLORS.green} isAnimationActive={false} />
                  <Bar dataKey="opens" name={text.generatorOpenLegend} fill={CHART_COLORS.violet} isAnimationActive={false} />
                  <Bar dataKey="totalEvents" name={text.totalEventLegend} fill={CHART_COLORS.blue} isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>

          <ChartCard
            title={text.exportFormatUsage}
            description={text.exportFormatUsageDescription}
            emptyMessage={text.noExportDataToChart}
            hasData={formatUsageChartData.length > 0}
            chartsReady={chartsReady}
            loadingMessage={text.loadingChart}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <BarChart
                  width={width}
                  height={height}
                  data={formatUsageChartData}
                  margin={{ top: 12, right: 12, left: 0, bottom: 72 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis
                    dataKey="format"
                    angle={-22}
                    textAnchor="end"
                    height={84}
                    interval={0}
                    stroke={CHART_COLORS.axis}
                  />
                  <YAxis stroke={CHART_COLORS.axis} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
                  <Bar dataKey="count" name={text.count} fill={CHART_COLORS.amber} isAnimationActive={false} />
                </BarChart>
              )}
            </MeasuredChart>
          </ChartCard>
        </section>

        <section className="grid gap-10 xl:grid-cols-2">
          <ChartCard
            title={text.generatorOpensOverTime}
            description={text.generatorOpensOverTimeDescription}
            emptyMessage={text.selectDateRangeToViewDailyCharts}
            hasData={dailyChartData.length > 0}
            chartsReady={chartsReady}
            loadingMessage={text.loadingChart}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <LineChart
                  width={width}
                  height={height}
                  data={dailyChartData}
                  margin={{ top: 12, right: 16, left: 0, bottom: 44 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="label" stroke={CHART_COLORS.axis} />
                  <YAxis stroke={CHART_COLORS.axis} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
                  <Line
                    type="monotone"
                    dataKey="exportsSucceeded"
                    name={text.exportSucceededLegend}
                    stroke={CHART_COLORS.green}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="generatorOpened"
                    name={text.generatorOpenLegend}
                    stroke={CHART_COLORS.blue}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </MeasuredChart>
          </ChartCard>

          <ChartCard
            title={text.exportFailuresOverTime}
            description={text.exportFailuresOverTimeDescription}
            emptyMessage={text.selectDateRangeToViewDailyCharts}
            hasData={dailyChartData.length > 0}
            chartsReady={chartsReady}
            loadingMessage={text.loadingChart}
          >
            <MeasuredChart>
              {({ width, height }) => (
                <LineChart
                  width={width}
                  height={height}
                  data={dailyChartData}
                  margin={{ top: 12, right: 16, left: 0, bottom: 44 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis dataKey="label" stroke={CHART_COLORS.axis} />
                  <YAxis stroke={CHART_COLORS.axis} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 16,
                      color: '#fff',
                    }}
                  />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 20 }} />
                  <Line
                    type="monotone"
                    dataKey="exportsFailed"
                    name={text.exportFailedLegend}
                    stroke={CHART_COLORS.red}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              )}
            </MeasuredChart>
          </ChartCard>
        </section>

        <Card className="p-6 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-white">{text.needsAttention}</h2>
                <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
                  {needsAttention.length}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-neutral-400">
                {text.exhibitorsWithEngagementNoExports}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNeedsAttentionExpanded((prev) => !prev)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/10"
            >
              {needsAttentionExpanded ? text.collapseTable : text.expandTable}
            </button>
          </div>

          {needsAttention.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-3xl border border-red-500/20">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-red-500/10">
                    <tr className="border-b border-red-500/20 text-left">
                      <th className="px-5 py-3 font-medium text-red-100">{text.company}</th>
                      <th className="px-5 py-3 font-medium text-red-100">{text.exhibitorId}</th>
                      <th className="px-5 py-3 font-medium text-red-100">{text.links}</th>
                      <th className="px-5 py-3 font-medium text-red-100">{text.opens}</th>
                      <th className="px-5 py-3 font-medium text-red-100">{text.exports}</th>
                      <th className="px-5 py-3 font-medium text-red-100">{text.issue}</th>
                      <th className="px-5 py-3 font-medium text-red-100">{text.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleNeedsAttentionRows.map((item) => {
                      const issueLabel =
                        item.generatorOpenedCount > 0 && item.exportSucceededCount === 0
                          ? text.openedGeneratorButNeverExported
                          : text.generatedLinksButNoSuccessfulExports

                      return (
                        <tr key={item.exhibitorId} className="border-b border-white/5 last:border-b-0">
                          <td className="px-5 py-4 text-white">{item.companyName}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.exhibitorId}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.linkGeneratedCount}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.generatorOpenedCount}</td>
                          <td className="px-5 py-4 text-neutral-300">{item.exportSucceededCount}</td>
                          <td className="px-5 py-4 text-red-200">{issueLabel}</td>
                          <td className="px-5 py-4">
                            <Link
                              href={buildExhibitorDetailHref(item.exhibitorId, {
                                range: currentRange,
                                startDate: summary.appliedStartDate,
                                endDate: summary.appliedEndDate,
                              })}
                              className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:bg-white/10"
                            >
                              {text.viewDetails}
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {!needsAttentionExpanded && needsAttention.length > 5 ? (
                <div className="border-t border-white/5 px-5 py-3 text-sm text-neutral-400">
                  {text.showingFiveOf} {needsAttention.length} {text.exhibitor.toLowerCase()}s.
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-neutral-400">
              {text.noIssuesDetected}
            </div>
          )}
        </Card>

        <Card id="exhibitor-explorer" className="p-6 sm:p-7">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">{text.exhibitorExplorer}</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-400">
                  {text.exhibitorExplorerDescription}
                </p>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="visible-exhibitor-filter" className="mb-2 block text-sm font-medium text-neutral-300">
                    {text.filterVisibleList}
                  </label>
                  <input
                    id="visible-exhibitor-filter"
                    type="text"
                    placeholder={text.filterByNameOrId}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full min-w-[280px] rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/25"
                  />
                </div>

                <div>
                  <label htmlFor="pageSize" className="mb-2 block text-sm font-medium text-neutral-300">
                    {text.rowsPerPage}
                  </label>
                  <select
                    id="pageSize"
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value))
                      setCurrentPage(1)
                    }}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/25"
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <FocusChip active={focusFilter === 'all'} onClick={() => activateFocusFilter('all')}>
                {text.allExhibitors}
              </FocusChip>
              <FocusChip active={focusFilter === 'activeOnly'} onClick={() => activateFocusFilter('activeOnly')}>
                {text.activeOnly}
              </FocusChip>
              <FocusChip active={focusFilter === 'needsAttention'} onClick={() => activateFocusFilter('needsAttention')}>
                {text.needsAttention}
              </FocusChip>
              <FocusChip active={focusFilter === 'zeroConversion'} onClick={() => activateFocusFilter('zeroConversion')}>
                {text.zeroConversion}
              </FocusChip>
              <FocusChip active={focusFilter === 'failedExports'} onClick={() => activateFocusFilter('failedExports')}>
                {text.failedExports}
              </FocusChip>
              <FocusChip active={focusFilter === 'topPerformers'} onClick={() => activateFocusFilter('topPerformers')}>
                {text.topPerformers}
              </FocusChip>
            </div>

            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="text-neutral-500">
                {text.showing} {tableStartIndex}-{tableEndIndex} {text.of} {sortedExhibitorRows.length}
              </div>
              <div className="text-neutral-500">
                {text.currentFocus}:{' '}
                <span className="font-medium text-white">{focusLabel(focusFilter)}</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-[1120px] w-full border-collapse text-sm">
                  <thead className="bg-white/[0.04]">
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('companyName')} className="font-medium hover:underline">
                          {text.company}{sortIndicator('companyName')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('exhibitorId')} className="font-medium hover:underline">
                          {text.exhibitorId}{sortIndicator('exhibitorId')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('totalEvents')} className="font-medium hover:underline">
                          {text.totalEventsColumn}{sortIndicator('totalEvents')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('generatorOpenedCount')} className="font-medium hover:underline">
                          {text.opens}{sortIndicator('generatorOpenedCount')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('exportSucceededCount')} className="font-medium hover:underline">
                          {text.successfulExportsColumn}{sortIndicator('exportSucceededCount')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('exportFailedCount')} className="font-medium hover:underline">
                          {text.failedExportsColumn}{sortIndicator('exportFailedCount')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('conversionRate')} className="font-medium hover:underline">
                          {text.openToExport}{sortIndicator('conversionRate')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">
                        <button type="button" onClick={() => handleSort('lastActivityAt')} className="font-medium hover:underline">
                          {text.lastActivity}{sortIndicator('lastActivityAt')}
                        </button>
                      </th>
                      <th className="px-5 py-4 font-medium text-neutral-300">{text.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExhibitorRows.length === 0 ? (
                      <tr>
                        <td className="px-5 py-6 text-neutral-500" colSpan={9}>
                          {text.noExhibitorsMatch}
                        </td>
                      </tr>
                    ) : (
                      paginatedExhibitorRows.map((item) => {
                        const status = getLastActiveStatus(item.lastActivityAt, text)

                        return (
                          <tr key={item.exhibitorId} className="border-b border-white/5 align-top last:border-b-0">
                            <td className="px-5 py-4">
                              <Link
                                href={buildExhibitorDetailHref(item.exhibitorId, {
                                  range: currentRange,
                                  startDate: summary.appliedStartDate,
                                  endDate: summary.appliedEndDate,
                                })}
                                className="font-medium text-white underline-offset-4 hover:underline"
                              >
                                {item.companyName}
                              </Link>
                            </td>
                            <td className="px-5 py-4 text-neutral-300">{item.exhibitorId}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.totalEvents}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.generatorOpenedCount}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.exportSucceededCount}</td>
                            <td className="px-5 py-4 text-neutral-300">{item.exportFailedCount}</td>
                            <td className="px-5 py-4 text-neutral-300">
                              {percentage(item.exportSucceededCount, item.generatorOpenedCount)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-2">
                                <div>
                                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <div className="text-xs leading-5 text-neutral-500">
                                  {formatDate(item.lastActivityAt)}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <Link
                                href={buildExhibitorDetailHref(item.exhibitorId, {
                                  range: currentRange,
                                  startDate: summary.appliedStartDate,
                                  endDate: summary.appliedEndDate,
                                })}
                                className="inline-flex min-w-[110px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10"
                              >
                                {text.viewDetails}
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {sortedExhibitorRows.length > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-neutral-500">
                  {text.page} {Math.min(currentPage, totalPages)} {text.of} {totalPages}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50">
                    {text.first}
                  </button>
                  <button type="button" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage <= 1} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50">
                    {text.previous}
                  </button>
                  <button type="button" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage >= totalPages} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50">
                    {text.next}
                  </button>
                  <button type="button" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 disabled:cursor-not-allowed disabled:opacity-50">
                    {text.last}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <section className="grid gap-10 xl:grid-cols-2">
          <Card className="p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-white">{text.funnelAnalytics}</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              {text.funnelAnalyticsDescription}
            </p>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-white/[0.04]">
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.step}</th>
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.count}</th>
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.fromPrevious}</th>
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.fromStart}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funnelRows.map((item) => (
                      <tr key={item.key} className="border-b border-white/5 last:border-b-0">
                        <td className="px-5 py-4 font-medium text-white">{item.label}</td>
                        <td className="px-5 py-4 text-neutral-300">{item.count}</td>
                        <td className="px-5 py-4 text-neutral-300">{item.rateFromPrevious}</td>
                        <td className="px-5 py-4 text-neutral-300">{item.rateFromStart}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-7">
            <h2 className="text-xl font-semibold text-white">{text.recentEvents}</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-400">
              {text.recentEventsDescription}
            </p>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-white/[0.04]">
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.timestamp}</th>
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.company}</th>
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.event}</th>
                      <th className="px-5 py-3 font-medium text-neutral-300">{text.format}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentEvents.length === 0 ? (
                      <tr>
                        <td className="px-5 py-5 text-neutral-500" colSpan={4}>
                          {text.noEventsRecordedYet}
                        </td>
                      </tr>
                    ) : (
                      summary.recentEvents.slice(0, 12).map((event) => (
                        <tr key={event.id} className="border-b border-white/5 last:border-b-0">
                          <td className="px-5 py-4 text-neutral-300">{formatDate(event.timestamp)}</td>
                          <td className="px-5 py-4">
                            <Link
                              href={buildExhibitorDetailHref(event.exhibitorId, {
                                range: currentRange,
                                startDate: summary.appliedStartDate,
                                endDate: summary.appliedEndDate,
                              })}
                              className="text-white underline-offset-4 hover:underline"
                            >
                              {event.companyName}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-neutral-300">{event.eventType}</td>
                          <td className="px-5 py-4 text-neutral-300">
                            {event.format ? formatFormatLabel(event.format) : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </main>
  )
}