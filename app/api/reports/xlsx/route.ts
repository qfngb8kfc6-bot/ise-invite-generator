import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  verifyAdminSessionCookieValue,
} from '@/lib/admin-auth'
import { getAnalyticsSummary } from '@/lib/analytics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type CellValue = string | number | boolean | null | undefined

type WorksheetData = {
  name: string
  rows: CellValue[][]
}

const CRC_TABLE = new Uint32Array(256)

for (let i = 0; i < 256; i += 1) {
  let c = i

  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }

  CRC_TABLE[i] = c >>> 0
}

function getRangeDays(range?: string | null): number | undefined {
  switch (range) {
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    default:
      return undefined
  }
}

function formatRangeLabel(range?: string | null): string {
  switch (range) {
    case '7d':
      return 'last-7-days'
    case '30d':
      return 'last-30-days'
    case '90d':
      return 'last-90-days'
    default:
      return 'all-time'
  }
}

function hasCustomDateRange(startDate?: string | null, endDate?: string | null): boolean {
  return Boolean(startDate?.trim() || endDate?.trim())
}

function getFlowFilter(flow?: string | null): 'all' | 'primary' | 'secondary' {
  switch (flow) {
    case 'primary':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'all':
    default:
      return 'all'
  }
}

function formatFlowLabel(flow: 'all' | 'primary' | 'secondary'): string {
  switch (flow) {
    case 'primary':
      return 'primary'
    case 'secondary':
      return 'secondary'
    case 'all':
    default:
      return 'all'
  }
}

function percentage(numerator: number, denominator: number): string {
  if (!denominator) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

function formatUkDate(value: string | null): string {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short',
  }).formatToParts(date)

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  return `${getPart('year')}-${getPart('month')}-${getPart('day')} ${getPart(
    'hour'
  )}:${getPart('minute')}:${getPart('second')} ${getPart('timeZoneName')}`
}

function xmlEscape(value: CellValue): string {
  if (value === null || value === undefined) return ''

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnName(index: number): string {
  let name = ''
  let current = index

  while (current > 0) {
    const remainder = (current - 1) % 26
    name = String.fromCharCode(65 + remainder) + name
    current = Math.floor((current - 1) / 26)
  }

  return name
}

function isNumberCell(value: CellValue): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function cellXml(value: CellValue, rowIndex: number, columnIndex: number): string {
  const ref = `${columnName(columnIndex)}${rowIndex}`

  if (isNumberCell(value)) {
    return `<c r="${ref}"><v>${value}</v></c>`
  }

  if (typeof value === 'boolean') {
    return `<c r="${ref}" t="b"><v>${value ? 1 : 0}</v></c>`
  }

  return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`
}

function worksheetXml(rows: CellValue[][]): string {
  const sheetRows = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1
      const cells = row
        .map((cell, columnIndex) => cellXml(cell, rowNumber, columnIndex + 1))
        .join('')

      return `<row r="${rowNumber}">${cells}</row>`
    })
    .join('')

  const maxColumns = rows.reduce((max, row) => Math.max(max, row.length), 1)
  const maxRows = Math.max(rows.length, 1)
  const dimension = `A1:${columnName(maxColumns)}${maxRows}`

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="${dimension}"/>
  <sheetViews>
    <sheetView workbookViewId="0">
      <pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`
}

function workbookXml(sheets: WorksheetData[]): string {
  const sheetNodes = sheets
    .map(
      (sheet, index) =>
        `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${
          index + 1
        }"/>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheetNodes}</sheets>
</workbook>`
}

function workbookRelsXml(sheets: WorksheetData[]): string {
  const sheetRelationships = sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${
          index + 1
        }.xml"/>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRelationships}
  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
}

function rootRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
}

function contentTypesXml(sheets: WorksheetData[]): string {
  const sheetOverrides = sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  ${sheetOverrides}
</Types>`
}

function stylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`
}

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff

  for (const byte of buffer) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date: Date): { dosTime: number; dosDate: number } {
  const year = Math.max(date.getFullYear(), 1980)

  return {
    dosTime:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    dosDate:
      ((year - 1980) << 9) |
      ((date.getMonth() + 1) << 5) |
      date.getDate(),
  }
}

