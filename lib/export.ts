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
    fileLabel: 'full-size',
    width: 1080,
    height: 1080,
    pixelRatio: 2,
  },
  email: {
    key: 'email',
    width: 1200,
    height: 300,
    fileLabel: 'email-banner',
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

function getActualExportNode(node: HTMLElement): HTMLElement {
  const firstChild = node.firstElementChild

  if (firstChild instanceof HTMLElement) {
    return firstChild
  }

  return node
}

function getNodeExportSize(node: HTMLElement) {
  const exportNode = getActualExportNode(node)
  const rect = exportNode.getBoundingClientRect()

  return {
    node: exportNode,
    width: Math.ceil(rect.width || exportNode.offsetWidth || exportNode.scrollWidth),
    height: Math.ceil(rect.height || exportNode.offsetHeight || exportNode.scrollHeight),
  }
}

async function renderNodeToBasePng(node: HTMLElement): Promise<{
  dataUrl: string
  width: number
  height: number
}> {
  const size = getNodeExportSize(node)

  const dataUrl = await toPng(size.node, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    width: size.width,
    height: size.height,
    canvasWidth: size.width,
    canvasHeight: size.height,
    pixelRatio: 2,
    style: {
      margin: '0',
      boxShadow: 'none',
      transform: 'none',
    },
  })

  return {
    dataUrl,
    width: size.width,
    height: size.height,
  }
}

async function renderPngForFormat(
  node: HTMLElement,
  format: ExportFormatKey
): Promise<Blob> {
  const config = EXPORT_FORMATS[format]
  const size = getNodeExportSize(node)

  const shouldUseExactCardSize = format === 'square' || format === 'print'

  const width = shouldUseExactCardSize ? size.width : config.width
  const height = shouldUseExactCardSize ? size.height : config.height

  const dataUrl = await toPng(size.node, {
    cacheBust: true,
    backgroundColor: '#ffffff',
    width,
    height,
    canvasWidth: width,
    canvasHeight: height,
    pixelRatio: config.pixelRatio,
    style: {
      margin: '0',
      boxShadow: 'none',
      transform: 'none',
    },
  })

  return dataUrlToBlob(dataUrl)
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
  const rendered = await renderNodeToBasePng(node)

  const pdf = new jsPDF({
    orientation: rendered.width >= rendered.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [rendered.width, rendered.height],
    compress: true,
  })

  pdf.addImage(rendered.dataUrl, 'PNG', 0, 0, rendered.width, rendered.height)
  pdf.save(`${baseName}.pdf`)
}

export async function exportZipPack(
  node: HTMLElement,
  baseName: string,
  emailNode?: HTMLElement,
  squareNode?: HTMLElement,
  linkedinNode?: HTMLElement
) {
  const zip = new JSZip()

  for (const format of Object.keys(EXPORT_FORMATS) as ExportFormatKey[]) {
    const sourceNode =
      format === 'email' && emailNode
        ? emailNode
        : format === 'square' && squareNode
          ? squareNode
          : format === 'linkedin' && linkedinNode
            ? linkedinNode
            : node

    const blob = await renderPngForFormat(sourceNode, format)
    zip.file(`${baseName}-${EXPORT_FORMATS[format].fileLabel}.png`, blob)
  }

  const rendered = await renderNodeToBasePng(node)

  const pdf = new jsPDF({
    orientation: rendered.width >= rendered.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [rendered.width, rendered.height],
    compress: true,
  })

  pdf.addImage(rendered.dataUrl, 'PNG', 0, 0, rendered.width, rendered.height)

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
