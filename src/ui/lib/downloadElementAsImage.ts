'use client'

import html2canvas from 'html2canvas'

type DownloadElementAsImageParams = {
  backgroundColor?: string
  element: HTMLElement
  fileName: string
  scale?: number
}

function triggerDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(objectUrl)
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('No se pudo generar la imagen PNG.'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

export async function downloadElementAsImage({
  backgroundColor = '#ffffff',
  element,
  fileName,
  scale = 2,
}: DownloadElementAsImageParams) {
  if ('fonts' in document) {
    await document.fonts.ready
  }

  const rect = element.getBoundingClientRect()
  const width = Math.max(Math.ceil(rect.width), element.scrollWidth, element.offsetWidth)
  const height = Math.max(Math.ceil(rect.height), element.scrollHeight, element.offsetHeight)

  if (width <= 0 || height <= 0) {
    throw new Error('El contenido todavía no está listo para exportar.')
  }

  const clone = element.cloneNode(true) as HTMLElement
  clone.style.margin = '0'
  clone.style.width = `${width}px`
  clone.style.height = `${height}px`
  clone.style.maxWidth = 'none'

  const stage = document.createElement('div')
  stage.style.position = 'fixed'
  stage.style.left = '-20000px'
  stage.style.top = '0'
  stage.style.width = `${width}px`
  stage.style.height = `${height}px`
  stage.style.padding = '0'
  stage.style.margin = '0'
  stage.style.background = backgroundColor
  stage.style.pointerEvents = 'none'
  stage.style.zIndex = '-1'
  stage.appendChild(clone)
  document.body.appendChild(stage)

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor,
      imageTimeout: 0,
      logging: false,
      scale,
      useCORS: true,
      allowTaint: false,
      width,
      height,
      windowWidth: Math.max(width, window.innerWidth),
      windowHeight: Math.max(height, window.innerHeight),
    })
    const pngBlob = await canvasToBlob(canvas)
    triggerDownload(pngBlob, fileName)
  } finally {
    document.body.removeChild(stage)
  }
}
