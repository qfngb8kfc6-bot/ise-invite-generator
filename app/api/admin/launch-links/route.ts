import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { signLaunch } from '@/lib/launch-signature'
import { env } from '@/lib/env'
import { getAllExhibitors } from '@/lib/exhibitors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function escapeCsv(value: string): string {
  const normalized = value.replace(/"/g, '""')
  return `"${normalized}"`
}

function buildLaunchUrl(exhibitorId: string): string {
  const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')
  const sig = signLaunch(exhibitorId)

  return `${baseUrl}/launch/${encodeURIComponent(exhibitorId)}?sig=${encodeURIComponent(sig)}`
}

function getRequestedFormat(request: NextRequest): 'csv' | 'xlsx' {
  const format = request.nextUrl.searchParams.get('format')?.trim().toLowerCase()

  if (format === 'csv') {
    return 'csv'
  }

  if (format === 'xlsx') {
    return 'xlsx'
  }

  return 'xlsx'
}

function buildCsv(exhibitors: Awaited<ReturnType<typeof getAllExhibitors>>): string {
  const csvLines = [
    'exhibitor_id,company_name,stand_number,launch_url',
    ...exhibitors.map((exhibitor) =>
      [
        escapeCsv(exhibitor.id),
        escapeCsv(exhibitor.companyName),
        escapeCsv(exhibitor.standNumber),
        escapeCsv(buildLaunchUrl(exhibitor.id)),
      ].join(',')
    ),
  ]

  return csvLines.join('\n')
}

async function buildXlsxBlob(
  exhibitors: Awaited<ReturnType<typeof getAllExhibitors>>
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Launch Links')

  worksheet.columns = [
    { header: 'Exhibitor ID', key: 'exhibitorId', width: 18 },
    { header: 'Company Name', key: 'companyName', width: 40 },
    { header: 'Stand Number', key: 'standNumber', width: 18 },
    { header: 'Launch URL', key: 'launchUrl', width: 80 },
  ]

  worksheet.getRow(1).font = { bold: true }

  for (const exhibitor of exhibitors) {
    worksheet.addRow({
      exhibitorId: exhibitor.id,
      companyName: exhibitor.companyName,
      standNumber: exhibitor.standNumber,
      launchUrl: buildLaunchUrl(exhibitor.id),
    })
  }

  worksheet.views = [{ state: 'frozen', ySplit: 1 }]
  worksheet.autoFilter = {
    from: 'A1',
    to: 'D1',
  }

  const launchUrlColumn = worksheet.getColumn(4)

  launchUrlColumn.eachCell((cell, rowNumber) => {
    if (rowNumber === 1) {
      return
    }

    const value = String(cell.value ?? '').trim()

    if (!value) {
      return
    }

    cell.value = {
      text: value,
      hyperlink: value,
    }

    cell.font = {
      color: { argb: 'FF0563C1' },
      underline: true,
    }
  })

  const fileData = await workbook.xlsx.writeBuffer()

  return new Blob([fileData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function GET(request: NextRequest) {
  try {
    const exhibitors = await getAllExhibitors()

    if (exhibitors.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No exhibitors returned from MYS',
        },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const format = getRequestedFormat(request)

    if (format === 'csv') {
      const csv = buildCsv(exhibitors)

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ebo-launch-links.csv"',
          'Cache-Control': 'no-store',
        },
      })
    }

    const xlsxBlob = await buildXlsxBlob(exhibitors)

    return new Response(xlsxBlob, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ebo-launch-links.xlsx"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('BULK MYS LAUNCH LINK EXPORT ERROR:', error)

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate launch-link export from MYS',
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