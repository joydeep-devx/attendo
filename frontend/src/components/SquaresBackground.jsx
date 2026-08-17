import { useEffect, useRef } from 'react'

function SquaresBackground({
  squareSize = 44,
  speed = 0.3,
  borderColor="#e8e6e0",
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let frameId
    let offset = 0

    function resize() {
      const dpr = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      const { width, height } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = borderColor
      ctx.lineWidth = 1

      const shift = offset % squareSize

      ctx.beginPath()
      for (let x = -squareSize + shift; x < width + squareSize; x += squareSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = -squareSize + shift; y < height + squareSize; y += squareSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      offset += speed
      frameId = requestAnimationFrame(draw)
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    resize()
    window.addEventListener('resize', resize)

    if (prefersReduced) {
      draw()
      cancelAnimationFrame(frameId)
    } else {
      draw()
    }

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [squareSize, speed, borderColor])

  return <canvas ref={canvasRef} className="h-full w-full" />
}

export default SquaresBackground