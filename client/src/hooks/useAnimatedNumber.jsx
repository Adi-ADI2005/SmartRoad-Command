import { useState, useEffect, useRef } from 'react'

export function useAnimatedNumber(target, duration = 1200) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const from = 0

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(from + (target - from) * eased)
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

export default function AnimatedNumber({ end, duration = 1200, decimals = 0, suffix = '' }) {
  const val = useAnimatedNumber(end, duration)
  return <>{val.toFixed(decimals)}{suffix}</>
}
