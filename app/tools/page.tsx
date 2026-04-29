'use client'

import { useMemo, useState } from 'react'
import { useSiteLanguage } from '@/components/LanguageSwitcher'
import type { LanguageKey } from '@/lib/types'

type GeneratedLink = {
  exhibitorId: string
  launchUrl: string
  createdAt: string
  companyName?: string
  standNumber?: string
}

type BulkRow = {
  exhibitorId: string
  status: 'success' | 'error'
  launchUrl?: string
  error?: string
  createdAt: string
  companyName?: string
  standNumber?: string
}

type ExhibitorLookupResult = {
  exhibitorId: string
  companyName: string
  registrationUrl?: string | null
  standNumber?: string | null
}

type ToolsText = {
  internalTools: string
  title: string
  description: string
  latestLookup: string
  bulkResults: string
  sessionHistory: string
  singleExhibitorTitle: string
  singleExhibitorDescription: string
  exhibitorId: string
  exhibitorIdPlaceholder: string
  lookupExhibitor: string
  lookingUp: string
  generateLaunchLink: string
  generating: string
  companyName: string
  boothStand: string
  registrationUrl: string
  addToBulkList: string
  useThisId: string
  copyRegistrationUrl: string
  openRegistrationUrl: string
  bulkGenerationTitle: string
  bulkGenerationDescription: string
  exhibitorIds: string
  generateBulkLinks: string
  generatingBulkLinks: string
  generateAllMockExhibitors: string
  clearInput: string
  latestGeneratedLaunchLink: string
  latestGeneratedLaunchLinkDescription: string
  standNumber: string
  createdAt: string
  launchUrl: string
  copy: string
  open: string
  bulkGenerationResults: string
  successful: string
  failed: string
  total: string
  exportCsv: string
  clearResults: string
  company: string
  stand: string
  status: string
  error: string
  action: string
  recentGeneratedLinks: string
  recentGeneratedLinksDescription: string
  exportHistoryCsv: string
  clearHistory: string
  copyLink: string
  openLink: string
  missingLookupId: string
  missingSingleId: string
  missingBulkIds: string
  unexpectedExhibitorData: string
  lookupFailed: string
  genericError: string
  copyFailed: string
  failedToGenerateLaunchLinkFor: string
  failedToFindExhibitor: string
  failedToGenerateLaunchLink: string
}

