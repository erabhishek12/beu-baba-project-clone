import { useRef, useState } from 'react'
import { Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react'
import { processAttachment, humanSize, IMAGE_TYPES, DOC_TYPES } from '@/lib/media'
import type { Attachment } from '@/lib/media'
import { cn } from '@/lib/cn'

/**
 * Reusable attachment picker for reports / resources / support (spec §28, §38).
 * Validates MIME + size, compresses images, and previews the chosen file.
 * Non-image files (PDF) show a document chip.
 */
export function AttachmentPicker({
  value,
  onChange,
  accept = [...IMAGE_TYPES, ...DOC_TYPES],
  maxBytes = 8 * 1024 * 1024,
  label = 'Add attachment',
  hint,
}: {
  value: Attachment | null
  onChange: (a: Attachment | null) => void
  accept?: string[]
  maxBytes?: number
  label?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(file: File) {
    setError(null)
    setBusy(true)
    try {
      const attachment = await processAttachment(file, { accept, maxBytes })
      onChange(attachment)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That file could not be processed.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-secondary/60 p-3">
        {value.kind === 'image' ? (
          <img
            src={value.dataUrl}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <FileText className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-medium text-ink">{value.name}</p>
          <p className="text-caption text-ink-tertiary">{humanSize(value.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove attachment"
          className="rounded-full p-1.5 text-ink-tertiary hover:bg-surface hover:text-danger"
        >
          <X className="size-5" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-secondary/40 px-4 py-3 text-body-sm font-semibold text-ink-secondary transition-colors hover:border-accent/50 hover:text-ink',
          busy && 'opacity-60',
        )}
      >
        {accept.every((a) => IMAGE_TYPES.includes(a)) ? (
          <ImageIcon className="size-5" aria-hidden />
        ) : (
          <Paperclip className="size-5" aria-hidden />
        )}
        {busy ? 'Processing…' : label}
      </button>
      {hint && !error && <p className="mt-1.5 text-caption text-ink-tertiary">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-caption text-danger" role="alert">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />
    </div>
  )
}
