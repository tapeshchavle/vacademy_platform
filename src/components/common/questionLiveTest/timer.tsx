'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
  duration: string 
}

export function Timer({ duration }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const [hours, minutes] = duration.split(':').map(Number)
    return (hours * 60 + minutes) * 60
  })

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  return (
    <div className="flex items-center gap-2 text-lg font-mono">
      <Clock className="h-5 w-5" />
      <span>
        {String(hours).padStart(2, '0')}:
        {String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}