const toolsText: Record<LanguageKey, ToolsText> = {
  en: {
    internalTools: 'Internal tools',
    title: 'Invite Link Generator',
    description:
      'Clean internal workspace for exhibitor lookup, launch-link generation, bulk processing, and quick exports.',
    latestLookup: 'Latest lookup',
    bulkResults: 'Bulk results',
    sessionHistory: 'Session history',
    singleExhibitorTitle: 'Single exhibitor',
    singleExhibitorDescription:
      'Look up an exhibitor, inspect the returned data, then generate a launch link.',
    exhibitorId: 'Exhibitor ID',
    exhibitorIdPlaceholder: 'e.g. 1001',
    lookupExhibitor: 'Lookup Exhibitor',
    lookingUp: 'Looking up...',
    generateLaunchLink: 'Generate Launch Link',
    generating: 'Generating...',
    companyName: 'Company Name',
    boothStand: 'Booth / Stand',
    registrationUrl: 'Registration URL',
    addToBulkList: 'Add to Bulk List',
    useThisId: 'Use This ID',
    copyRegistrationUrl: 'Copy Registration URL',
    openRegistrationUrl: 'Open Registration URL',
    bulkGenerationTitle: 'Bulk generation',
    bulkGenerationDescription:
      'Paste one exhibitor ID per line, or separate IDs with commas.',
    exhibitorIds: 'Exhibitor IDs',
    generateBulkLinks: 'Generate Bulk Links',
    generatingBulkLinks: 'Generating Bulk Links...',
    generateAllMockExhibitors: 'Generate All Mock Exhibitors',
    clearInput: 'Clear Input',
    latestGeneratedLaunchLink: 'Latest generated launch link',
    latestGeneratedLaunchLinkDescription:
      'Most recent successful launch link generated in this session.',
    standNumber: 'Stand Number',
    createdAt: 'Created At',
    launchUrl: 'Launch URL',
    copy: 'Copy',
    open: 'Open',
    bulkGenerationResults: 'Bulk generation results',
    successful: 'successful',
    failed: 'failed',
    total: 'total',
    exportCsv: 'Export CSV',
    clearResults: 'Clear Results',
    company: 'Company',
    stand: 'Stand',
    status: 'Status',
    error: 'Error',
    action: 'Action',
    recentGeneratedLinks: 'Recent generated links',
    recentGeneratedLinksDescription:
      'Most recent launch links generated in this browser session.',
    exportHistoryCsv: 'Export History CSV',
    clearHistory: 'Clear History',
    copyLink: 'Copy Link',
    openLink: 'Open Link',
    missingLookupId: 'Please enter an exhibitor ID to look up',
    missingSingleId: 'Please enter an exhibitor ID',
    missingBulkIds: 'Please enter at least one exhibitor ID for bulk generation',
    unexpectedExhibitorData: 'Exhibitor data was returned in an unexpected format',
    lookupFailed: 'Failed to look up exhibitor',
    genericError: 'Something went wrong',
    copyFailed: 'Failed to copy to clipboard',
    failedToGenerateLaunchLinkFor: 'Failed to generate launch link for',
    failedToFindExhibitor: 'Failed to find exhibitor',
    failedToGenerateLaunchLink: 'Failed to generate launch link',
  },
  es: {
    internalTools: 'Herramientas internas',
    title: 'Generador de enlaces de invitación',
    description:
      'Espacio interno para buscar expositores, generar enlaces de acceso, procesar en lote y exportar rápidamente.',
    latestLookup: 'Última búsqueda',
    bulkResults: 'Resultados en lote',
    sessionHistory: 'Historial de sesión',
    singleExhibitorTitle: 'Expositor individual',
    singleExhibitorDescription:
      'Busca un expositor, revisa los datos devueltos y genera un enlace de acceso.',
    exhibitorId: 'ID del expositor',
    exhibitorIdPlaceholder: 'p. ej. 1001',
    lookupExhibitor: 'Buscar expositor',
    lookingUp: 'Buscando...',
    generateLaunchLink: 'Generar enlace de acceso',
    generating: 'Generando...',
    companyName: 'Nombre de empresa',
    boothStand: 'Stand',
    registrationUrl: 'URL de registro',
    addToBulkList: 'Añadir a lote',
    useThisId: 'Usar este ID',
    copyRegistrationUrl: 'Copiar URL de registro',
    openRegistrationUrl: 'Abrir URL de registro',
    bulkGenerationTitle: 'Generación en lote',
    bulkGenerationDescription:
      'Pega un ID de expositor por línea o separa los IDs con comas.',
    exhibitorIds: 'IDs de expositores',
    generateBulkLinks: 'Generar enlaces en lote',
    generatingBulkLinks: 'Generando enlaces...',
    generateAllMockExhibitors: 'Generar expositores de prueba',
    clearInput: 'Limpiar entrada',
    latestGeneratedLaunchLink: 'Último enlace generado',
    latestGeneratedLaunchLinkDescription:
      'Enlace de acceso exitoso más reciente generado en esta sesión.',
    standNumber: 'Número de stand',
    createdAt: 'Creado',
    launchUrl: 'URL de acceso',
    copy: 'Copiar',
    open: 'Abrir',
    bulkGenerationResults: 'Resultados de generación en lote',
    successful: 'correctos',
    failed: 'fallidos',
    total: 'total',
    exportCsv: 'Exportar CSV',
    clearResults: 'Limpiar resultados',
    company: 'Empresa',
    stand: 'Stand',
    status: 'Estado',
    error: 'Error',
    action: 'Acción',
    recentGeneratedLinks: 'Enlaces generados recientemente',
    recentGeneratedLinksDescription:
      'Enlaces de acceso más recientes generados en esta sesión del navegador.',
    exportHistoryCsv: 'Exportar historial CSV',
    clearHistory: 'Limpiar historial',
    copyLink: 'Copiar enlace',
    openLink: 'Abrir enlace',
    missingLookupId: 'Introduce un ID de expositor para buscar',
    missingSingleId: 'Introduce un ID de expositor',
    missingBulkIds: 'Introduce al menos un ID de expositor para el lote',
    unexpectedExhibitorData: 'Los datos del expositor tienen un formato inesperado',
    lookupFailed: 'No se pudo buscar el expositor',
    genericError: 'Algo salió mal',
    copyFailed: 'No se pudo copiar al portapapeles',
    failedToGenerateLaunchLinkFor: 'No se pudo generar el enlace para',
    failedToFindExhibitor: 'No se pudo encontrar el expositor',
    failedToGenerateLaunchLink: 'No se pudo generar el enlace de acceso',
  },
  de: {
    internalTools: 'Interne Tools',
    title: 'Einladungslink-Generator',
    description:
      'Interner Arbeitsbereich für Ausstellersuche, Startlink-Erstellung, Stapelverarbeitung und Exporte.',
    latestLookup: 'Letzte Suche',
    bulkResults: 'Stapelergebnisse',
    sessionHistory: 'Sitzungsverlauf',
    singleExhibitorTitle: 'Einzelner Aussteller',
    singleExhibitorDescription:
      'Suchen Sie einen Aussteller, prüfen Sie die Daten und erzeugen Sie einen Startlink.',
    exhibitorId: 'Aussteller-ID',
    exhibitorIdPlaceholder: 'z. B. 1001',
    lookupExhibitor: 'Aussteller suchen',
    lookingUp: 'Suche...',
    generateLaunchLink: 'Startlink erzeugen',
    generating: 'Wird erzeugt...',
    companyName: 'Firmenname',
    boothStand: 'Stand',
    registrationUrl: 'Registrierungs-URL',
    addToBulkList: 'Zur Stapelliste hinzufügen',
    useThisId: 'Diese ID verwenden',
    copyRegistrationUrl: 'Registrierungs-URL kopieren',
    openRegistrationUrl: 'Registrierungs-URL öffnen',
    bulkGenerationTitle: 'Stapelerstellung',
    bulkGenerationDescription:
      'Eine Aussteller-ID pro Zeile einfügen oder IDs mit Kommas trennen.',
    exhibitorIds: 'Aussteller-IDs',
    generateBulkLinks: 'Stapellinks erzeugen',
    generatingBulkLinks: 'Stapellinks werden erzeugt...',
    generateAllMockExhibitors: 'Alle Testaussteller erzeugen',
    clearInput: 'Eingabe löschen',
    latestGeneratedLaunchLink: 'Zuletzt erzeugter Startlink',
    latestGeneratedLaunchLinkDescription:
      'Der zuletzt erfolgreich erzeugte Startlink in dieser Sitzung.',
    standNumber: 'Standnummer',
    createdAt: 'Erstellt am',
    launchUrl: 'Start-URL',
    copy: 'Kopieren',
    open: 'Öffnen',
    bulkGenerationResults: 'Stapelergebnisse',
    successful: 'erfolgreich',
    failed: 'fehlgeschlagen',
    total: 'gesamt',
    exportCsv: 'CSV exportieren',
    clearResults: 'Ergebnisse löschen',
    company: 'Firma',
    stand: 'Stand',
    status: 'Status',
    error: 'Fehler',
    action: 'Aktion',
    recentGeneratedLinks: 'Kürzlich erzeugte Links',
    recentGeneratedLinksDescription:
      'Die neuesten in dieser Browsersitzung erzeugten Startlinks.',
    exportHistoryCsv: 'Verlauf als CSV exportieren',
    clearHistory: 'Verlauf löschen',
    copyLink: 'Link kopieren',
    openLink: 'Link öffnen',
    missingLookupId: 'Bitte eine Aussteller-ID für die Suche eingeben',
    missingSingleId: 'Bitte eine Aussteller-ID eingeben',
    missingBulkIds: 'Bitte mindestens eine Aussteller-ID für den Stapel eingeben',
    unexpectedExhibitorData: 'Ausstellerdaten wurden in einem unerwarteten Format zurückgegeben',
    lookupFailed: 'Aussteller konnte nicht gesucht werden',
    genericError: 'Etwas ist schiefgelaufen',
    copyFailed: 'Kopieren in die Zwischenablage fehlgeschlagen',
    failedToGenerateLaunchLinkFor: 'Startlink konnte nicht erzeugt werden für',
    failedToFindExhibitor: 'Aussteller konnte nicht gefunden werden',
    failedToGenerateLaunchLink: 'Startlink konnte nicht erzeugt werden',
  },
  fr: {
    internalTools: 'Outils internes',
    title: 'Générateur de liens d’invitation',
    description:
      'Espace interne pour rechercher des exposants, générer des liens, traiter en lot et exporter rapidement.',
    latestLookup: 'Dernière recherche',
    bulkResults: 'Résultats en lot',
    sessionHistory: 'Historique de session',
    singleExhibitorTitle: 'Exposant individuel',
    singleExhibitorDescription:
      'Recherchez un exposant, consultez les données retournées, puis générez un lien.',
    exhibitorId: 'ID exposant',
    exhibitorIdPlaceholder: 'ex. 1001',
    lookupExhibitor: 'Rechercher exposant',
    lookingUp: 'Recherche...',
    generateLaunchLink: 'Générer le lien',
    generating: 'Génération...',
    companyName: 'Nom de l’entreprise',
    boothStand: 'Stand',
    registrationUrl: 'URL d’inscription',
    addToBulkList: 'Ajouter au lot',
    useThisId: 'Utiliser cet ID',
    copyRegistrationUrl: 'Copier l’URL d’inscription',
    openRegistrationUrl: 'Ouvrir l’URL d’inscription',
    bulkGenerationTitle: 'Génération en lot',
    bulkGenerationDescription:
      'Collez un ID exposant par ligne ou séparez les IDs par des virgules.',
    exhibitorIds: 'IDs exposants',
    generateBulkLinks: 'Générer les liens en lot',
    generatingBulkLinks: 'Génération des liens...',
    generateAllMockExhibitors: 'Générer les exposants de test',
    clearInput: 'Effacer la saisie',
    latestGeneratedLaunchLink: 'Dernier lien généré',
    latestGeneratedLaunchLinkDescription:
      'Dernier lien généré avec succès dans cette session.',
    standNumber: 'Numéro de stand',
    createdAt: 'Créé le',
    launchUrl: 'URL de lancement',
    copy: 'Copier',
    open: 'Ouvrir',
    bulkGenerationResults: 'Résultats de génération en lot',
    successful: 'réussis',
    failed: 'échoués',
    total: 'total',
    exportCsv: 'Exporter CSV',
    clearResults: 'Effacer les résultats',
    company: 'Entreprise',
    stand: 'Stand',
    status: 'Statut',
    error: 'Erreur',
    action: 'Action',
    recentGeneratedLinks: 'Liens récemment générés',
    recentGeneratedLinksDescription:
      'Derniers liens générés dans cette session navigateur.',
    exportHistoryCsv: 'Exporter l’historique CSV',
    clearHistory: 'Effacer l’historique',
    copyLink: 'Copier le lien',
    openLink: 'Ouvrir le lien',
    missingLookupId: 'Veuillez saisir un ID exposant à rechercher',
    missingSingleId: 'Veuillez saisir un ID exposant',
    missingBulkIds: 'Veuillez saisir au moins un ID exposant pour le lot',
    unexpectedExhibitorData: 'Les données exposant ont un format inattendu',
    lookupFailed: 'Impossible de rechercher l’exposant',
    genericError: 'Une erreur est survenue',
    copyFailed: 'Impossible de copier dans le presse-papiers',
    failedToGenerateLaunchLinkFor: 'Impossible de générer le lien pour',
    failedToFindExhibitor: 'Impossible de trouver l’exposant',
    failedToGenerateLaunchLink: 'Impossible de générer le lien',
  },
  it: {
    internalTools: 'Strumenti interni',
    title: 'Generatore link invito',
    description:
      'Area interna per ricerca espositori, generazione link, elaborazione massiva ed esportazioni rapide.',
    latestLookup: 'Ultima ricerca',
    bulkResults: 'Risultati massivi',
    sessionHistory: 'Cronologia sessione',
    singleExhibitorTitle: 'Singolo espositore',
    singleExhibitorDescription:
      'Cerca un espositore, controlla i dati restituiti e genera un link.',
    exhibitorId: 'ID espositore',
    exhibitorIdPlaceholder: 'es. 1001',
    lookupExhibitor: 'Cerca espositore',
    lookingUp: 'Ricerca...',
    generateLaunchLink: 'Genera link',
    generating: 'Generazione...',
    companyName: 'Nome azienda',
    boothStand: 'Stand',
    registrationUrl: 'URL registrazione',
    addToBulkList: 'Aggiungi al lotto',
    useThisId: 'Usa questo ID',
    copyRegistrationUrl: 'Copia URL registrazione',
    openRegistrationUrl: 'Apri URL registrazione',
    bulkGenerationTitle: 'Generazione massiva',
    bulkGenerationDescription:
      'Incolla un ID espositore per riga o separa gli ID con virgole.',
    exhibitorIds: 'ID espositori',
    generateBulkLinks: 'Genera link massivi',
    generatingBulkLinks: 'Generazione link...',
    generateAllMockExhibitors: 'Genera espositori test',
    clearInput: 'Svuota input',
    latestGeneratedLaunchLink: 'Ultimo link generato',
    latestGeneratedLaunchLinkDescription:
      'Link generato con successo più recente in questa sessione.',
    standNumber: 'Numero stand',
    createdAt: 'Creato il',
    launchUrl: 'URL di accesso',
    copy: 'Copia',
    open: 'Apri',
    bulkGenerationResults: 'Risultati generazione massiva',
    successful: 'riusciti',
    failed: 'falliti',
    total: 'totale',
    exportCsv: 'Esporta CSV',
    clearResults: 'Cancella risultati',
    company: 'Azienda',
    stand: 'Stand',
    status: 'Stato',
    error: 'Errore',
    action: 'Azione',
    recentGeneratedLinks: 'Link generati di recente',
    recentGeneratedLinksDescription:
      'Link più recenti generati in questa sessione browser.',
    exportHistoryCsv: 'Esporta cronologia CSV',
    clearHistory: 'Cancella cronologia',
    copyLink: 'Copia link',
    openLink: 'Apri link',
    missingLookupId: 'Inserisci un ID espositore da cercare',
    missingSingleId: 'Inserisci un ID espositore',
    missingBulkIds: 'Inserisci almeno un ID espositore per il lotto',
    unexpectedExhibitorData: 'I dati espositore hanno un formato inatteso',
    lookupFailed: 'Impossibile cercare espositore',
    genericError: 'Qualcosa è andato storto',
    copyFailed: 'Copia negli appunti non riuscita',
    failedToGenerateLaunchLinkFor: 'Impossibile generare il link per',
    failedToFindExhibitor: 'Impossibile trovare espositore',
    failedToGenerateLaunchLink: 'Impossibile generare link',
  },
  pt: {
    internalTools: 'Ferramentas internas',
    title: 'Gerador de links de convite',
    description:
      'Área interna para busca de expositores, geração de links, processamento em lote e exportações rápidas.',
    latestLookup: 'Última busca',
    bulkResults: 'Resultados em lote',
    sessionHistory: 'Histórico da sessão',
    singleExhibitorTitle: 'Expositor individual',
    singleExhibitorDescription:
      'Busque um expositor, confira os dados retornados e gere um link.',
    exhibitorId: 'ID do expositor',
    exhibitorIdPlaceholder: 'ex. 1001',
    lookupExhibitor: 'Buscar expositor',
    lookingUp: 'Buscando...',
    generateLaunchLink: 'Gerar link',
    generating: 'Gerando...',
    companyName: 'Nome da empresa',
    boothStand: 'Estande',
    registrationUrl: 'URL de registro',
    addToBulkList: 'Adicionar ao lote',
    useThisId: 'Usar este ID',
    copyRegistrationUrl: 'Copiar URL de registro',
    openRegistrationUrl: 'Abrir URL de registro',
    bulkGenerationTitle: 'Geração em lote',
    bulkGenerationDescription:
      'Cole um ID de expositor por linha ou separe IDs com vírgulas.',
    exhibitorIds: 'IDs de expositores',
    generateBulkLinks: 'Gerar links em lote',
    generatingBulkLinks: 'Gerando links...',
    generateAllMockExhibitors: 'Gerar expositores de teste',
    clearInput: 'Limpar entrada',
    latestGeneratedLaunchLink: 'Último link gerado',
    latestGeneratedLaunchLinkDescription:
      'Link gerado com sucesso mais recente nesta sessão.',
    standNumber: 'Número do estande',
    createdAt: 'Criado em',
    launchUrl: 'URL de acesso',
    copy: 'Copiar',
    open: 'Abrir',
    bulkGenerationResults: 'Resultados da geração em lote',
    successful: 'bem-sucedidos',
    failed: 'falharam',
    total: 'total',
    exportCsv: 'Exportar CSV',
    clearResults: 'Limpar resultados',
    company: 'Empresa',
    stand: 'Estande',
    status: 'Status',
    error: 'Erro',
    action: 'Ação',
    recentGeneratedLinks: 'Links gerados recentemente',
    recentGeneratedLinksDescription:
      'Links mais recentes gerados nesta sessão do navegador.',
    exportHistoryCsv: 'Exportar histórico CSV',
    clearHistory: 'Limpar histórico',
    copyLink: 'Copiar link',
    openLink: 'Abrir link',
    missingLookupId: 'Digite um ID de expositor para buscar',
    missingSingleId: 'Digite um ID de expositor',
    missingBulkIds: 'Digite ao menos um ID de expositor para o lote',
    unexpectedExhibitorData: 'Os dados do expositor retornaram em formato inesperado',
    lookupFailed: 'Falha ao buscar expositor',
    genericError: 'Algo deu errado',
    copyFailed: 'Falha ao copiar para a área de transferência',
    failedToGenerateLaunchLinkFor: 'Falha ao gerar link para',
    failedToFindExhibitor: 'Falha ao encontrar expositor',
    failedToGenerateLaunchLink: 'Falha ao gerar link',
  },
  nl: {
    internalTools: 'Interne tools',
    title: 'Uitnodigingslinkgenerator',
    description:
      'Interne werkruimte voor exposanten zoeken, links genereren, bulkverwerking en snelle exports.',
    latestLookup: 'Laatste zoekopdracht',
    bulkResults: 'Bulkresultaten',
    sessionHistory: 'Sessieverloop',
    singleExhibitorTitle: 'Enkele exposant',
    singleExhibitorDescription:
      'Zoek een exposant, controleer de gegevens en genereer een link.',
    exhibitorId: 'Exposant-ID',
    exhibitorIdPlaceholder: 'bijv. 1001',
    lookupExhibitor: 'Exposant zoeken',
    lookingUp: 'Zoeken...',
    generateLaunchLink: 'Link genereren',
    generating: 'Genereren...',
    companyName: 'Bedrijfsnaam',
    boothStand: 'Stand',
    registrationUrl: 'Registratie-URL',
    addToBulkList: 'Toevoegen aan bulk',
    useThisId: 'Deze ID gebruiken',
    copyRegistrationUrl: 'Registratie-URL kopiëren',
    openRegistrationUrl: 'Registratie-URL openen',
    bulkGenerationTitle: 'Bulkgeneratie',
    bulkGenerationDescription:
      'Plak één exposant-ID per regel of scheid IDs met komma’s.',
    exhibitorIds: 'Exposant-IDs',
    generateBulkLinks: 'Bulklinks genereren',
    generatingBulkLinks: 'Bulklinks genereren...',
    generateAllMockExhibitors: 'Testexposanten genereren',
    clearInput: 'Invoer wissen',
    latestGeneratedLaunchLink: 'Laatst gegenereerde link',
    latestGeneratedLaunchLinkDescription:
      'Meest recent succesvol gegenereerde link in deze sessie.',
    standNumber: 'Standnummer',
    createdAt: 'Aangemaakt',
    launchUrl: 'Start-URL',
    copy: 'Kopiëren',
    open: 'Openen',
    bulkGenerationResults: 'Bulkgeneratieresultaten',
    successful: 'succesvol',
    failed: 'mislukt',
    total: 'totaal',
    exportCsv: 'CSV exporteren',
    clearResults: 'Resultaten wissen',
    company: 'Bedrijf',
    stand: 'Stand',
    status: 'Status',
    error: 'Fout',
    action: 'Actie',
    recentGeneratedLinks: 'Recent gegenereerde links',
    recentGeneratedLinksDescription:
      'Meest recente links gegenereerd in deze browsersessie.',
    exportHistoryCsv: 'Geschiedenis CSV exporteren',
    clearHistory: 'Geschiedenis wissen',
    copyLink: 'Link kopiëren',
    openLink: 'Link openen',
    missingLookupId: 'Voer een exposant-ID in om te zoeken',
    missingSingleId: 'Voer een exposant-ID in',
    missingBulkIds: 'Voer minimaal één exposant-ID in voor bulk',
    unexpectedExhibitorData: 'Exposantgegevens hebben een onverwacht formaat',
    lookupFailed: 'Exposant zoeken mislukt',
    genericError: 'Er ging iets mis',
    copyFailed: 'Kopiëren naar klembord mislukt',
    failedToGenerateLaunchLinkFor: 'Link genereren mislukt voor',
    failedToFindExhibitor: 'Exposant niet gevonden',
    failedToGenerateLaunchLink: 'Link genereren mislukt',
  },
  'zh-CN': {
    internalTools: '内部工具',
    title: '邀请链接生成器',
    description:
      '用于参展商查询、启动链接生成、批量处理和快速导出的内部工作区。',
    latestLookup: '最近查询',
    bulkResults: '批量结果',
    sessionHistory: '会话历史',
    singleExhibitorTitle: '单个参展商',
    singleExhibitorDescription:
      '查询参展商、检查返回数据，然后生成启动链接。',
    exhibitorId: '参展商 ID',
    exhibitorIdPlaceholder: '例如 1001',
    lookupExhibitor: '查询参展商',
    lookingUp: '查询中...',
    generateLaunchLink: '生成启动链接',
    generating: '生成中...',
    companyName: '公司名称',
    boothStand: '展位',
    registrationUrl: '注册链接',
    addToBulkList: '添加到批量列表',
    useThisId: '使用此 ID',
    copyRegistrationUrl: '复制注册链接',
    openRegistrationUrl: '打开注册链接',
    bulkGenerationTitle: '批量生成',
    bulkGenerationDescription:
      '每行粘贴一个参展商 ID，或用逗号分隔多个 ID。',
    exhibitorIds: '参展商 ID',
    generateBulkLinks: '生成批量链接',
    generatingBulkLinks: '正在生成批量链接...',
    generateAllMockExhibitors: '生成所有测试参展商',
    clearInput: '清空输入',
    latestGeneratedLaunchLink: '最新生成的启动链接',
    latestGeneratedLaunchLinkDescription:
      '本次会话中最近成功生成的启动链接。',
    standNumber: '展位号',
    createdAt: '创建时间',
    launchUrl: '启动链接',
    copy: '复制',
    open: '打开',
    bulkGenerationResults: '批量生成结果',
    successful: '成功',
    failed: '失败',
    total: '总计',
    exportCsv: '导出 CSV',
    clearResults: '清空结果',
    company: '公司',
    stand: '展位',
    status: '状态',
    error: '错误',
    action: '操作',
    recentGeneratedLinks: '最近生成的链接',
    recentGeneratedLinksDescription:
      '此浏览器会话中最近生成的启动链接。',
    exportHistoryCsv: '导出历史 CSV',
    clearHistory: '清空历史',
    copyLink: '复制链接',
    openLink: '打开链接',
    missingLookupId: '请输入要查询的参展商 ID',
    missingSingleId: '请输入参展商 ID',
    missingBulkIds: '请至少输入一个参展商 ID 进行批量生成',
    unexpectedExhibitorData: '返回的参展商数据格式不正确',
    lookupFailed: '查询参展商失败',
    genericError: '出现错误',
    copyFailed: '复制到剪贴板失败',
    failedToGenerateLaunchLinkFor: '无法生成启动链接：',
    failedToFindExhibitor: '无法找到参展商',
    failedToGenerateLaunchLink: '无法生成启动链接',
  },
}

