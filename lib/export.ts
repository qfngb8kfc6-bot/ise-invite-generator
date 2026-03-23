import { toPng } from 'html-to-image'
import JSZip from 'jszip'
import { jsPDF } from 'jspdf'

export type ExportFormatKey = 'linkedin' | 'square' | 'email' | 'print'

type ExportFormatConfig = {
  key: ExportFormatKey
  fileLabel: string
  width: number
  height: number
  pixelRatio: number
}

const EXPORT_FORMATS: Record<ExportFormatKey, ExportFormatConfig> = {
  linkedin: {
    key: 'linkedin',
    fileLabel: 'linkedin',
    width: 1200,
    height: 627,
    pixelRatio: 2,
  },
  square: {
    key: 'square',
    fileLabel: 'square',
    width: 1080,
    height: 1080,
    pixelRatio: 2,
  },
  email: {
    key: 'email',
    width: 1200,
    height: 627,
    fileLabel: 'email',
    pixelRatio: 2,
  },
  print: {
    key: 'print',
    fileLabel: 'print',
    width: 2400,
    height: 1254,
    pixelRatio: 2,
  },
}

function safeFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  if (parts.length !== 2) {
    throw new Error('Invalid data URL')
  }

  const match = parts[0].match(/data:(.*?);base64/)
  if (!match) {
    throw new Error('Invalid data URL mime type')
  }

  const mime = match[1]
  const binary = atob(parts[1])
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return new Blob([bytes], { type: mime })
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load generated image'))
    img.src = src
  })
}

async function renderNodeToBasePng(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  })
}

async function renderPngForFormat(
  node: HTMLElement,
  format: ExportFormatKey
): Promise<Blob> {
  const config = EXPORT_FORMATS[format]

  if (format !== 'square') {
    const dataUrl = await toPng(node, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      width: config.width,
      height: config.height,
      canvasWidth: config.width,
      canvasHeight: config.height,
      pixelRatio: config.pixelRatio,
    })

    return dataUrlToBlob(dataUrl)
  }

  const baseDataUrl = await renderNodeToBasePng(node)
  const image = await loadImage(baseDataUrl)

  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to create canvas context')
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const padding = 70
  const targetWidth = canvas.width - padding * 2
  const targetHeight = Math.round((image.height / image.width) * targetWidth)
  const x = padding
  const y = Math.round((canvas.height - targetHeight) / 2)

  ctx.drawImage(image, x, y, targetWidth, targetHeight)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), 'image/png')
  })

  if (!blob) {
    throw new Error('Failed to generate square PNG')
  }

  return blob
}

export async function exportPng(
  node: HTMLElement,
  format: ExportFormatKey,
  baseName: string
) {
  const blob = await renderPngForFormat(node, format)
  const config = EXPORT_FORMATS[format]
  triggerBlobDownload(blob, `${baseName}-${config.fileLabel}.png`)
}

export async function exportPdf(node: HTMLElement, baseName: string) {
  const pngDataUrl = await renderNodeToBasePng(node)
  const image = await loadImage(pngDataUrl)

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24

  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2

  const imageRatio = image.width / image.height
  let renderWidth = usableWidth
  let renderHeight = renderWidth / imageRatio

  if (renderHeight > usableHeight) {
    renderHeight = usableHeight
    renderWidth = renderHeight * imageRatio
  }

  const x = (pageWidth - renderWidth) / 2
  const y = (pageHeight - renderHeight) / 2

  pdf.addImage(pngDataUrl, 'PNG', x, y, renderWidth, renderHeight)
  pdf.save(`${baseName}.pdf`)
}

export async function exportZipPack(node: HTMLElement, baseName: string) {
  const zip = new JSZip()

  for (const format of Object.keys(EXPORT_FORMATS) as ExportFormatKey[]) {
    const blob = await renderPngForFormat(node, format)
    zip.file(`${baseName}-${EXPORT_FORMATS[format].fileLabel}.png`, blob)
  }

  const pdfDataUrl = await renderNodeToBasePng(node)
  const image = await loadImage(pdfDataUrl)

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 24

  const usableWidth = pageWidth - margin * 2
  const usableHeight = pageHeight - margin * 2
  const imageRatio = image.width / image.height

  let renderWidth = usableWidth
  let renderHeight = renderWidth / imageRatio

  if (renderHeight > usableHeight) {
    renderHeight = usableHeight
    renderWidth = renderHeight * imageRatio
  }

  const x = (pageWidth - renderWidth) / 2
  const y = (pageHeight - renderHeight) / 2

  pdf.addImage(pdfDataUrl, 'PNG', x, y, renderWidth, renderHeight)

  zip.file(`${baseName}.pdf`, pdf.output('blob'))

  const zipBlob = await zip.generateAsync({
    type: 'blob',
  })

  triggerBlobDownload(zipBlob, `${baseName}-marketing-pack.zip`)
}

export function makeExportBaseName(companyName: string, standNumber: string) {
  const company = safeFilePart(companyName || 'exhibitor-invite')
  const stand = safeFilePart(standNumber || 'stand')
  return `${company}-${stand}-invite`
}