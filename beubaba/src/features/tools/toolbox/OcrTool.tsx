/**
 * OCR — extract text from a photo of notes or a question paper (spec §17).
 *
 * "OCR must be a real tool… Do not fake OCR results." So this runs Tesseract
 * genuinely, on the device. Nothing is uploaded, no API key is needed, and it
 * works offline once the engine has been fetched.
 *
 * Tesseract is ~2 MB, so it is imported dynamically — students who never open
 * this tool never download it.
 *
 * Covers every item the spec lists: image input, camera/file, extraction,
 * copy, clear/reset, error state, and readable output formatting.
 */
import { useRef, useState } from 'react'
import { Copy, Upload, Camera, X, Check, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/feedback/Toast'

type Status = 'idle' | 'working' | 'done' | 'error'

/** Tidy OCR output: strip stray blank lines and hyphen line-breaks. */
function tidy(raw: string): string {
  return raw
    .replace(/\r/g, '')
    .replace(/-\n(\w)/g, '$1')        // re-join words split across lines
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function OcrTool() {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [progress, setProgress] = useState(0)
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function run(file: File) {
    if (!file.type.startsWith('image/')) {
      setStatus('error')
      setError('That file is not an image. Choose a photo or a screenshot.')
      return
    }
    setStatus('working')
    setProgress(0)
    setError('')
    setText('')
    setPreview(URL.createObjectURL(file))

    try {
      // Loaded on demand: the engine is ~2 MB.
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100))
        },
      })
      const { data } = await worker.recognize(file)
      await worker.terminate()

      const cleaned = tidy(data.text ?? '')
      if (!cleaned) {
        setStatus('error')
        setError('No readable text found. Try a sharper, brighter photo taken straight on.')
        return
      }
      setText(cleaned)
      setStatus('done')
    } catch (e) {
      setStatus('error')
      setError(
        e instanceof Error && /network|fetch/i.test(e.message)
          ? 'Could not load the text engine. Connect once and it will work offline afterwards.'
          : 'Could not read that image. Please try another one.',
      )
    }
  }

  function reset() {
    setStatus('idle')
    setText('')
    setError('')
    setProgress(0)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Text copied.')
    } catch {
      toast.error('Could not copy. Select the text and copy manually.')
    }
  }

  const words = text ? text.trim().split(/\s+/).length : 0

  return (
    <div className="flex flex-col gap-4">
      <p className="text-body-sm text-ink-secondary">
        Take a photo of your notes or a question paper and pull the text out of it. The
        reading happens on your phone — the image is never uploaded.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void run(f)
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void run(f)
        }}
      />

      {status !== 'working' && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => cameraRef.current?.click()}>
            <Camera className="size-4" /> Take a photo
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" /> Choose an image
          </Button>
          {(text || preview || error) && (
            <Button variant="tertiary" onClick={reset}>
              <X className="size-4" /> Clear
            </Button>
          )}
        </div>
      )}

      {preview && (
        <img
          src={preview}
          alt="The image being read"
          className="max-h-48 w-full rounded-2xl object-contain ring-1 ring-line"
        />
      )}

      {status === 'working' && (
        <div className="rounded-2xl bg-surface-secondary px-4 py-4">
          <div className="flex items-center gap-2 text-body-sm text-ink">
            <Loader2 className="size-4 animate-spin text-accent" />
            Reading the image… {progress}%
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
          <p className="mt-1.5 text-label text-ink-tertiary">
            The first run downloads the engine once, then it works offline.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 rounded-2xl bg-surface-secondary px-4 py-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="text-body-sm text-ink">{error}</p>
            <div className="mt-2">
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                Try another image
              </Button>
            </div>
          </div>
        </div>
      )}

      {status === 'done' && (
        <div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-label text-ink-secondary">
              <Check className="size-4 text-success" /> {words} word{words === 1 ? '' : 's'} found
            </span>
            <Button variant="secondary" onClick={copy}>
              <Copy className="size-4" /> Copy
            </Button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            aria-label="Extracted text"
            className="selectable mt-2 w-full rounded-2xl bg-surface-secondary px-3 py-3 text-body-sm text-ink outline-none ring-1 ring-line focus:ring-accent"
          />
          <p className="mt-1 text-label text-ink-tertiary">
            You can fix any mistakes above before copying.
          </p>
        </div>
      )}
    </div>
  )
}
