import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

/**
 * Device profile image: validate MIME + size, preview, and compress to WebP
 * data URL (spec §20). We validate by decoded image, not extension alone.
 */
export function ProfileImagePicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (dataUrl: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    if (!ACCEPTED.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP image.')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be smaller than 5 MB.')
      return
    }
    setBusy(true)
    try {
      const dataUrl = await compressImage(file, 512)
      onChange(dataUrl)
    } catch {
      setError('That image could not be processed. Try another file.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={cn(
          'relative flex size-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed',
          value ? 'border-transparent' : 'border-line bg-surface-secondary',
        )}
      >
        {value ? (
          <>
            <img src={value} alt="Selected profile" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove image"
              className="absolute right-1 top-1 rounded-full bg-surface/90 p-1 text-ink-secondary shadow-soft hover:text-danger"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <Upload className="size-7 text-ink-tertiary" aria-hidden />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void handleFile(f)
          e.target.value = ''
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={busy}
        onClick={() => inputRef.current?.click()}
        iconLeft={<Upload className="size-4" />}
      >
        {value ? 'Change photo' : 'Upload photo'}
      </Button>
      {error && (
        <p role="alert" className="text-center text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

/** Draw to canvas, downscale to max edge, export WebP data URL. */
async function compressImage(file: File, maxEdge: number): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no canvas context')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.85)
}
