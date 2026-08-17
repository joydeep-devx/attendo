import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

function TextType({ text, speed = 45, startDelay = 400, className = '' }) {
  const [count, setCount] = useState(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion) {
      setCount(text.length)
      return
    }

    setCount(0)
    let intervalId

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setCount((prev) => {
          if (prev >= text.length) {
            clearInterval(intervalId)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [text, speed, startDelay, reduceMotion])

  const isDone = count >= text.length

  return (
    <span className={`grid ${className}`} aria-label={text}>
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {text}
      </span>

      <span className="col-start-1 row-start-1" aria-hidden="true">
        {text.slice(0, count)}
        <span className={`text-ink ${isDone ? 'animate-blink' : ''}`}>|</span>
      </span>
    </span>
  )
}

export default TextType