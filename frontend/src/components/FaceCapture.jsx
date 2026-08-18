import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, RotateCcw } from 'lucide-react'

const POSES = [
  'Look straight at the camera',
  'Turn your head slightly left',
  'Turn your head slightly right',
  'Tilt your head slightly up',
  'Tilt your head slightly down',
]

function FaceCapture({ onComplete, onBack, isSubmitting }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [status, setStatus] = useState('idle')
  const [shots, setShots] = useState([])
  const [hasConsented, setHasConsented] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (status === 'ready' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [status])

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }

    setStatus('requesting')
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      setStatus('ready')
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        setStatus('denied')
      } else {
        setErrorMessage(error.message)
        setStatus('error')
      }
    }
  }

  function captureShot() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    const next = [...shots, canvas.toDataURL('image/jpeg', 0.85)]
    setShots(next)

    if (next.length >= POSES.length) {
      stopCamera()
      setStatus('review')
    }
  }

  function retake() {
    setShots([])
    startCamera()
  }

  return (
    <div className="flex flex-col gap-5">
      <canvas ref={canvasRef} className="hidden" />

      {status === 'idle' && (
        <>
          <p className="text-sm leading-relaxed text-slate">
            We'll take five short snapshots to enrol your face for attendance. Only a
            numeric representation is stored — the photographs themselves are not kept.
          </p>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-paper p-3">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(event) => setHasConsented(event.target.checked)}
              className="mt-0.5 accent-indigo"
            />
            <span className="text-sm leading-relaxed text-slate">
              I consent to my face data being processed for attendance, and understand
              I can request its deletion at any time.
            </span>
          </label>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onBack} className="px-4 py-2 text-sm text-slate hover:text-ink">
              Back
            </button>
            <button
              type="button"
              onClick={startCamera}
              disabled={!hasConsented}
              className="flex items-center gap-2 rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              <Camera size={16} />
              Start camera
            </button>
          </div>
        </>
      )}

      {status === 'requesting' && (
        <p className="text-sm text-slate">Waiting for camera permission…</p>
      )}

      {(status === 'denied' || status === 'unsupported' || status === 'error') && (
        <>
          <div className="flex items-start gap-3 rounded-md bg-absent-soft px-4 py-3 text-sm text-absent">
            <CameraOff size={18} className="mt-0.5 shrink-0" />
            <span>
              {status === 'denied' &&
                'Camera access was blocked. Enable it in your browser settings and try again.'}
              {status === 'unsupported' &&
                'This browser does not support camera access, or the page is not served over HTTPS.'}
              {status === 'error' && errorMessage}
            </span>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onBack} className="px-4 py-2 text-sm text-slate hover:text-ink">
              Back
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="rounded-md border border-line px-4 py-2 text-sm text-ink hover:border-indigo hover:text-indigo"
            >
              Try again
            </button>
          </div>
        </>
      )}

      {status === 'ready' && (
        <>
          <div className="overflow-hidden rounded-lg border border-line bg-ink">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-[4/3] w-full -scale-x-100 object-cover"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide text-slate">
              Shot {shots.length + 1} of {POSES.length}
            </span>
            <div className="flex gap-1.5">
              {POSES.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-6 rounded-full ${
                    index < shots.length ? 'bg-indigo' : 'bg-line'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="text-sm text-ink">{POSES[shots.length]}</p>

          <button
            type="button"
            onClick={captureShot}
            className="flex items-center justify-center gap-2 rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md"
          >
            <Camera size={16} />
            Capture
          </button>
        </>
      )}

      {status === 'review' && (
        <>
          <p className="text-sm text-slate">All five snapshots captured.</p>

          <div className="grid grid-cols-5 gap-2">
            {shots.map((shot, index) => (
              <img
                key={index}
                src={shot}
                alt={`Snapshot ${index + 1}`}
                className="aspect-square w-full rounded-md border border-line object-cover"
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
            <button
              type="button"
              onClick={retake}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate hover:text-ink disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Retake
            </button>
            <button
              type="button"
              onClick={() => onComplete(shots)}
              disabled={isSubmitting}
              className="rounded-md bg-indigo px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-dark hover:shadow-md disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? 'Enrolling…' : 'Finish registration'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default FaceCapture