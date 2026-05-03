import { pdf } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

type DownloadPdfDocumentParams = {
  document: ReactElement
  fileName: string
}

function buildDownloadUrl(blob: Blob) {
  return URL.createObjectURL(blob)
}

export async function downloadPdfDocument({
  document,
  fileName,
}: DownloadPdfDocumentParams) {
  const instance = pdf(document as Parameters<typeof pdf>[0])
  const blob = await instance.toBlob()
  const downloadUrl = buildDownloadUrl(blob)
  const anchor = window.document.createElement('a')

  anchor.href = downloadUrl
  anchor.download = fileName
  window.document.body.appendChild(anchor)
  anchor.click()
  window.document.body.removeChild(anchor)
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0)
}
