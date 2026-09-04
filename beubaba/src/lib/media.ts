/**
 * Shared client-side media helpers for uploads (report screenshots, resource
 * files, support attachments). We validate by MIME + size and, for images,
 * re-encode through a canvas so a spoofed extension can't smuggle a non-image
 * (spec §5, §28, §38). Non-image files (PDF) are kept as a validated data URL.
 *
 * In the mock backend a data URL stands in for a signed storage object; the
 * Supabase adapter will swap `dataUrl` for an uploaded object path + signed URL.
 */

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const DOC_TYPES = ['application/pdf']

export interface Attachment {
  name: string
  type: string
  size: number
  /** data URL (mock storage). Replaced by a storage path in the real backend. */
  dataUrl: string
  kind: 'image' | 'pdf'
}

export interface FileValidationOpts {
  accept?: string[]
  maxBytes?: number
}

export function validateFile(file: File, opts: FileValidationOpts = {}): string | null {
  const accept = opts.accept ?? [...IMAGE_TYPES, ...DOC_TYPES]
  const maxBytes = opts.maxBytes ?? 8 * 1024 * 1024
  if (!accept.includes(file.type)) {
    const human = accept.map((t) => t.split('/')[1].toUpperCase()).join(', ')
    return `Unsupported file. Allowed: ${human}.`
  }
  if (file.size > maxBytes) {
    return `File must be smaller than ${Math.round(maxBytes / (1024 * 1024))} MB.`
  }
  return null
}

/** Read any validated file to a data URL (used for PDF + as a fallback). */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })
}

/** Re-encode an image through a canvas, capping its longest edge. */
export function compressImage(file: File, maxEdge = 1280, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('no_ctx'))
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/webp', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode_failed'))
    }
    img.src = url
  })
}

/** Validate + process a file into an Attachment (image → compressed webp). */
export async function processAttachment(
  file: File,
  opts: FileValidationOpts = {},
): Promise<Attachment> {
  const err = validateFile(file, opts)
  if (err) throw new Error(err)
  const isImage = IMAGE_TYPES.includes(file.type)
  const dataUrl = isImage ? await compressImage(file) : await fileToDataUrl(file)
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    dataUrl,
    kind: isImage ? 'image' : 'pdf',
  }
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