function createZip(files: Array<{ path: string; content: string }>): Buffer {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  let offset = 0

  const { dosTime, dosDate } = dosDateTime(new Date())

  for (const file of files) {
    const nameBuffer = Buffer.from(file.path, 'utf8')
    const contentBuffer = Buffer.from(file.content, 'utf8')
    const crc = crc32(contentBuffer)

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(contentBuffer.length, 18)
    localHeader.writeUInt32LE(contentBuffer.length, 22)
    localHeader.writeUInt16LE(nameBuffer.length, 26)
    localHeader.writeUInt16LE(0, 28)

    localParts.push(localHeader, nameBuffer, contentBuffer)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime, 12)
    centralHeader.writeUInt16LE(dosDate, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(contentBuffer.length, 20)
    centralHeader.writeUInt32LE(contentBuffer.length, 24)
    centralHeader.writeUInt16LE(nameBuffer.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)

    centralParts.push(centralHeader, nameBuffer)

    offset += localHeader.length + nameBuffer.length + contentBuffer.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const localFiles = Buffer.concat(localParts)

  const endRecord = Buffer.alloc(22)
  endRecord.writeUInt32LE(0x06054b50, 0)
  endRecord.writeUInt16LE(0, 4)
  endRecord.writeUInt16LE(0, 6)
  endRecord.writeUInt16LE(files.length, 8)
  endRecord.writeUInt16LE(files.length, 10)
  endRecord.writeUInt32LE(centralDirectory.length, 12)
  endRecord.writeUInt32LE(localFiles.length, 16)
  endRecord.writeUInt16LE(0, 20)

  return Buffer.concat([localFiles, centralDirectory, endRecord])
}

function createWorkbook(sheets: WorksheetData[]): Buffer {
  const files = [
    { path: '[Content_Types].xml', content: contentTypesXml(sheets) },
    { path: '_rels/.rels', content: rootRelsXml() },
    { path: 'xl/workbook.xml', content: workbookXml(sheets) },
    { path: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml(sheets) },
    { path: 'xl/styles.xml', content: stylesXml() },
    ...sheets.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: worksheetXml(sheet.rows),
    })),
  ]

  return createZip(files)
}

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await verifyAdminSessionCookieValue(
      request.cookies.get(ADMIN_COOKIE_NAME)?.value
    )

    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Admin authentication required.' },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const range = request.nextUrl.searchParams.get('range')
    const exhibitorId = request.nextUrl.searchParams.get('exhibitorId')
    const q = request.nextUrl.searchParams.get('q')
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')
    const flow = getFlowFilter(request.nextUrl.searchParams.get('flow'))

    const rangeDays = hasCustomDateRange(startDate, endDate)
      ? undefined
      : getRangeDays(range)

    const summary = await getAnalyticsSummary({
      rangeDays,
      exhibitorId: exhibitorId?.trim() || undefined,
      searchQuery: q?.trim() || undefined,
      startDate: startDate?.trim() || undefined,
      endDate: endDate?.trim() || undefined,
      flow,
    })

    const filterLabel = [
      `Range: ${formatRangeLabel(range)}`,
      `Flow: ${formatFlowLabel(flow)}`,
      startDate || endDate
        ? `Dates: ${startDate || 'open'} to ${endDate || 'open'}`
        : 'Dates: all',
      q?.trim() ? `Search: ${q.trim()}` : 'Search: none',
      exhibitorId?.trim() ? `Exhibitor: ${exhibitorId.trim()}` : 'Exhibitor: all',
    ].join(' | ')

    const sheets: WorksheetData[] = [
      {
        name: 'Summary',
        rows: [
          ['ISE 2027 Analytics Summary'],
          [filterLabel],
          [],
          ['Metric', 'Value'],
          ['Total events', summary.totalEvents],
          ['Exhibitors seen', summary.totalExhibitors],
          ['Generator opens', summary.totalGeneratorOpens],
          ['Exports succeeded', summary.totalExportsSucceeded],
          ['Exports failed', summary.totalExportsFailed],
          ['Open to export conversion', summary.conversionRate],
          [
            'QR scans',
            summary.exhibitorSummaries.reduce(
              (sum, item) => sum + item.qrScannedCount,
              0
            ),
          ],
        ],
      },
      {
        name: 'Exhibitor Usage',
        rows: [
          ['Company name', 'Exhibitor ID', 'Total events', 'Links generated', 'Generator opens', 'Session verified', 'Export clicks', 'Exports succeeded', 'Exports failed', 'QR scans', 'Conversion rate', 'Generated link but never exported', 'PNG LinkedIn', 'PNG', 'PNG Email', 'PNG Print', 'PDF', 'ZIP', 'Last activity UK time'],
          ...summary.exhibitorSummaries.map((item) => [
            item.companyName,
            item.exhibitorId,
            item.totalEvents,
            item.linkGeneratedCount,
            item.generatorOpenedCount,
            item.sessionVerifiedCount,
            item.exportClickedCount,
            item.exportSucceededCount,
            item.exportFailedCount,
            item.qrScannedCount,
            percentage(item.exportSucceededCount, item.generatorOpenedCount),
            item.generatedLinkButNeverExported ? 'yes' : 'no',
            item.formats['png-linkedin'] ?? 0,
            item.formats['png-square'] ?? 0,
            item.formats['png-email'] ?? 0,
            item.formats['png-print'] ?? 0,
            item.formats.pdf ?? 0,
            item.formats.zip ?? 0,
            formatUkDate(item.lastActivityAt),
          ]),
        ],
      },
      {
        name: 'Recent Events',
        rows: [
          ['Timestamp UK time', 'Company name', 'Exhibitor ID', 'Event type', 'Format', 'Environment'],
          ...summary.recentEvents.map((event) => [
            formatUkDate(event.timestamp),
            event.companyName,
            event.exhibitorId,
            event.eventType,
            event.format ?? '',
            event.environment,
          ]),
        ],
      },
      {
        name: 'Format Usage',
        rows: [
          ['Format', 'Successful exports'],
          ...Object.entries(summary.formatUsage)
            .sort((a, b) => b[1] - a[1])
            .map(([format, count]) => [format, count]),
        ],
      },
    ]

    const workbook = createWorkbook(sheets)

    const customSuffix =
      startDate || endDate
        ? `-${startDate || 'open'}-to-${endDate || 'open'}`
        : ''

    const flowSuffix = flow === 'all' ? '' : `-${formatFlowLabel(flow)}`
    const fileName = `exhibitor-report-${formatRangeLabel(range)}${customSuffix}${flowSuffix}.xlsx`

    return new NextResponse(new Uint8Array(workbook), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    console.error('XLSX REPORT ERROR:', error)

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate XLSX report',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  }
}
