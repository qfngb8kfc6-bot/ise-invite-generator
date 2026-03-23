import QRCode from 'qrcode'

export async function makeQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    width: 220,
    margin: 1,
  })
}