const DEFAULT_MOCK_EXHIBITOR_IDS = ['1001', '1002', '1003']

function formatTimestamp(value: string) {
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function downloadCsv(filename: string, rows: string[][]) {
  const escapeCell = (value: string) => {
    const normalized = value ?? ''
    if (
      normalized.includes(',') ||
      normalized.includes('"') ||
      normalized.includes('\n')
    ) {
      return `"${normalized.replace(/"/g, '""')}"`
    }
    return normalized
  }

  const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function parseExhibitorResponse(data: any): ExhibitorLookupResult | null {
  const source = data?.exhibitor ?? data?.item ?? data?.data ?? data

  const exhibitorId =
    source?.id ?? source?.exhibitorId ?? source?.exhibitor_id

  const companyName =
    source?.companyName ?? source?.company_name ?? source?.name

  if (!exhibitorId || !companyName) {
    return null
  }

  return {
    exhibitorId: String(exhibitorId),
    companyName: String(companyName),
    registrationUrl:
      source?.registrationUrl ?? source?.registration_url ?? null,
    standNumber: source?.standNumber ?? source?.stand_number ?? null,
  }
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-neutral-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </label>
  )
}

function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/20 focus:bg-black/40 ${className}`}
    />
  )
}

function Textarea({
  className = '',
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-neutral-500 focus:border-white/20 focus:bg-black/40 ${className}`}
    />
  )
}

function ActionButton({
  children,
  variant = 'secondary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const styles =
    variant === 'primary'
      ? 'bg-white text-black hover:bg-neutral-200'
      : variant === 'ghost'
      ? 'bg-transparent text-neutral-300 hover:bg-white/5 border border-white/10'
      : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

function InfoItem({
  label,
  value,
  mono = false,
  wrap = false,
}: {
  label: string
  value: string
  mono?: boolean
  wrap?: boolean
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </div>
      <div
        className={`mt-2 text-sm text-white ${
          mono ? 'font-mono' : ''
        } ${wrap ? 'break-all' : ''}`}
      >
        {value || '—'}
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const [language] = useSiteLanguage()
  const t = toolsText[language] ?? toolsText.en

  const [exhibitorId, setExhibitorId] = useState('1001')
  const [bulkInput, setBulkInput] = useState('1001\n1002')
  const [loadingSingle, setLoadingSingle] = useState(false)
  const [loadingBulk, setLoadingBulk] = useState(false)
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<GeneratedLink | null>(null)
  const [history, setHistory] = useState<GeneratedLink[]>([])
  const [bulkResults, setBulkResults] = useState<BulkRow[]>([])
  const [lookupResult, setLookupResult] =
    useState<ExhibitorLookupResult | null>(null)

  async function requestLaunchLink(id: string) {
    const res = await fetch(`/api/internal-launch-link/${encodeURIComponent(id)}`)
    const data = await res.json()

    if (!res.ok || !data.ok) {
      throw new Error(
        data.error || `${t.failedToGenerateLaunchLinkFor} ${id}`
      )
    }

    return {
      exhibitorId: data.exhibitorId as string,
      launchUrl: data.launchUrl as string,
      companyName: (data.companyName as string | undefined) ?? undefined,
      standNumber: (data.standNumber as string | undefined) ?? undefined,
      createdAt: new Date().toISOString(),
    }
  }

  async function handleLookupExhibitor() {
    const id = exhibitorId.trim()

    if (!id) {
      setError(t.missingLookupId)
      return
    }

    setLoadingLookup(true)
    setError('')
    setLookupResult(null)

    try {
      const res = await fetch(`/api/exhibitor/${encodeURIComponent(id)}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `${t.failedToFindExhibitor} ${id}`)
      }

      const parsed = parseExhibitorResponse(data)

      if (!parsed) {
        throw new Error(t.unexpectedExhibitorData)
      }

      setLookupResult(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.lookupFailed)
    } finally {
      setLoadingLookup(false)
    }
  }

  async function handleGenerateSingle() {
    const id = exhibitorId.trim()

    if (!id) {
      setError(t.missingSingleId)
      return
    }

    setLoadingSingle(true)
    setError('')

    try {
      const newLink = await requestLaunchLink(id)
      setResult(newLink)
      setHistory((prev) => [newLink, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : t.genericError)
    } finally {
      setLoadingSingle(false)
    }
  }

  async function runBulk(ids: string[]) {
    setLoadingBulk(true)
    setError('')
    setBulkResults([])

    const results: BulkRow[] = []
    const successfulLinks: GeneratedLink[] = []

    for (const id of ids) {
      try {
        const newLink = await requestLaunchLink(id)

        results.push({
          exhibitorId: newLink.exhibitorId,
          status: 'success',
          launchUrl: newLink.launchUrl,
          createdAt: newLink.createdAt,
          companyName: newLink.companyName,
          standNumber: newLink.standNumber,
        })

        successfulLinks.push(newLink)
      } catch (err) {
        results.push({
          exhibitorId: id,
          status: 'error',
          error:
            err instanceof Error ? err.message : t.failedToGenerateLaunchLink,
          createdAt: new Date().toISOString(),
        })
      }
    }

    setBulkResults(results)

    if (successfulLinks.length > 0) {
      setHistory((prev) => [...successfulLinks.reverse(), ...prev])
      setResult(successfulLinks[successfulLinks.length - 1])
    }

    setLoadingBulk(false)
  }

  async function handleGenerateBulk() {
    const ids = Array.from(
      new Set(
        bulkInput
          .split(/\r?\n|,/)
          .map((value) => value.trim())
          .filter(Boolean)
          .map((value) => value.split(' - ')[0].trim())
      )
    )

    if (ids.length === 0) {
      setError(t.missingBulkIds)
      return
    }

    await runBulk(ids)
  }

  async function handleGenerateAllMock() {
    await runBulk(DEFAULT_MOCK_EXHIBITOR_IDS)
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      setError(t.copyFailed)
    }
  }

  function openLink(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  function handleExportCsv() {
    const rows: string[][] = [
      [
        t.exhibitorId,
        t.companyName,
        t.standNumber,
        t.status,
        t.launchUrl,
        t.error,
        t.createdAt,
      ],
      ...bulkResults.map((item) => [
        item.exhibitorId,
        item.companyName ?? '',
        item.standNumber ?? '',
        item.status,
        item.launchUrl ?? '',
        item.error ?? '',
        item.createdAt,
      ]),
    ]

    downloadCsv('ebo-launch-links.csv', rows)
  }

  function handleExportHistoryCsv() {
    const rows: string[][] = [
      [t.exhibitorId, t.companyName, t.standNumber, t.launchUrl, t.createdAt],
      ...history.map((item) => [
        item.exhibitorId,
        item.companyName ?? '',
        item.standNumber ?? '',
        item.launchUrl,
        item.createdAt,
      ]),
    ]

    downloadCsv('launch-link-history.csv', rows)
  }

  function handleClearBulkResults() {
    setBulkResults([])
  }

  function handleClearHistory() {
    setHistory([])
    setResult(null)
  }

  function handleQuickAddToBulk() {
    if (!lookupResult) return

    const line = `${lookupResult.exhibitorId} - ${lookupResult.companyName}`

    setBulkInput((prev) => {
      const current = prev.trim()
      if (!current) return line

      const lines = current.split(/\r?\n/).map((value) => value.trim())
      const alreadyExists = lines.some(
        (value) =>
          value === line ||
          value === lookupResult.exhibitorId ||
          value.startsWith(`${lookupResult.exhibitorId} - `)
      )

      if (alreadyExists) {
        return prev
      }

      return `${prev.trim()}\n${line}`
    })
  }

  const bulkSummary = useMemo(() => {
    const successCount = bulkResults.filter(
      (item) => item.status === 'success'
    ).length
    const errorCount = bulkResults.filter(
      (item) => item.status === 'error'
    ).length

    return {
      successCount,
      errorCount,
      total: bulkResults.length,
    }
  }, [bulkResults])

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#262626_0%,_#0a0a0a_38%,_#000_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300">
                {t.internalTools}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {t.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
                {t.description}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  {t.latestLookup}
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {lookupResult?.exhibitorId ?? '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  {t.bulkResults}
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {bulkSummary.total}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
                  {t.sessionHistory}
                </div>
                <div className="mt-1 text-lg font-semibold text-white">
                  {history.length}
                </div>
              </div>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <SectionCard
            title={t.singleExhibitorTitle}
            description={t.singleExhibitorDescription}
          >
            <div className="space-y-5">
              <div>
                <FieldLabel>{t.exhibitorId}</FieldLabel>
                <Input
                  value={exhibitorId}
                  onChange={(e) => setExhibitorId(e.target.value)}
                  placeholder={t.exhibitorIdPlaceholder}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={handleLookupExhibitor}
                  disabled={loadingLookup}
                  variant="secondary"
                >
                  {loadingLookup ? t.lookingUp : t.lookupExhibitor}
                </ActionButton>

                <ActionButton
                  onClick={handleGenerateSingle}
                  disabled={loadingSingle}
                  variant="primary"
                >
                  {loadingSingle ? t.generating : t.generateLaunchLink}
                </ActionButton>
              </div>

              {lookupResult ? (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <InfoItem
                          label={t.companyName}
                          value={lookupResult.companyName}
                        />
                        <InfoItem
                          label={t.exhibitorId}
                          value={lookupResult.exhibitorId}
                          mono
                        />
                        <InfoItem
                          label={t.boothStand}
                          value={lookupResult.standNumber ?? '—'}
                        />
                        <InfoItem
                          label={t.registrationUrl}
                          value={lookupResult.registrationUrl ?? '—'}
                          wrap
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3 xl:w-[220px] xl:flex-col">
                      <ActionButton
                        onClick={handleQuickAddToBulk}
                        variant="secondary"
                        className="w-full"
                      >
                        {t.addToBulkList}
                      </ActionButton>
                      <ActionButton
                        onClick={() => setExhibitorId(lookupResult.exhibitorId)}
                        variant="ghost"
                        className="w-full"
                      >
                        {t.useThisId}
                      </ActionButton>
                      {lookupResult.registrationUrl ? (
                        <>
                          <ActionButton
                            onClick={() => copy(lookupResult.registrationUrl!)}
                            variant="ghost"
                            className="w-full"
                          >
                            {t.copyRegistrationUrl}
                          </ActionButton>
                          <ActionButton
                            onClick={() =>
                              openLink(lookupResult.registrationUrl!)
                            }
                            variant="ghost"
                            className="w-full"
                          >
                            {t.openRegistrationUrl}
                          </ActionButton>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard
            title={t.bulkGenerationTitle}
            description={t.bulkGenerationDescription}
          >
            <div className="space-y-5">
              <div>
                <FieldLabel>{t.exhibitorIds}</FieldLabel>
                <Textarea
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  rows={10}
                  placeholder={'1001\n1002\n1003'}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <ActionButton
                  onClick={handleGenerateBulk}
                  disabled={loadingBulk}
                  variant="primary"
                >
                  {loadingBulk ? t.generatingBulkLinks : t.generateBulkLinks}
                </ActionButton>

                <ActionButton
                  onClick={handleGenerateAllMock}
                  disabled={loadingBulk}
                  type="button"
                  variant="secondary"
                >
                  {t.generateAllMockExhibitors}
                </ActionButton>

                <ActionButton
                  onClick={() => setBulkInput('')}
                  type="button"
                  variant="ghost"
                >
                  {t.clearInput}
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        </div>

        {result ? (
          <SectionCard
            title={t.latestGeneratedLaunchLink}
            description={t.latestGeneratedLaunchLinkDescription}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <InfoItem label={t.exhibitorId} value={result.exhibitorId} mono />
              <InfoItem label={t.companyName} value={result.companyName ?? '—'} />
              <InfoItem label={t.standNumber} value={result.standNumber ?? '—'} />
              <InfoItem label={t.createdAt} value={formatTimestamp(result.createdAt)} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {t.launchUrl}
              </div>
              <div className="mt-2 break-all font-mono text-sm text-white">
                {result.launchUrl}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <ActionButton onClick={() => copy(result.launchUrl)} variant="secondary">
                  {t.copy}
                </ActionButton>
                <ActionButton onClick={() => openLink(result.launchUrl)} variant="ghost">
                  {t.open}
                </ActionButton>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {bulkResults.length > 0 ? (
          <SectionCard
            title={t.bulkGenerationResults}
            description={`${bulkSummary.successCount} ${t.successful}, ${bulkSummary.errorCount} ${t.failed}, ${bulkSummary.total} ${t.total}.`}
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={handleExportCsv} variant="secondary">
                  {t.exportCsv}
                </ActionButton>
                <ActionButton onClick={handleClearBulkResults} variant="ghost">
                  {t.clearResults}
                </ActionButton>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full border-collapse text-sm">
                  <thead className="bg-white/[0.04] text-left text-neutral-300">
                    <tr>
                      <th className="px-4 py-3 font-medium">{t.exhibitorId}</th>
                      <th className="px-4 py-3 font-medium">{t.company}</th>
                      <th className="px-4 py-3 font-medium">{t.stand}</th>
                      <th className="px-4 py-3 font-medium">{t.status}</th>
                      <th className="px-4 py-3 font-medium">{t.launchUrl}</th>
                      <th className="px-4 py-3 font-medium">{t.error}</th>
                      <th className="px-4 py-3 font-medium">{t.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((item) => (
                      <tr
                        key={`${item.exhibitorId}-${item.createdAt}`}
                        className="border-t border-white/5 align-top"
                      >
                        <td className="px-4 py-4 font-mono text-white">
                          {item.exhibitorId}
                        </td>
                        <td className="px-4 py-4 text-neutral-300">
                          {item.companyName ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-neutral-300">
                          {item.standNumber ?? '—'}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              item.status === 'success'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-red-500/15 text-red-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-neutral-300">
                          <div className="max-w-[320px] break-all">
                            {item.launchUrl ?? '—'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-red-300">
                          <div className="max-w-[260px] break-words">
                            {item.error ?? '—'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {item.launchUrl ? (
                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                onClick={() => copy(item.launchUrl!)}
                                variant="secondary"
                                className="px-3 py-2 text-xs"
                              >
                                {t.copy}
                              </ActionButton>
                              <ActionButton
                                onClick={() => openLink(item.launchUrl!)}
                                variant="ghost"
                                className="px-3 py-2 text-xs"
                              >
                                {t.open}
                              </ActionButton>
                            </div>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {history.length > 0 ? (
          <SectionCard
            title={t.recentGeneratedLinks}
            description={t.recentGeneratedLinksDescription}
          >
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div />
              <div className="flex flex-wrap gap-3">
                <ActionButton onClick={handleExportHistoryCsv} variant="secondary">
                  {t.exportHistoryCsv}
                </ActionButton>
                <ActionButton onClick={handleClearHistory} variant="ghost">
                  {t.clearHistory}
                </ActionButton>
              </div>
            </div>

            <div className="grid gap-4">
              {history.map((item) => (
                <div
                  key={`${item.exhibitorId}-${item.createdAt}-${item.launchUrl.slice(0, 8)}`}
                  className="rounded-3xl border border-white/10 bg-black/20 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold text-white">
                        {item.companyName
                          ? `${item.companyName} (${item.exhibitorId})`
                          : item.exhibitorId}
                      </div>

                      {item.standNumber ? (
                        <div className="mt-1 text-sm text-neutral-400">
                          {t.stand}: {item.standNumber}
                        </div>
                      ) : null}

                      <div className="mt-3 break-all font-mono text-sm text-neutral-300">
                        {item.launchUrl}
                      </div>

                      <div className="mt-3 text-xs uppercase tracking-[0.14em] text-neutral-500">
                        {formatTimestamp(item.createdAt)}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <ActionButton
                        onClick={() => copy(item.launchUrl)}
                        variant="secondary"
                        className="px-3 py-2 text-xs"
                      >
                        {t.copyLink}
                      </ActionButton>
                      <ActionButton
                        onClick={() => openLink(item.launchUrl)}
                        variant="ghost"
                        className="px-3 py-2 text-xs"
                      >
                        {t.openLink}
                      </ActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}
      </div>
    </main>
  )
}